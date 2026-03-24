import { useEffect, useState } from "react";
import z from "zod";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../../../api/axiosClient";
import TicketTypeModal from "../../../components/modals/TicketTypeModal";
import StepAddEventInf from "./StepAddEventInf";
import StepAddShow from "./StepAddShow";
import Modal from "../../../components/common/Modal";
import { useHeader } from "../../../hooks/useHeader";
const ticketTierSchema = z
  .object({
    id: z.string(),
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
  seats: z
    .array(
      z.object({
        id: z.string().optional(),
        seatCode: z.string(),
        rowName: z.string(),
        seatNumber: z.string(),
      }),
    )
    .optional()
    .default([]),
  seatMapSvg: z.string().optional(),
  sectionId: z.string().optional(),
  ticketTiers: z
    .array(ticketTierSchema)
    .min(1, "Phải có ít nhất một đợt mở bán (Tier)")
    .superRefine((tiers, ctx) => {
      const overlaps = {};

      for (let i = 0; i < tiers.length; i++) {
        const s1 = new Date(tiers[i].saleStartTime).getTime();
        const e1 = new Date(tiers[i].saleEndTime).getTime();
        if (isNaN(s1) || isNaN(e1)) continue;

        for (let j = i + 1; j < tiers.length; j++) {
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

        //Kiểm tra có gửi danh sách ghế không
        if (data.seatMapType === "SECTION_WITH_SEATS" && ticketType.seatingType === "SEATED") {
          if (!ticketType.seats || ticketType.seats.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Loại vé này bắt buộc phải có danh sách ghế chi tiết",
              path: ["ticketTypes", tIdx, "seats"],
            });
          }
        }
      });
    }
  });

const schemas = [
  z.object({
    posterId: z.string().min(1, "Vui lòng upload ảnh poster"),
    bannerId: z.string().min(1, "Vui lòng upload ảnh banner"),
    organizerLogoId: z.string().min(1, "Vui lòng upload ảnh logo ban tổ chức"),
    name: z
      .string()
      .min(5, "Tên sự kiện phải có ít nhất 5 ký tự")
      .max(100, "Tối đa 100 ký tự"),
    location: z.string().min(1, "Vui lòng nhập tên địa điểm"),
    provinceId: z.string().min(1, "Vui lòng chọn Tỉnh/Thành"),
    categoryId: z.string().min(1, "Vui lòng chọn thể loại"),
    descriptionHtml: z.string().optional(),
    descriptionText: z.string().optional(),
    mediaIds: z.array(z.string()).default([]),
    organizerName: z.string().min(1, "Vui lòng nhập tên ban tổ chức"),
    organizerInfo: z
      .string()
      .min(10, "Thông tin ban tổ chức quá ngắn")
      .max(500),
    poster: z.string().optional(),
    banner: z.string().optional(),
    organizerLogo: z.string().optional(),
  }),
  z.object({
    shows: z
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
            path: [index, "startTime"], // Báo lỗi tại trường startTime của suất diễn đó
          });
        });
      }),
  }),
];
const fullSchema = schemas.reduce((acc, curr) => acc.merge(curr), z.object({}));

function AddEvent() {
  const { setTitle } = useHeader();
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    setTitle("Quản lý sự kiện");
  }, []);
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
  const [currentStep, setCurrentStep] = useState(1);
  const stepFields = [
    [
      "posterId",
      "bannerId",
      "name",
      "location",
      "provinceId",
      "categoryId",
      "descriptionHtml",
      "descriptionText",
      "mediaIds",
      "organizerLogoId",
      "organizerName",
      "organizerInfo",
    ],
    ["shows"],
    [],
  ];

  const methods = useForm({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      posterId: "",
      bannerId: "",
      organizerLogoId: "",
      name: "",
      location: "",
      provinceId: "",
      categoryId: "",
      descriptionHtml: "",
      descriptionText: "",
      mediaIds: [],
      organizerName: "",
      organizerInfo: "",
      shows: [],
      poster: "",
      banner: "",
      organizerLogo: "",
    },
  });

  const { handleSubmit, trigger, setError } = methods;

  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
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

  const onSubmit = async (data) => {
    console.log("Dữ liệu form sẵn sàng gửi API:", data);
    try {
      console.log("Dữ liệu submit:", data);
      await axiosClient.post("/events", data);
      setModal({
        isOpen: true,
        title: "Thêm sự kiện",
        message: "Tạo mới sự kiện thành công.",
        type: "success",
      });
    } catch (error) {
      if (
        error.code === "EVENT_VALIDATION_ERROR" ||
        error.code === "VALIDATION_ERROR"
      ) {
        const serverErrors = error.details;
        Object.entries(serverErrors).forEach(([field, message]) => {
          setError(field, {
            type: "server",
            message: message,
          });
        });
        setModal({
          isOpen: true,
          title: "Thêm mới sự kiện",
          message: "Tạo mới sự kiện thất bại: " + error.message,
          type: "error",
        });
        return;
      }
      setModal({
        isOpen: true,
        title: "Thêm mới sự kiện",
        message: "Tạo mới sự kiện thất bại: " + error.message,
        type: "error",
      });
      console.error("Tạo user thất bại:", error.message);
    }
  };

  const onError = (errors) => {
    console.log("Danh sách lỗi Form:", errors);
  };

  return (
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
      <FormProvider {...methods}>
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
                  disabled={currentStep >= steps.length}
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
          <div className="w-full flex-1 overflow-y-auto custom-scrollbar pt-8">
            {currentStep === 1 && (
              <StepAddEventInf
                provinces={provinces}
                categories={categories}
              ></StepAddEventInf>
            )}
            {currentStep === 2 && <StepAddShow></StepAddShow>}
          </div>
        </form>
      </FormProvider>
    </>
  );
}

export default AddEvent;
