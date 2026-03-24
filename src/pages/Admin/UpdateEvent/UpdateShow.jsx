import { useParams } from "react-router-dom";
import Modal from "../../../components/common/Modal";
import { useEffect, useState } from "react";
import z from "zod";
import axiosClient from "../../../api/axiosClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import TicketTypeModal from "../../../components/modals/TicketTypeModal";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import StatusShowBadge from "../../../components/common/StatusBadge";
import StatusBadge from "../../../components/common/StatusBadge";

const ticketTierSchema = z
  .object({
    id: z.string(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
    name: z.string().min(1, "Tên tier không được để trống"),
    price: z.coerce.number().min(0, "Giá không được âm"),
    limitQuantity: z.coerce.number().min(1, "Số lượng tối thiểu là 1"),
    saleStartTime: z
      .string()
      .min(1, "Vui lòng chọn thời gian bắt đầu")
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/,
        "Định dạng thời gian không hợp lệ",
      ),
    saleEndTime: z
      .string()
      .min(1, "Vui lòng chọn thời gian kết thúc")
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/,
        "Định dạng thời gian không hợp lệ",
      ),
    description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.saleStartTime).getTime();
      const end = new Date(data.saleEndTime).getTime();
      return isNaN(start) || isNaN(end) || end > start;
    },
    {
      message: "Thời gian kết thúc bán phải sau thời gian bắt đầu",
      path: ["saleEndTime"],
    },
  );

const ticketTypeSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "Tên vé không được để trống")
    .max(50, "Tên vé tối đa 50 ký tự"),
  seatingType: z.enum(["SEATED", "STANDING"], {
    required_error: "Vui lòng chọn hình thức chỗ ngồi",
  }),
  totalQuantity: z.coerce.number().min(1, "Số lượng tối thiểu là 1"),
  sectionId: z.string().optional().nullable(),
  ticketTiers: z
    .array(ticketTierSchema)
    .min(1, "Phải có ít nhất một đợt mở bán (Tier)")
    .superRefine((tiers, ctx) => {
      const overlaps = {};

      for (let i = 0; i < tiers.length; i++) {
        if (tiers[i].status === "INACTIVE") continue;
        const s1 = new Date(tiers[i].saleStartTime).getTime();
        const e1 = new Date(tiers[i].saleEndTime).getTime();
        if (isNaN(s1) || isNaN(e1)) continue;

        for (let j = i + 1; j < tiers.length; j++) {
          if (tiers[j].status === "INACTIVE") continue;
          const s2 = new Date(tiers[j].saleStartTime).getTime();
          const e2 = new Date(tiers[j].saleEndTime).getTime();
          if (isNaN(s2) || isNaN(e2)) continue;

          if (s1 < e2 && e1 > s2) {
            if (!overlaps[i]) overlaps[i] = new Set();
            overlaps[i].add(tiers[j].name || `đợt ${j + 1}`);

            if (!overlaps[j]) overlaps[j] = new Set();
            overlaps[j].add(tiers[i].name || `đợt ${i + 1}`);
          }
        }
      }

      Object.keys(overlaps).forEach((index) => {
        const names = Array.from(overlaps[index]).join(", ");
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Thời gian trùng với: ${names}`,
          path: [parseInt(index), "saleStartTime"], // Bạn có thể báo ở Start hoặc End tùy ý
        });
      });
    }),
});

const showSchema = z
  .object({
    id: z.string(),
    status: z.string().optional(),
    minOrder: z.preprocess(
      (val) =>
        val === "" || val === undefined || val === null ? 0 : Number(val),
      z
        .number({ invalid_type_error: "Vui lòng nhập số" })
        .min(1, "Số lượng tối thiểu mỗi đơn phải lớn hơn hoặc bằng 1"),
    ),
    maxOrder: z.preprocess(
      (val) =>
        val === "" || val === undefined || val === null ? 0 : Number(val),
      z
        .number({ invalid_type_error: "Vui lòng nhập số" })
        .min(1, "Số lượng tối đa mỗi đơn phải lớn hơn hoặc bằng 1"),
    ),
    startTime: z.preprocess(
      (val) => (val === null || val === undefined ? "" : String(val)),
      z.string().min(1, { message: "Vui lòng chọn thời gian bắt đầu" }),
    ),
    endTime: z.preprocess(
      (val) => (val === null || val === undefined ? "" : String(val)),
      z.string().min(1, { message: "Vui lòng chọn thời gian kết thúc" }),
    ),
    seatMapType: z.string().min(1, { message: "Vui lòng chọn sơ đồ ghế" }),
    seatMapSvg: z.string().nullable().optional(),
    ticketTypes: z.array(ticketTypeSchema).min(1, {
      message: "Phải có ít nhất 1 loại vé cho suất diễn này",
    }),
  })
  .refine((data) => data.maxOrder >= data.minOrder, {
    message: "Số lượng tối đa không được nhỏ hơn tối thiểu",
    path: ["maxOrder"],
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime).getTime();
    const end = new Date(data.endTime).getTime();

    // Kiểm tra thời gian bắt đầu/kết thúc suất diễn
    if (!isNaN(start) && !isNaN(end) && end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
        path: ["endTime"],
      });
    }

    // Kiểm tra Sơ đồ SVG nếu cần
    const typesRequireSvg = ["SECTION_WITH_SEATS", "SECTION_ONLY"];
    if (typesRequireSvg.includes(data.seatMapType)) {
      if (!data.seatMapSvg || data.seatMapSvg.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng cấu hình sơ đồ ghế cho loại hình này",
          path: ["seatMapSvg"],
        });
      }
    }

    // Kiểm tra Logic giữa Vé (Tier) và Suất diễn (StartTime)
    if (!isNaN(start)) {
      data.ticketTypes.forEach((ticketType, tIdx) => {
        ticketType.ticketTiers.forEach((tier, tierIdx) => {
          const tierEnd = new Date(tier.saleEndTime).getTime();
          const tierStart = new Date(tier.saleStartTime).getTime();

          // Tier end phải sau Tier start
          if (tierEnd <= tierStart) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Thời gian kết thúc phải sau thời gian bắt đầu",
              path: [
                "ticketTypes",
                tIdx,
                "ticketTiers",
                tierIdx,
                "saleEndTime",
              ],
            });
          }

          // Vé phải ngừng bán trước khi diễn ra
          if (tierEnd > start) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Vé phải kết thúc bán trước khi suất diễn bắt đầu",
              path: [
                "ticketTypes",
                tIdx,
                "ticketTiers",
                tierIdx,
                "saleEndTime",
              ],
            });
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Suất diễn bắt đầu này đang sớm hơn thời gian bán vé`,
              path: ["startTime"],
            });
          }
        });

        // Kiểm tra khu vực (sectionId) nếu chọn sơ đồ
        if (
          typesRequireSvg.includes(data.seatMapType) &&
          !ticketType.sectionId
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng chọn khu vực trên sơ đồ",
            path: ["ticketTypes", tIdx, "sectionId"],
          });
        }
      });
    }
  });

const showsSchema = z
  .array(showSchema)
  .min(1, { message: "Phải có ít nhất một suất diễn" })
  .superRefine((shows, ctx) => {
    const overlapMap = new Map();

    for (let i = 0; i < shows.length; i++) {
      const s1 = new Date(shows[i].startTime).getTime();
      const e1 = new Date(shows[i].endTime).getTime();
      if (isNaN(s1) || isNaN(e1)) continue;

      for (let j = i + 1; j < shows.length; j++) {
        const s2 = new Date(shows[j].startTime).getTime();
        const e2 = new Date(shows[j].endTime).getTime();
        if (isNaN(s2) || isNaN(e2)) continue;

        if (s1 < e2 && e1 > s2) {
          if (!overlapMap.has(i)) overlapMap.set(i, new Set());
          overlapMap.get(i).add(`Suất ${j + 1}`);

          if (!overlapMap.has(j)) overlapMap.set(j, new Set());
          overlapMap.get(j).add(`Suất ${i + 1}`);
        }
      }
    }

    overlapMap.forEach((conflicts, index) => {
      const conflictList = Array.from(conflicts).join(", ");
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Thời gian bị trùng với: ${conflictList}`,
        path: [index, "startTime"],
      });
    });
  });

function UpdateShow() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const seatMapType = [
    {
      id: "NONE",
      label: "Không sơ đồ",
      desc: "Vé tự do, vé đứng...",
      icon: "layers_clear",
    },
    {
      id: "SECTION_ONLY",
      label: "Theo khu vực",
      desc: "Chia khu, không số ghế",
      icon: "grid_view",
    },
    {
      id: "SECTION_WITH_SEATS",
      label: "Sơ đồ ghế",
      desc: "Chọn chính xác vị trí ghế",
      icon: "event_seat",
    },
  ];
  const methods = useForm({
    resolver: zodResolver(z.object({ shows: showsSchema })),
    defaultValues: {
      shows: [],
    },
    mode: "onChange",
  });

  const {
    reset,
    setValue,
    handleSubmit,
    trigger,
    setError,
    formState: { errors },
  } = methods;
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeShowId, setActiveShowId] = useState(null);
  const [activeShowIndex, setActiveShowIndex] = useState(null);
  const [activeTicketTypeIndex, setActiveTicketTypeIndex] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [shows, setShows] = useState([]);
  const [initialData, setInitialData] = useState([]);

  useEffect(() => {
    setValue("shows", shows, { shouldValidate: true });
  }, [shows, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const showsRes = await axiosClient.get(`/events/${id}/shows`);
        const processedShows = showsRes.data.map((show) => {
          if (show.seatMapSvg && show.seatMapSvg.trim() !== "") {
            const sections = extractSectionsFromSvg(show.seatMapSvg);
            return {
              ...show,
              sections: sections.map((s) => ({
                sectionId: s.id,
                sectionName: s.label,
              })),
            };
          }

          return {
            ...show,
            sections: [],
          };
        });
        setInitialData(processedShows);
        setShows(processedShows);
        reset({ shows: processedShows });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, reset]);

  const updateShow = (showId, updatedData) => {
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id !== showId) return show;
        if (
          updatedData.seatMapType &&
          updatedData.seatMapType !== show.seatMapType
        ) {
          return {
            ...show,
            seatMapType: updatedData.seatMapType,
            seatMapSvg: "",
            sections: [],
            ticketTypes: show.ticketTypes.map((ticketType) => ({
              ...ticketType,
              sectionId: "",
            })),
          };
        }

        return { ...show, ...updatedData };
      }),
    );
  };

  const addShow = () => {
    const newShow = {
      id: crypto.randomUUID(),
      ticketTypes: [],
      seatMapType: "NONE",
      status: "DRAFT",
      seatMapSvg: "",
    };
    const newShowsList = [...shows, newShow];
    setShows(newShowsList);
  };

  const removeShow = (showId) => {
    if (shows.length > 0) {
      setShows(shows.filter((s) => s.id !== showId));
    }
  };

  const handleAddShow = async () => {
    if (shows.length === 0) {
      addShow();
      return;
    }
    const isValid = await trigger("shows");
    if (isValid) {
      addShow();
    }
  };

  const handleOpenAddTicket = async (showId, index) => {
    await trigger(`shows.${index}`);
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id === showId) {
          return {
            ...show,
            ticketTypes: [
              ...show.ticketTypes,
              {
                id: crypto.randomUUID(),
                name: "",
                seatingType: "SEATED",
                totalQuantity: 0,
                ticketTiers: [],
              },
            ],
          };
        }
        return show;
      }),
    );
    setActiveShowId(showId);
    setEditingTicket(null);
  };

  const openEditTicket = (showId, ticketType, showIndex, ticketTypeIndex) => {
    setActiveShowIndex(showIndex);
    setActiveTicketTypeIndex(ticketTypeIndex);
    setActiveShowId(showId);
    setEditingTicket(ticketType);
    setIsModalOpen(true);
  };

  const handleSaveTicket = (ticketData) => {
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id === activeShowId) {
          if (editingTicket) {
            return {
              ...show,
              ticketTypes: show.ticketTypes.map((t) =>
                t.id === editingTicket.id ? { ...ticketData, id: t.id } : t,
              ),
            };
          } else {
            return {
              ...show,
              ticketTypes: [
                ...show.ticketTypes,
                { ...ticketData, id: crypto.randomUUID() },
              ],
            };
          }
        }
        return show;
      }),
    );
    setIsModalOpen(false);
  };

  const deleteTicket = (showId, ticketTypeId) => {
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id === showId) {
          return {
            ...show,
            ticketTypes: show.ticketTypes.filter((t) => t.id !== ticketTypeId),
          };
        }
        return show;
      }),
    );
  };

  const handleSvgUpload = (showId, file) => {
    if (!file || file.type !== "image/svg+xml") {
      alert("Vui lòng tải lên file định dạng .svg");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target.result;
      const sections = extractSectionsFromSvg(svgContent);
      updateShow(showId, {
        seatMapSvg: svgContent,
        sections: sections.map((s) => ({
          sectionId: s.id,
          sectionName: s.label,
        })),
      });
    };
    reader.readAsText(file);
  };

  const extractSectionsFromSvg = (svgContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const elements = doc.querySelectorAll('[id^="section-"]');

    return Array.from(elements).map((el) => {
      const rawId = el.id;
      const cleanLabel =
        el.getAttribute("data-name") || rawId.replace("section-", "");
      return {
        id: rawId,
        label: cleanLabel,
      };
    });
  };

  const onSubmit = (data) => {
    const formData = {
      ...data,
      shows: data.shows.map((show) => ({
        ...show,
        id: show.id?.includes("-") ? null : show.id,
        ticketTypes: show.ticketTypes.map((type) => ({
          ...type,
          id: type.id?.includes("-") ? null : type.id,
          ticketTiers: type.ticketTiers.map((tier) => ({
            ...tier,
            id: tier.id?.includes("-") ? null : tier.id,
          })),
        })),
      })),
    };
    console.log("Dữ liệu submit", formData);
  };

  const saveShow = async (index) => {
    try {
      const isValid = await trigger("shows");
      if (!isValid) return;
      const show = methods.getValues(`shows.${index}`);
      const payload = {
        ...show,
        id: show.id?.includes("-") ? null : show.id,
        ticketTypes: show.ticketTypes.map((type) => {
          const mappedType = {
            ...type,
            id: type.id?.includes("-") ? null : type.id,
            ticketTiers: type.ticketTiers.map((tier) => ({
              ...tier,
              id: tier.id?.includes("-") ? null : tier.id,
            })),
          };
          if (
            show.seatMapType === "SECTION_WITH_SEATS" &&
            type.seatingType === "SEATED"
          ) {
            mappedType.seats = type.seats?.map((seat) => ({
              ...seat,
              id: seat?.id?.includes("-") ? null : seat.id,
            }));
          } else {
            delete mappedType.seats;
          }
          return mappedType;
        }),
      };
      if (isLoading) return;
      if (!payload.id) {
        // CREATE
        try {
          console.log("Dữ liệu show submit for create:", payload);
          setIsLoading(index);
          const showRes = await axiosClient.post(
            `/events/${id}/shows`,
            payload,
          );
          const savedShow = showRes.data;
          setShows((prev) => prev.map((s, i) => (i === index ? savedShow : s)));
          setValue(`shows.${index}`, savedShow, {
            shouldValidate: false,
          });
          setInitialData((prev) => {
            const updated = [...prev];
            updated[index] = savedShow;
            return updated;
          });
          setModal({
            isOpen: true,
            title: "Thêm mới suất diễn",
            message: "Thêm mới suất diễn thành công.",
            type: "success",
          });
        } catch (error) {
          if (
            error.code === "SHOWS_VALIDATION_ERROR" ||
            error.code === "VALIDATION_ERROR"
          ) {
            const serverErrors = error.details;
            Object.entries(serverErrors).forEach(([field, message]) => {
              setError(`shows.${index}.${field}`, {
                type: "server",
                message,
              });
            });
            setModal({
              isOpen: true,
              title: "Thêm mới suất diễn",
              message: "Thêm mới suất diễn thất bại: " + error.message,
              type: "error",
            });
            return;
          }
          setModal({
            isOpen: true,
            title: "Thêm mới suất diễn",
            message: "Thêm mới suất diễn thất bại: " + error.message,
            type: "error",
          });
          console.error("Thêm mới suất diễn thất bại:", error.message);
        } finally {
          setIsLoading(null);
        }
      } else {
        // UPDATE
        try {
          console.log("Dữ liệu show submit for update:", payload);
          setIsLoading(index);
          const showRes = await axiosClient.put(
            `/events/${id}/shows/${payload?.id}`,
            payload,
          );
          const savedShow = showRes.data;
          setShows((prev) => prev.map((s, i) => (i === index ? savedShow : s)));
          setValue(`shows.${index}`, savedShow, {
            shouldValidate: false,
          });
          setInitialData((prev) => {
            const updated = [...prev];
            updated[index] = savedShow;
            return updated;
          });
          setModal({
            isOpen: true,
            title: "Cập nhật suất diễn",
            message: "Cập nhật suất diễn thành công.",
            type: "success",
          });
        } catch (error) {
          if (
            error.code === "SHOWS_VALIDATION_ERROR" ||
            error.code === "VALIDATION_ERROR"
          ) {
            const serverErrors = error.details;
            Object.entries(serverErrors).forEach(([field, message]) => {
              setError(`shows.${index}.${field}`, {
                type: "server",
                message,
              });
            });
            setModal({
              isOpen: true,
              title: "Cập nhật suất diễn",
              message: "Cập nhật suất diễn thất bại: " + error.message,
              type: "error",
            });
            return;
          }
          setModal({
            isOpen: true,
            title: "Cập nhật suất diễn",
            message: "Cập nhật suất diễn thất bại: " + error.message,
            type: "error",
          });
          console.error("Cập nhật suất diễn thất bại:", error.message);
        } finally {
          setIsLoading(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelShow = (index) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy mọi thay đổi không?")) {
      setShows((prev) => {
        const updated = [...prev];
        updated[index] = initialData[index];
        return updated;
      });

      setValue(`shows.${index}`, initialData[index], {
        shouldValidate: false,
      });
    }
  };

  const [confirmModal, setComfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [showStatus, setShowStatus] = useState({
    showId: null,
    nextStatus: null,
    index: null,
  });

  const requestChangeStatus = (showId, newStatus, currentStatus, index) => {
    if (newStatus === currentStatus) return;
    setComfirmModal({
      isOpen: true,
      title: "Xác nhận thay đổi",
      message: `Bạn có chắc chắn muốn chuyển trạng thái suất diễn này sang "${newStatus}" không?`,
    });
    setShowStatus({
      showId: showId,
      nextStatus: newStatus,
      index: index,
    });
  };

  const handleConfirmStatus = async () => {
    setComfirmModal({ isOpen: false, title: "", message: "" });
    const { showId, nextStatus, index } = showStatus;
    try {
      await axiosClient.patch(`/shows/${showId}/status`, {
        status: nextStatus,
      });
      updateShow(showId, { status: nextStatus });
      setInitialData((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: nextStatus };
        return updated;
      });
      setModal({
        isOpen: true,
        title: "Cập nhật suất diễn",
        message: "Thay đổi trạng thái thành công.",
        type: "success",
      });
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Cập nhật suất diễn",
        message: "Thay đổi trạng thái thất bại: " + error.message,
        type: "error",
      });
    } finally {
      setShowStatus({
        showId: null,
        nextStatus: null,
        index: null,
      });
    }
  };

  const SHOW_STATUS_MAP = {
    DRAFT: {
      label: "Bản nháp",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
    ACTIVE: {
      label: "Hoạt động",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    POSTPONED: {
      label: "Tạm hoãn",
      color: "bg-orange-100 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  };

  return (
    <FormProvider {...methods}>
      <>
        {modal.isOpen && (
          <Modal
            isOpen={modal.isOpen}
            title={modal.title}
            message={modal.message}
            onClose={closeModal}
            type={modal.type}
          />
        )}
        <TicketTypeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTicket}
          editData={editingTicket}
          show={shows.find((s) => s.id === activeShowId)}
          showIndex={activeShowIndex}
          ticketTypeIndex={activeTicketTypeIndex}
        />
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onClose={() =>
            setComfirmModal({ isOpen: false, title: "", message: "" })
          }
          onConfirm={handleConfirmStatus}
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="pl-2 text-xl font-bold text-slate-800 flex items-center">
                Thời Gian
              </h2>
            </div>
            {/* Danh sách các suất diễn */}
            {shows?.map((show, index) => {
              const currentShowError = errors.shows?.[index];
              const isStatusLocked = show.status !== "DRAFT";
              const cannotAddTicketType = Boolean(
                (show?.seatMapType === "SECTION_WITH_SEATS" ||
                  show?.seatMapType === "SECTION_ONLY") &&
                show?.ticketTypes?.length >= (show?.sections?.length || 0),
              );
              return (
                <div
                  key={show.id}
                  className={`bg-white rounded-xl p-6 mb-8 relative shadow-sm border-1 animate-in fade-in duration-300 ${
                    currentShowError ? "border-red-500" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 cursor-pointer group">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-colors text-lg">
                        expand_less
                      </span>
                      <span className="text-slate-800 font-bold text-lg mr-4">
                        Suất diễn {shows.length > 1 ? index + 1 : ""}
                      </span>
                      <StatusBadge
                        status={show?.status}
                        options={SHOW_STATUS_MAP}
                        onStatusChange={(newStatus) => {
                          requestChangeStatus(
                            show.id,
                            newStatus,
                            show.status,
                            index,
                          );
                        }}
                      ></StatusBadge>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeShow(show.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        close
                      </span>
                    </button>
                  </div>

                  {/* BỔ SUNG: Lựa chọn loại sơ đồ */}
                  <div
                    className={`mb-8 p-4  rounded-xl border-2 transition-all ${
                      currentShowError?.seatMapType
                        ? " border-red-300"
                        : " border-slate-100"
                    }`}
                  >
                    <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">
                        map
                      </span>
                      Loại sơ đồ chỗ ngồi
                    </label>
                    <div className="flex flex-col md:flex-row gap-6">
                      {seatMapType.map((type) => (
                        <label
                          key={type.id}
                          className={`flex-1 flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            show.seatMapType === type.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-white bg-white hover:border-slate-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`seatMapType-${show.id}`}
                            className="mt-1 w-4 h-4 text-emerald-600"
                            checked={show.seatMapType === type.id}
                            disabled={true}
                            onChange={() =>
                              updateShow(show.id, { seatMapType: type.id })
                            }
                          />
                          <div>
                            <div className="flex items-center gap-1 font-bold text-sm text-slate-900">
                              <span className="material-symbols-outlined text-sm">
                                {type.icon}
                              </span>
                              {type.label}
                            </div>
                            <p className="text-xs text-slate-500">
                              {type.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {currentShowError?.seatMapType && (
                      <p className="text-red-500 text-sm mt-2">
                        {currentShowError.seatMapType.message}
                      </p>
                    )}
                  </div>

                  {/* Hiển thị Upload SVG khi chọn SECTION_WITH_SEATS */}
                  {(show.seatMapType === "SECTION_WITH_SEATS" ||
                    show.seatMapType === "SECTION_ONLY") && (
                    <div
                      className={`mb-8 bg-slate-50/50 p-4 rounded-xl border-2 border-dashed transition-all ${
                        currentShowError?.seatMapSvg
                          ? "border-red-400"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* Cột bên trái: Upload Input */}
                        <div className="flex-1 space-y-4">
                          <label className="block text-sm font-bold text-slate-800">
                            Tải lên sơ đồ SVG
                          </label>
                          <div className="relative h-32 w-full border-2 border-dashed border-emerald-200 rounded-lg bg-white flex flex-col items-center justify-center hover:bg-emerald-50 transition-colors cursor-pointer group">
                            <input
                              type="file"
                              accept=".svg"
                              disabled={isStatusLocked}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleSvgUpload(show.id, file);
                                  e.target.value = "";
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="material-symbols-outlined text-emerald-500 text-3xl mb-2 group-hover:scale-110 transition-transform">
                              {show.seatMapSvg ? "cloud_done" : "upload_file"}
                            </span>
                            <p className="text-xs text-slate-500">
                              {show.seatMapSvg
                                ? "Click để thay đổi sơ đồ khác"
                                : "Chọn file sơ đồ .svg"}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">
                            * Lưu ý: File SVG nên được group theo các Section để
                            hệ thống nhận diện đúng ID.
                          </p>
                        </div>
                        {/* Cột bên phải: Preview SVG */}
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-slate-800 mb-4">
                            Xem trước sơ đồ
                          </label>
                          <div className="min-h-[12rem] w-full bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                            {show.seatMapSvg ? (
                              <div
                                className="p-8 w-full flex items-center justify-center preview-svg-container"
                                dangerouslySetInnerHTML={{
                                  __html: show.seatMapSvg,
                                }}
                              />
                            ) : (
                              <div className="text-center">
                                <span className="material-symbols-outlined text-slate-300 text-5xl">
                                  image
                                </span>
                                <p className="text-xs text-slate-400 mt-2">
                                  Chưa có sơ đồ để hiển thị
                                </p>
                              </div>
                            )}

                            {show.seatMapSvg && !isStatusLocked && (
                              <button
                                onClick={() =>
                                  updateShow(show.id, {
                                    seatMapSvg: "",
                                    sections: [],
                                    ticketTypes: show.ticketTypes.map(
                                      (ticketType) => ({
                                        ...ticketType,
                                        sectionId: "",
                                      }),
                                    ),
                                  })
                                }
                                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md flex items-center justify-center transition-transform hover:scale-110"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  close
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {currentShowError?.seatMapSvg?.message && (
                        <p className="text-red-500 text-sm">
                          {currentShowError.seatMapSvg.message}
                        </p>
                      )}
                    </div>
                  )}
                  {/* Grid Input Thời gian */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Thời gian bắt đầu
                      </label>
                      <div className="relative">
                        <input
                          value={show.startTime || ""}
                          onChange={(e) =>
                            updateShow(show.id, {
                              startTime: e.target.value,
                            })
                          }
                          type="datetime-local"
                          className={`w-full bg-slate-50 border rounded-lg py-3 px-4 text-sm outline-none transition-all ${
                            currentShowError?.startTime
                              ? "border-red-500 focus:border-red-600"
                              : "border-slate-200  focus:border-emerald-500"
                          }`}
                          placeholder="Chọn ngày & giờ bắt đầu"
                        />
                        {currentShowError?.startTime && (
                          <p className="text-red-500 text-sm mt-1">
                            {currentShowError.startTime.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Thời gian kết thúc
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={show.endTime || ""}
                          onChange={(e) =>
                            updateShow(show.id, {
                              endTime: e.target.value,
                            })
                          }
                          className={`w-full bg-slate-50 border rounded-lg py-3 px-4 text-sm outline-none transition-all ${
                            currentShowError?.endTime
                              ? "border-red-500  focus:border-red-600"
                              : "border-slate-200  focus:border-emerald-500"
                          }`}
                          placeholder="Chọn ngày & giờ kết thúc"
                        />
                        {currentShowError?.endTime && (
                          <p className="text-red-500 text-sm mt-1">
                            {currentShowError.endTime.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Tối thiểu / đơn
                      </label>
                      <div className="relative">
                        <input
                          value={show.minOrder}
                          onChange={(e) =>
                            updateShow(show.id, {
                              minOrder: e.target.value,
                            })
                          }
                          type="number"
                          className={`w-full bg-slate-50 border rounded-lg py-3 px-4 text-sm outline-none transition-all ${
                            currentShowError?.minOrder
                              ? "border-red-500  focus:border-red-600"
                              : "border-slate-200 focus:border-emerald-500"
                          }`}
                        />
                        {currentShowError?.minOrder && (
                          <p className="text-red-500 text-sm mt-1">
                            {currentShowError.minOrder.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Tối đa / đơn
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={show.maxOrder}
                          onChange={(e) =>
                            updateShow(show.id, {
                              maxOrder: e.target.value,
                            })
                          }
                          className={`w-full bg-slate-50 border rounded-lg py-3 px-4 text-sm outline-none transition-all ${
                            currentShowError?.maxOrder
                              ? "border-red-500  focus:border-red-600"
                              : "border-slate-200  focus:border-emerald-500"
                          }`}
                        />
                        {currentShowError?.maxOrder && (
                          <p className="text-red-500 text-sm mt-1">
                            {currentShowError.maxOrder.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Loại vé section */}
                  <div className="mb-4 flex items-center gap-1 border-t border-slate-100 pt-6">
                    <span className="text-red-500 font-bold text-lg">*</span>
                    <span className="text-slate-800 font-bold">Loại vé</span>
                  </div>

                  {/* Danh sách vé thuộc Show này */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      <span className="text-red-500 mr-1">*</span>Loại vé của
                      suất này
                    </label>
                    {show.ticketTypes.map((ticketType, ticketTypeIndex) => {
                      const hasTicketError =
                        errors.shows?.[index]?.ticketTypes?.[ticketTypeIndex];
                      return (
                        <div
                          key={ticketType.id}
                          className={`flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm transition-all group ${
                            hasTicketError
                              ? "border-red-500 bg-red-50"
                              : "border-slate-100 hover:border-emerald-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-4xl">
                                confirmation_number
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {ticketType.name || "--"}
                              </p>
                              <p className="text-xs text-slate-500">
                                • SL: {ticketType.totalQuantity || "--"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              type="button"
                              onClick={() =>
                                openEditTicket(
                                  show.id,
                                  ticketType,
                                  index,
                                  ticketTypeIndex,
                                )
                              }
                              className="p-2 text-slate-400 hover:text-emerald-500"
                            >
                              <span className="material-symbols-outlined text-4xl">
                                edit
                              </span>
                            </button>
                            {!isStatusLocked && (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteTicket(show.id, ticketType.id)
                                }
                                className="p-2 text-slate-400 hover:text-red-500"
                              >
                                <span className="material-symbols-outlined text-4xl">
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Truy cập đúng vào message của ticketTypes trong mảng shows */}
                    {currentShowError?.ticketTypes && (
                      <p className="text-red-500 text-sm mb-2">
                        {currentShowError.ticketTypes.message}
                      </p>
                    )}

                    {/* Nút thêm vé riêng cho từng section */}
                    <button
                      type="button"
                      disabled={cannotAddTicketType}
                      onClick={() => handleOpenAddTicket(show.id, index)}
                      className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center gap-2 text-emerald-500 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all mt-4"
                    >
                      <span className="material-symbols-outlined text-4xl">
                        add_circle
                      </span>
                      Tạo loại vé mới
                    </button>
                    {cannotAddTicketType && (
                      <div className="mt-2 flex items-center gap-1 text-[0.85rem] text-red-600">
                        <span role="img" aria-label="warning">
                          ⚠️
                        </span>
                        <span className="italic">
                          Bạn không thể thêm vé vì mỗi khu vực trên sơ đồ đã
                          được gán một loại vé (đã đủ số lượng section trên
                          seatmap).
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end gap-4 mt-6">
                      {/* Hủy riêng show này */}
                      <button
                        type="button"
                        onClick={() => handleCancelShow(index)}
                        className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg"
                      >
                        Hủy
                      </button>

                      {/* Lưu riêng show này */}
                      <button
                        type="button"
                        onClick={() => saveShow(index)}
                        disabled={isLoading}
                        className={`
        relative flex items-center justify-center gap-2 px-8 py-2.5 
        bg-emerald-500 hover:bg-emerald-600 text-white 
        rounded-lg font-bold text-sm shadow-lg shadow-emerald-200 
        transition-all duration-200 active:scale-95
        disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
      `}
                      >
                        {isLoading === index ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[20px]">
                              save
                            </span>
                            <span>Lưu suất diễn</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {errors.shows?.root?.message && (
              <p className="text-red-500 text-center font-bold">
                {errors.shows.root.message}
              </p>
            )}
            {/* Nút tạo suất diễn dưới cùng */}
            <div className="w-full mt-6 border-t border-slate-200 flex items-center justify-center py-4">
              <button
                type="button"
                onClick={handleAddShow}
                className="flex items-center gap-2 text-emerald-500 cursor-pointer font-bold text-lg group"
              >
                <span className="material-symbols-outlined text-4xl">
                  add_circle
                </span>
                <span>Tạo suất diễn</span>
              </button>
            </div>
          </div>
        </form>
      </>
    </FormProvider>
  );
}
export default UpdateShow;
