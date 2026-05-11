import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import TextEditor from "../../components/common/TextEditor";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../../api/axiosClient";
import TicketTypeModal from "../../../src/components/modals/TicketTypeModal";

const schemas = [
  z.object({
    poster: z
      .union([z.instanceof(File), z.string().url("Đường dẫn ảnh không hợp lệ")])
      .refine((val) => val, "Vui lòng upload hoặc chọn ảnh poster"),
    banner: z
      .union([z.instanceof(File), z.string().url("Đường dẫn ảnh không hợp lệ")])
      .refine((val) => val, "Vui lòng upload hoặc chọn ảnh banner"),
    eventName: z
      .string()
      .min(5, "Tên sự kiện phải có ít nhất 5 ký tự")
      .max(100, "Tối đa 100 ký tự"),
    locationName: z.string().min(1, "Vui lòng nhập tên địa điểm"),
    address: z.string().nullable().optional(),
    userId: z.string().min(1, "Vui lòng nhập id"),
    provinceId: z.string().min(1, "Vui lòng chọn Tỉnh/Thành"),
    categoryId: z.string().min(1, "Vui lòng chọn thể loại"),
    description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
    organizerLogo: z
      .union([z.instanceof(File), z.string().url("Đường dẫn ảnh không hợp lệ")])
      .refine((val) => val, "Vui lòng upload hoặc chọn ảnh logo tổ chức"),
    organizerName: z.string().min(1, "Vui lòng nhập tên ban tổ chức"),
    organizerInfo: z
      .string()
      .min(10, "Thông tin ban tổ chức quá ngắn")
      .max(500),
  }),
  z.object({
    shows: z
      .array(
        z
          .object({
            startTime: z.preprocess(
              (val) => (val === null || val === undefined ? "" : String(val)),
              z.string().min(1, { message: "Vui lòng chọn thời gian bắt đầu" }),
            ),
            endTime: z.preprocess(
              (val) => (val === null || val === undefined ? "" : String(val)),
              z
                .string()
                .min(1, { message: "Vui lòng chọn thời gian kết thúc" }),
            ),
            tickets: z.array(z.any()).min(1, {
              message: "Phải có ít nhất 1 loại vé cho suất diễn này",
            }),
          })
          .refine(
            (data) => {
              const showStart = new Date(data.startTime).getTime();
              return data.tickets.every(
                (ticket) => new Date(ticket.saleEndTime).getTime() <= showStart,
              );
            },
            {
              message:
                "Thời gian bắt đầu suất diễn không được sớm hơn thời gian kết thúc bán của các loại vé",
              path: ["startTime"],
            },
          ),
      )
      .min(1, { message: "Phải có ít nhất một suất diễn" }),
  }),
];

const fullSchema = schemas.reduce((acc, curr) => acc.merge(curr), z.object({}));
function AddEvent() {
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provinceRes, categoryRes] = await Promise.all([
          axiosClient.get("/provinces"),
          axiosClient.get("/categories"),
        ]);
        setProvinces(provinceRes.data);
        setCategories(categoryRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    };
    fetchData();
  }, []);

  const steps = [
    { id: 1, title: "Thông tin sự kiện" },
    { id: 2, title: "Thời gian & Loại vé" },
    { id: 3, title: "Cài đặt" },
    { id: 4, title: "Thông tin thanh toán" },
  ];

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fullSchema),
    onChange: true,
    defaultValues: {
      poster: "",
      banner: "",
      organizerLogo: "",
      eventName: "",
      locationName: "",
      userId: "",
      address: "",
      provinceId: "",
      categoryId: "",
      description: "",
      organizerName: "",
      organizerInfo: "",
      shows: [],
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const stepFields = [
    [
      "poster",
      "banner",
      "eventName",
      "userId",
      "locationName",
      "address",
      "provinceId",
      "categoryId",
      "description",
      "organizerLogo",
      "organizerName",
      "organizerInfo",
    ],
    [],
    [],
  ];

  const [images, setImages] = useState({
    poster: null,
    banner: null,
    organizerLogo: null,
  });
  const watchEventName = watch("eventName", "");
  const watchOrganizerInfo = watch("organizerInfo", "");
  const watchOrganizerName = watch("organizerName", "");
  const watchLocationName = watch("locationName", "");
  const watchAddress = watch("address", "");
  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
    // setCurrentStep((prev) => prev + 1);
  };

  const handleStep = async (targetStep) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    for (let stepIndex = currentStep; stepIndex < targetStep; stepIndex++) {
      const fieldsToValidate = stepFields[stepIndex - 1];
      const isStepValid = await trigger(fieldsToValidate);

      if (!isStepValid) {
        setCurrentStep(stepIndex);
        console.log(`Dừng lại ở bước ${stepIndex} do có lỗi.`);
        return;
      }
    }
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result;
        setImages((prev) => ({
          ...prev,
          [type]: base64String,
        }));

        setValue(type, base64String, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    console.log("Dữ liệu form sẵn sàng gửi API:", data);
    alert("Form hợp lệ! Xem console để thấy dữ liệu.");
  };

  const onError = (errors) => {
    console.log("Danh sách lỗi Form:", errors);
  };

  // Step 2
  const [shows, setShows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeShowId, setActiveShowId] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showErrors, setShowErrors] = useState({});

  const updateShow = (showId, updatedData) => {
    setShows((prevShows) => {
      const showIndex = prevShows.findIndex((s) => s.id === showId);
      if (showIndex === -1) return prevShows;

      const currentShow = prevShows[showIndex];
      const nextShowData = { ...currentShow, ...updatedData };

      let errors = {};
      const nextStart = nextShowData.startTime
        ? new Date(nextShowData.startTime).getTime()
        : null;
      const nextEnd = nextShowData.endTime
        ? new Date(nextShowData.endTime).getTime()
        : null;

      // KIỂM TRA LOGIC: startTime < endTime
      if (nextStart && nextEnd && nextStart >= nextEnd) {
        errors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu.";
      }

      // KIỂM TRA TRÙNG LẶP
      if (nextStart && nextEnd) {
        const isOverlapping = prevShows.some((s) => {
          if (s.id === showId || !s.startTime || !s.endTime) return false;

          const otherStart = new Date(s.startTime).getTime();
          const otherEnd = new Date(s.endTime).getTime();

          return nextStart < otherEnd && nextEnd > otherStart;
        });

        if (isOverlapping) {
          errors.endTime =
            "Suất diễn này bị trùng thời gian với một suất diễn khác.";
        }
      }

      // KIỂM TRA LOGIC: startTime vs Vé (Tickets)
      if (nextStart && nextShowData.tickets?.length > 0) {
        const hasInvalidTicket = nextShowData.tickets.some((ticket) => {
          return (
            ticket.saleEndTime &&
            new Date(ticket.saleEndTime).getTime() > nextStart
          );
        });

        if (hasInvalidTicket) {
          errors.startTime =
            "Suất diễn không được bắt đầu trước khi vé kết thúc bán.";
        }
      }

      // Cập nhật lỗi
      setShowErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (Object.keys(errors).length > 0) {
          newErrors[showId] = errors;
        } else {
          delete newErrors[showId];
        }
        return newErrors;
      });

      // Trả về mảng shows mới
      return prevShows.map((s) => (s.id === showId ? nextShowData : s));
    });
  };

  const getActiveShowStartTime = () => {
    const show = shows.find((s) => s.id === activeShowId);
    return show ? show.startTime : null;
  };

  // --- Logic cho Suất diễn ---
  const addShow = () => {
    setShows([...shows, { id: crypto.randomUUID(), tickets: [] }]);
  };

  const removeShow = (showId) => {
    if (shows.length > 0) {
      setShows(shows.filter((s) => s.id !== showId));
      setShowErrors((prev) => {
        const copy = { ...prev };
        delete copy[showId];
        return copy;
      });
    }
  };

  // Handle lỗi cho mỗi section
  const validateShowBeforeAction = (showId) => {
    const index = shows.findIndex((s) => s.id === showId);
    if (index === -1) return false;

    const show = shows[index];
    const newErrors = {};

    if (!show.startTime) {
      newErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    }

    if (!show.endTime) {
      newErrors.endTime = "Vui lòng chọn thời gian kết thúc";
    }

    if (show.startTime && show.endTime) {
      if (new Date(show.endTime) <= new Date(show.startTime)) {
        newErrors.endTime = "Thời gian kết thúc phải sau bắt đầu";
      }
    }

    if (show.startTime && show.tickets?.length > 0) {
      const sStart = new Date(show.startTime).getTime();

      const invalidTickets = show.tickets.filter(
        (t) => t.saleEndTime && new Date(t.saleEndTime).getTime() > sStart,
      );

      if (invalidTickets.length > 0) {
        newErrors.startTime = `Có ${invalidTickets.length} loại vé kết thúc bán sau khi suất diễn bắt đầu.`;
      }
    }

    setShowErrors((prev) => ({
      ...prev,
      [showId]: newErrors,
    }));

    return Object.keys(newErrors).length === 0;
  };

  const handleAddShow = () => {
    if (shows.length === 0) {
      addShow();
      return;
    }
    const lastShow = shows[shows.length - 1];
    if (validateShowBeforeAction(lastShow.id)) {
      addShow();
    }
  };

  useEffect(() => {
    setValue("shows", shows, { shouldValidate: true });
  }, [shows, setValue]);

  // --- Logic cho Vé (Tickets) ---
  const openAddTicket = (showId) => {
    setActiveShowId(showId);
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const openEditTicket = (showId, ticket) => {
    setActiveShowId(showId);
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleSaveTicket = (ticketData) => {
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id === activeShowId) {
          if (editingTicket) {
            return {
              ...show,
              tickets: show.tickets.map((t) =>
                t.id === editingTicket.id ? { ...ticketData, id: t.id } : t,
              ),
            };
          } else {
            return {
              ...show,
              tickets: [
                ...show.tickets,
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

  const deleteTicket = (showId, ticketId) => {
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id === showId) {
          return {
            ...show,
            tickets: show.tickets.filter((t) => t.id !== ticketId),
          };
        }
        return show;
      }),
    );
  };

  const handleOpenAddTicket = (showId) => {
    if (validateShowBeforeAction(showId)) {
      openAddTicket(showId);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="min-h-screen bg-slate-50"
      >
        <header className="rounded-xl shadow bg-white border-b border-slate-200 z-10 sticky top-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4 md:px-8">
            <div className="flex items-center h-full overflow-x-auto flex-1 mr-4 no-scrollbar scroll-smooth">
              {steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => {
                    handleStep(step.id);
                  }}
                  className={`cursor-pointer flex items-center gap-2 md:gap-3 h-full px-4 md:px-6 shrink-0 transition-all ${
                    step.id === currentStep
                      ? "border-b-[3px] border-emerald-500"
                      : "opacity-60"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      step.id === currentStep
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      step.id === currentStep
                        ? "font-medium text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Khối nút bấm */}
            <div className="flex gap-2 md:gap-4 items-center self-center shrink-0">
              <button
                type="submit"
                className="px-3 md:px-6 py-2 text-slate-600 font-medium hover:text-emerald-500 transition-colors text-sm md:text-base"
              >
                Lưu
              </button>

              <button
                type="button"
                onClick={() => {
                  handleNext();
                }}
                className="px-4 md:px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
              >
                Tiếp tục
              </button>
            </div>
          </div>

          <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </header>
        <div class="w-full flex-1 overflow-y-auto custom-scrollbar pt-8">
          {currentStep === 1 && (
            <div class="max-w-7xl mx-auto space-y-8">
              <section class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                  <label class="block text-sm font-semibold text-slate-900">
                    <span class="text-red-500 mr-1">*</span>Upload hình ảnh
                  </label>
                  {(errors.poster || errors.banner) && (
                    <span className="text-red-500 text-xs italic font-medium">
                      Bạn chưa chọn đủ ảnh Poster/Banner
                    </span>
                  )}
                  <a class="text-xs text-emerald-500 hover:underline" href="#">
                    Xem vị trí hiển thị các ảnh
                  </a>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[400px]">
                  <div class="md:col-span-4 lg:col-span-3">
                    <label className="md:h-full h-[250px] relative overflow-hidden border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-emerald-500 transition-colors">
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "poster")}
                      />

                      {images.poster ? (
                        <>
                          <img
                            src={images.poster}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Poster"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              Thay đổi ảnh
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-emerald-500 text-4xl mb-4 group-hover:scale-110 transition-transform">
                            cloud_upload
                          </span>
                          <p className="text-sm font-medium text-slate-700">
                            Ảnh Poster
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            (720x958)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="md:col-span-8 lg:col-span-9">
                    <label className="md:h-full h-[250px] relative overflow-hidden border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-emerald-500 transition-colors">
                      <input
                        type="file"
                        id="file-banner"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "banner")}
                      />

                      {images.banner ? (
                        <>
                          <img
                            src={images.banner}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Banner"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              Thay đổi ảnh nền
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-emerald-500 text-4xl mb-4 group-hover:scale-110 transition-transform">
                            cloud_upload
                          </span>
                          <p className="text-sm font-medium mb-1 text-slate-700">
                            Thêm ảnh nền sự kiện
                          </p>
                          <p className="text-xs text-slate-400">(1280x720)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                {/* Tên sự kiện */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-900">
                    <span className="text-red-500 mr-1">*</span>Tên sự kiện
                  </label>
                  <div className="relative">
                    <input
                      {...register("eventName")}
                      className="w-full bg-transparent border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-16 text-sm"
                      maxLength="100"
                      placeholder="Tên sự kiện"
                      type="text"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      {watchEventName.length} / 100
                    </span>
                  </div>
                  {errors.eventName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.eventName.message}
                    </p>
                  )}
                </div>

                {/* Địa chỉ sự kiện */}
                <div>
                  <label className="block text-sm font-semibold mb-4 text-slate-900">
                    <span className="text-red-500 mr-1">*</span>Địa chỉ sự kiện
                  </label>

                  {/* Form địa điểm */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                        Tên địa điểm
                      </label>
                      <div className="relative">
                        <input
                          {...register("locationName")}
                          className="w-full bg-transparent border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-16 text-sm"
                          maxLength="80"
                          placeholder="Tên địa điểm"
                          type="text"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          {watchLocationName.length} / 80
                        </span>
                      </div>
                      {errors.locationName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.locationName.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                        Địa chỉ
                      </label>
                      <div className="relative">
                        <input
                          {...register("address")}
                          className="w-full bg-transparent border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-16 text-sm"
                          maxLength="80"
                          placeholder="Tên địa điểm"
                          type="text"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          {watchAddress.length} / 80
                        </span>
                      </div>
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                        Tỉnh / Thành
                      </label>
                      <div className="relative">
                        <select
                          {...register("provinceId")}
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none cursor-pointer text-sm text-slate-700"
                        >
                          <option value="a">Vui lòng chọn</option>
                          {provinces.map((provin) => (
                            <option value={provin?.id}>{provin?.name}</option>
                          ))}
                        </select>
                        {/* Icon mũi tên cho select */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <span className="material-symbols-outlined text-sm">
                            expand_more
                          </span>
                        </div>
                      </div>
                      {errors.provinceId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.provinceId.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-semibold mb-4 text-slate-900">
                  <span className="text-red-500 mr-1">*</span>Thể loại sự kiện
                </label>

                <div className="relative">
                  <select
                    {...register("categoryId")}
                    className="w-full bg-transparent border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none cursor-pointer text-sm text-slate-700"
                    onChange={(e) =>
                      console.log("Thể loại đã chọn:", e.target.value)
                    }
                  >
                    <option value="a">Vui lòng chọn</option>
                    {categories.map((cate) => (
                      <option value={cate?.id}>{cate?.name}</option>
                    ))}
                  </select>

                  {/* Icon mũi tên hướng xuống để người dùng nhận diện */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-xl">
                      expand_more
                    </span>
                  </div>
                </div>
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </section>
              {/* SECTION: Chứa thông tin sự kiện */}
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-semibold mb-4 text-slate-900">
                  <span className="text-red-500 mr-1">*</span>Thông tin sự kiện
                </label>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextEditor
                      value={field.value}
                      onChange={(data) => field.onChange(data)}
                      placeholder="Hãy cho khách hàng biết sự kiện của bạn có gì hấp dẫn..."
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}

                <p className="mt-2 text-[11px] text-slate-400">
                  Mẹo: Cung cấp đầy đủ lịch trình và các diễn giả sẽ giúp tăng
                  tỷ lệ mua vé.
                </p>
              </section>
              {/* SECTION: THÔNG TIN BAN TỔ CHỨC */}
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-[200px] shrink-0">
                    <label className="h-[200px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:border-emerald-500 transition-colors relative overflow-hidden">
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "organizerLogo")}
                      />

                      {images.organizerLogo ? (
                        <>
                          {/* Hiển thị ảnh sau khi upload */}
                          <img
                            src={images.organizerLogo}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Logo Ban Tổ Chức"
                          />
                          {/* Lớp phủ (overlay) hiện lên khi hover để báo hiệu có thể đổi ảnh */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <span className="text-white text-[10px] font-medium bg-black/20 px-2 py-1 rounded-full">
                              Thay đổi Logo
                            </span>
                          </div>
                        </>
                      ) : (
                        /* Trạng thái chưa có ảnh */
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-emerald-500 text-3xl mb-2 group-hover:scale-110 transition-transform">
                            add_a_photo
                          </span>
                          <p className="text-xs font-semibold text-slate-700">
                            Logo Ban tổ chức
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            (Kích thước: 275x275)
                          </p>
                        </div>
                      )}
                    </label>
                    {errors.organizerLogo && (
                      <p className="text-red-500 text-[10px] mt-2 text-center">
                        {errors.organizerLogo.message}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 space-y-6">
                    {/* Nhập Tên Ban Tổ Chức */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">
                        <span className="text-red-500 mr-1">*</span>Tên ban tổ
                        chức
                      </label>
                      <div className="relative">
                        <input
                          {...register("organizerName")}
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-16 text-sm text-slate-700"
                          maxLength="80"
                          placeholder="Ví dụ: Công ty Giải trí ABC"
                          type="text"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
                          {watchOrganizerName.length} / 80
                        </span>
                        {errors.organizerName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.organizerName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nhập Thông Tin Chi Tiết */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">
                        <span className="text-red-500 mr-1">*</span>Thông tin
                        ban tổ chức
                      </label>
                      <div className="relative">
                        <textarea
                          {...register("organizerInfo")}
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm text-slate-700 min-h-[110px] resize-none"
                          maxLength="500"
                          placeholder="Giới thiệu ngắn gọn về ban tổ chức sự kiện..."
                          rows="4"
                        ></textarea>
                        <span className="absolute right-4 bottom-3 text-[10px] font-medium text-slate-400">
                          {watchOrganizerInfo.length} / 500
                        </span>
                      </div>
                      {errors.organizerInfo && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.organizerInfo.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
          {currentStep === 2 && (
            <div class="max-w-7xl mx-auto space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="pl-2 text-xl font-bold text-slate-800 flex items-center">
                  Thời Gian
                </h2>
              </div>
              {/* Danh sách các suất diễn */}
              {shows?.map((show, index) => {
                const showError = showErrors[show.id] || {};
                return (
                  <div
                    key={show.id}
                    className="bg-white rounded-xl p-6 mb-8 relative shadow-sm animate-in fade-in duration-300"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 cursor-pointer group">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-colors text-lg">
                          expand_less
                        </span>
                        <span className="text-slate-800 font-bold text-lg">
                          Suất diễn {shows.length > 1 ? index + 1 : ""}
                        </span>
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

                    {/* Grid Input Thời gian */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-3 px-4 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                            placeholder="Chọn ngày & giờ bắt đầu"
                          />
                          {showError.startTime ? (
                            <p className="text-red-500 text-sm mt-1">
                              {showError.startTime}
                            </p>
                          ) : errors.shows?.[index]?.startTime?.message ? (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.shows[index].startTime.message}
                            </p>
                          ) : null}
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
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-3 px-4 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                            placeholder="Chọn ngày & giờ kết thúc"
                          />
                          {showError.endTime ? (
                            <p className="text-red-500 text-sm mt-1">
                              {showError.endTime}
                            </p>
                          ) : errors.shows?.[index]?.endTime?.message ? (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.shows[index].endTime.message}
                            </p>
                          ) : null}
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
                      {show.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-emerald-200 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-4xl">
                                confirmation_number
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {ticket.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {ticket.isFree
                                  ? "Miễn phí"
                                  : `${Number(ticket.price).toLocaleString()}đ`}{" "}
                                • SL: {ticket.totalQuantity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              type="button"
                              onClick={() => openEditTicket(show.id, ticket)}
                              className="p-2 text-slate-400 hover:text-emerald-500"
                            >
                              <span className="material-symbols-outlined text-4xl">
                                edit
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTicket(show.id, ticket.id)}
                              className="p-2 text-slate-400 hover:text-red-500"
                            >
                              <span className="material-symbols-outlined text-4xl">
                                delete
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* Truy cập đúng vào message của tickets trong mảng shows */}
                      {errors.shows?.[index]?.tickets?.message && (
                        <p className="text-red-500 text-sm">
                          {errors.shows[index].tickets.message}
                        </p>
                      )}{" "}
                      {/* Nút thêm vé riêng cho từng section */}
                      <button
                        type="button"
                        onClick={() => handleOpenAddTicket(show.id)}
                        className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center gap-2 text-emerald-500 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all mt-4"
                      >
                        <span className="material-symbols-outlined text-4xl">
                          add_circle
                        </span>
                        Tạo loại vé mới
                      </button>
                    </div>
                  </div>
                );
              })}
              {errors.shows?.message && (
                <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.shows.message}
                </div>
              )}
              {/* Nút tạo suất diễn dưới cùng */}
              <div className="w-full mt-6 border-t border-slate-200 flex items-center justify-center py-4">
                <button
                  type="button"
                  onClick={handleAddShow}
                  // Đã xóa w-full
                  className="flex items-center gap-2 text-emerald-500 cursor-pointer font-bold text-lg group"
                >
                  <span className="material-symbols-outlined text-4xl">
                    add_circle
                  </span>
                  <span>Tạo suất diễn</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <TicketTypeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTicket}
          editData={editingTicket}
          showStartTime={getActiveShowStartTime()}
        />
      </form>
    </>
  );
}

export default AddEvent;
