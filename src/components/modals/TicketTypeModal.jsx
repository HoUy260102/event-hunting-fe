import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { extractSeatData } from "../../utils/seatMapParser";

function TicketTypeModal({
  isOpen,
  onClose,
  onSave,
  editData,
  show,
  showIndex,
  ticketTypeIndex,
}) {
  const ticketSchema = z
    .object({
      name: z
        .string()
        .min(1, "Tên vé không được để trống")
        .max(50, "Tên vé tối đa 50 ký tự"),
      totalQuantity: z.coerce.number().min(1, "Số lượng tối thiểu là 1"),
      soldQuantity: z.coerce.number().default(0),
      seats: z
        .array(
          z.object({
            id: z.string().optional(),
            seatCode: z.string().optional().nullable(),
            rowName: z.string().optional().nullable(),
            seatNumber: z.string().optional().nullable(),
          }),
        )
        .optional()
        .default([])
        .nullable(),
      sectionId: z
        .string()
        .optional()
        .nullable()
        .refine((val) => {
          if (
            (show?.seatMapType === "SECTION_WITH_SEATS" ||
              show?.seatMapType === "SECTION_ONLY") &&
            !val
          )
            return false;
          return true;
        }, "Vui lòng chọn khu vực trên sơ đồ"),
      seatMapSvg: z.string().nullable().optional(),
      seatingType: z.enum(["SEATED", "STANDING"], {
        required_error: "Vui lòng chọn hình thức chỗ ngồi",
      }),
      ticketTiers: z
        .array(
          z.object({
            id: z.string(),
            name: z.string().min(1, "Tên tier không được để trống"),
            status: z
              .enum(["ACTIVE", "INACTIVE", "SUSPENDED"])
              .default("ACTIVE"),
            price: z.coerce.number().min(0, "Giá không được âm"),
            limitQuantity: z.coerce.number().min(1, "Số lượng tối thiểu là 1"),
            soldQuantity: z.coerce.number().default(0),
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
            description: z
              .string()
              .max(1000, "Mô tả tối đa 1000 ký tự")
              .optional(),
          }),
        )
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

              // Logic check overlap: (Start1 < End2) && (End1 > Start2)
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
              path: [parseInt(index), "saleStartTime"],
            });
          });
        }),
    })
    .superRefine((data, ctx) => {
      if (data.totalQuantity < data.soldQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tổng số lượng (${data.totalQuantity}) không được nhỏ hơn số lượng đã bán (${data.soldQuantity})`,
          path: ["totalQuantity"],
        });
      }

      const tiers = data.ticketTiers;

      for (let i = 0; i < tiers.length; i++) {
        const currentStart = new Date(tiers[i].saleStartTime);
        const currentEnd = new Date(tiers[i].saleEndTime);
        if (tiers[i].limitQuantity < tiers[i].soldQuantity) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Hạn mức đợt này không được nhỏ hơn số đã bán (${tiers[i].soldQuantity})`,
            path: ["ticketTiers", i, "limitQuantity"],
          });
        }
        if (currentEnd <= currentStart) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Thời gian kết thúc phải sau thời gian bắt đầu",
            path: ["ticketTiers", i, "saleEndTime"],
          });
        }

        if (show?.startTime && currentEnd > new Date(show.startTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Tier phải kết thúc trước khi show bắt đầu",
            path: ["ticketTiers", i, "saleEndTime"],
          });
        }
      }

      if (show?.seatMapType === "SECTION_WITH_SEATS" && data.seatingType === "SEATED") {
        if (!data.seats || data.seats.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng cấu hình danh sách ghế cho khu vực này",
            path: ["seats"],
          });
        }

        if (!data.seatMapSvg) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng tải sơ đồ ghế chi tiết cho khu vực này",
            path: ["seatMapSvg"],
          });
        }
      }
    });

  const {
    formState: { errors: globalErrors },
  } = useFormContext();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    totalQuantity: 10,
    seatingType: "SEATED",
    minOrder: 1,
    maxOrder: 10,
    sectionId: "",
    seatMapSvg: "",
    seats: [],
    ticketTiers: [],
  });

  useEffect(() => {
    const currentTicketTypeErrors =
      globalErrors?.shows?.[showIndex]?.ticketTypes?.[ticketTypeIndex];
    if (!currentTicketTypeErrors) return;
    if (currentTicketTypeErrors) {
      const newServerErrors = {};
      Object.keys(currentTicketTypeErrors).forEach((key) => {
        if (currentTicketTypeErrors[key]?.message) {
          newServerErrors[key] = currentTicketTypeErrors[key].message;
        }
      });
      const tiersError = currentTicketTypeErrors.ticketTiers;

      if (tiersError) {
        if (Array.isArray(tiersError)) {
          tiersError.forEach((tierError, tierIdx) => {
            if (tierError) {
              Object.keys(tierError).forEach((field) => {
                if (tierError[field]?.message) {
                  newServerErrors[`ticketTiers.${tierIdx}.${field}`] =
                    tierError[field].message;
                }
              });
            }
          });
        } else if (tiersError.message) {
          newServerErrors["ticketTiers"] = tiersError.message;
        }
      }
      setErrors((prev) => {
        const cleanedPrev = { ...prev };
        return {
          ...cleanedPrev,
          ...newServerErrors,
        };
      });
    }
  }, [globalErrors, showIndex, ticketTypeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const initialData = editData || {
      name: "",
      totalQuantity: 10,
      sectionId: "",
      ticketTiers: [],
    };
    setFormData(initialData);

    const fieldErrors = {};
    const currentTicketTypeErrors =
      globalErrors?.shows?.[showIndex]?.ticketTypes?.[ticketTypeIndex];

    if (currentTicketTypeErrors) {
      Object.keys(currentTicketTypeErrors).forEach((key) => {
        if (currentTicketTypeErrors[key]?.message) {
          fieldErrors[key] = currentTicketTypeErrors[key].message;
        }
      });

      const tiersError = currentTicketTypeErrors.ticketTiers;
      if (Array.isArray(tiersError)) {
        tiersError.forEach((tierErr, idx) => {
          if (tierErr) {
            Object.keys(tierErr).forEach((field) => {
              if (tierErr[field]?.message) {
                fieldErrors[`ticketTiers.${idx}.${field}`] =
                  tierErr[field].message;
              }
            });
          }
        });
      }
    }
    setErrors(fieldErrors);
  }, [isOpen, editData, globalErrors, showIndex, ticketTypeIndex]);

  const validateField = (field, value) => {
    const newData = { ...formData, [field]: value };

    const result = ticketSchema.safeParse(newData);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          if (path === field) {
            newErrors[field] = issue.message;
          }
        });
      }
      return newErrors;
    });
    setFormData(newData);
  };

  const handleSave = () => {
    const result = ticketSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const pathKey = issue.path.join(".");
        fieldErrors[pathKey] = issue.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
      onSave(result.data);
    }
  };

  const addTicketTier = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: [
        ...prev.ticketTiers,
        {
          id: crypto.randomUUID(),
          name: "",
          price: 0,
          limitQuantity: 1,
          status: "ACTIVE",
          saleStartTime: "",
          saleEndTime: "",
          description: "",
        },
      ],
    }));
  };

  const removeTicketTier = (ticketTierId) => {
    const newTicketTiers = formData.ticketTiers.filter(
      (ticketTier) => ticketTier.id !== ticketTierId,
    );
    setFormData({ ...formData, ticketTiers: newTicketTiers });
  };

  const updateTicketTier = (ticketTierId, updatedData) => {
    const newTicketTiers = formData.ticketTiers.map((t) =>
      t.id === ticketTierId ? { ...t, ...updatedData } : t,
    );
    const newData = { ...formData, ticketTiers: newTicketTiers };
    const result = ticketSchema.safeParse(newData);
    if (!result.success) {
      const newErrors = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path.join(".")] = issue.message;
      });
      setErrors(newErrors);
    } else {
      setErrors({});
    }
    setFormData(newData);
  };

  if (!isOpen) return null;

  const resetToInitial = () => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        name: "",
        totalQuantity: 10,
        minOrder: 1,
        maxOrder: 10,
        sectionId: "",
        ticketTiers: [],
      });
    }
  };

  const handleCancel = () => {
    resetToInitial();
    onClose();
  };

  const seatingTypes = [
    {
      id: "SEATED",
      label: "Vé ngồi",
      icon: "event_seat",
      desc: "Khách hàng có số ghế cụ thể trên sơ đồ.",
    },
    {
      id: "STANDING",
      label: "Vé đứng",
      icon: "accessibility_new",
      desc: "Khu vực tự do, không chia số ghế.",
    },
  ];

  const handleSvgUpload = (file) => {
    if (!file || file.type !== "image/svg+xml") {
      alert("Vui lòng tải lên file định dạng .svg");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target.result;
      const seats = extractSeatData(svgContent);
      const newData = {
        ...formData,
        seatMapSvg: svgContent,
        seats: seats,
        totalQuantity: seats.length,
      };
      setFormData(newData);
    };
    reader.readAsText(file);
  };
  const isLocked = show?.status !== "DRAFT";
  console.log("formData:", formData);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-center flex-1">
            {editData ? "Chỉnh sửa loại vé" : "Tạo loại vé mới"}
          </h3>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Tên vé */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-bold">
                <span className="text-red-500">*</span> Tên vé
              </label>
              <input
                className={`w-full bg-slate-50 border ${errors.name ? "border-red-500" : "border-slate-200"} rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500`}
                value={formData.name}
                onChange={(e) => validateField("name", e.target.value)}
                placeholder="Ví dụ: Vé VIP, Vé Phổ Thông..."
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Tổng số lượng */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold">
                Tổng số lượng{" "}
                {formData?.soldQuantity >= 0 && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    (ĐÃ BÁN: {formData.soldQuantity})
                  </span>
                )}
              </label>
              <input
                type="number"
                className={`w-full bg-slate-50 border ${errors.totalQuantity ? "border-red-500" : "border-slate-200"} rounded-lg px-4 py-3`}
                value={formData.totalQuantity}
                onChange={(e) => validateField("totalQuantity", e.target.value)}
                disabled={show?.seatMapType === "SECTION_WITH_SEATS"}
              />
              {errors.totalQuantity && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.totalQuantity}
                </p>
              )}
            </div>

            {/* Seating Type */}
            <div
              className={`md:col-span-4 bg-slate-50/50 p-4 rounded-xl border-2 transition-all ${
                errors.seatingType ? "border-red-300" : "border-slate-100 "
              }`}
            >
              <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">
                  chair_alt
                </span>
                Hình thức chỗ ngồi
              </label>

              <div className="flex flex-col md:flex-row gap-6">
                {seatingTypes.map((type) => {
                  return (
                    <label
                      key={type.id}
                      className={`flex-1 flex items-start gap-3 p-4 rounded-lg border-2 transition-all 
        ${isLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"} 
        ${
          formData.seatingType === type.id
            ? "border-emerald-500 bg-white shadow-md shadow-emerald-100"
            : isLocked
              ? "border-slate-100 bg-slate-50"
              : "border-white bg-white hover:border-slate-200"
        }`}
                    >
                      <input
                        type="radio"
                        name="seatingType"
                        className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                        checked={formData.seatingType === type.id}
                        onChange={() =>
                          !isLocked && validateField("seatingType", type.id)
                        }
                        disabled={isLocked}
                      />
                      <div>
                        <div
                          className={`flex items-center gap-1 font-bold text-sm ${isLocked ? "text-slate-500" : "text-slate-900"}`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {type.icon}
                          </span>
                          {type.label}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed italic">
                          {type.desc}
                          {isLocked &&
                            formData.seatingType === type.id &&
                            " (Đã chốt)"}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.seatingType && (
                <p className="text-red-500 text-xs mt-2 italic">
                  {errors.seatingType}
                </p>
              )}
            </div>

            {/* Loại section */}
            {(show.seatMapType === "SECTION_ONLY" ||
              show.seatMapType === "SECTION_WITH_SEATS") && (
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-bold">
                  {show?.seatMapSvg && <span className="text-red-500">*</span>}{" "}
                  Khu vực trên sơ đồ
                </label>
                <select
                  className={`w-full bg-slate-50 border ${errors.sectionId ? "border-red-500" : "border-slate-200"} rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500`}
                  value={formData.sectionId}
                  onChange={(e) => validateField("sectionId", e.target.value)}
                  disabled={!show?.seatMapSvg || show?.status !== "DRAFT"}
                >
                  <option value="">
                    --{" "}
                    {show?.seatMapSvg
                      ? "Chọn khu vực"
                      : "Cần upload sơ đồ trước"}{" "}
                    --
                  </option>

                  {/* Render danh sách ID lấy từ file SVG đã quét được ở component cha */}
                  {show?.sections?.map((section) => (
                    <option key={section.sectionId} value={section.sectionId}>
                      {section.sectionName || section.sectionId}
                    </option>
                  ))}
                </select>
                {errors.sectionId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sectionId}
                  </p>
                )}
              </div>
            )}

            {/* Svg cho seat */}
            {show?.seatMapType === "SECTION_WITH_SEATS" && formData.seatingType === "SEATED" && (
              <div
                className={`md:col-span-4 mb-8 bg-slate-50/50 p-4 rounded-xl border-2 transition-all ${
                  errors?.seatMapSvg ? "border-red-400" : "border-slate-200"
                }`}
              >
                <div className="flex flex-col gap-8">
                  {/* Cột bên trái: Upload Input */}
                  <div className="flex-1 space-y-4">
                    <label className="block text-sm font-bold text-slate-800">
                      Tải lên sơ đồ SVG
                    </label>
                    <div className="relative h-30 w-full border-2 border-dashed border-emerald-200 rounded-lg bg-white flex flex-col items-center justify-center hover:bg-emerald-50 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept=".svg"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleSvgUpload(file);
                            e.target.value = "";
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span className="material-symbols-outlined text-emerald-500 text-3xl mb-2 group-hover:scale-110 transition-transform">
                        {formData?.seatMapSvg ? "cloud_done" : "upload_file"}
                      </span>
                      <p className="text-xs text-slate-500">
                        {formData?.seatMapSvg
                          ? "Click để thay đổi sơ đồ khác"
                          : "Chọn file sơ đồ .svg"}
                      </p>
                    </div>
                  </div>
                  {/* Cột bên phải: Preview SVG */}
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-800 mb-4">
                      Xem trước sơ đồ theo khu
                    </label>
                    <div className="min-h-[12rem] w-full bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                      {formData?.seatMapSvg ? (
                        <div
                          className="p-8 w-full flex items-center justify-center preview-svg-container"
                          dangerouslySetInnerHTML={{
                            __html: formData?.seatMapSvg,
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

                      {formData?.seatMapSvg && (
                        <button
                          onClick={() => {
                            const newData = {
                              ...formData,
                              seatMapSvg: "",
                              seats: [],
                              totalQuantity: 0,
                            };
                            setFormData(newData);
                          }}
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
                {errors?.seatMapSvg && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors?.seatMapSvg}
                  </p>
                )}
              </div>
            )}
            {/* Thông tin tier vé */}
            <div className="space-y-4 md:col-span-4">
              {formData.ticketTiers?.map((ticketTier, index) => {
                // Helper để lấy message lỗi cho gọn
                const getTierError = (fieldName) =>
                  errors[`ticketTiers.${index}.${fieldName}`];
                const statusStyles = {
                  ACTIVE:
                    "border-emerald-200 text-emerald-600 focus:ring-emerald-500",
                  INACTIVE:
                    "border-slate-300 text-slate-500 focus:ring-slate-400",
                  SUSPENDED:
                    "border-amber-300 text-amber-600 focus:ring-amber-500",
                };
                return (
                  <div
                    key={ticketTier.id}
                    className="bg-white rounded-xl p-6 mb-6 relative border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    {/* Header của Tier */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">
                          confirmation_number
                        </span>
                        <span className="text-slate-800 font-bold text-lg">
                          Giai đoạn mở bán{" "}
                          {formData.ticketTiers.length > 1
                            ? `#${index + 1}`
                            : ""}
                        </span>
                      </div>

                      {(!isLocked || ticketTier?.id.includes("-")) && (
                        <button
                          type="button"
                          disabled={isLocked && !ticketTier?.id.includes("-")}
                          onClick={() => removeTicketTier(ticketTier.id)}
                          className="group flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">
                            close
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tên Tier */}
                      <div className="md:col-span-1 space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                          <span className="text-red-500">*</span> Tên giai đoạn
                          (Tier)
                        </label>
                        <input
                          className={`w-full bg-slate-50 border ${getTierError("name") ? "border-red-500 ring-1 ring-red-100" : "border-slate-200"} rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                          value={ticketTier.name}
                          onChange={(e) =>
                            updateTicketTier(ticketTier.id, {
                              name: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Chim sớm (Early Bird), Mở bán chính thức..."
                        />
                        {getTierError("name") && (
                          <p className="text-red-500 text-xs mt-1 italic">
                            {getTierError("name")}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700">
                          Trạng thái
                        </label>
                        <select
                          value={ticketTier.status || "ACTIVE"}
                          onChange={(e) =>
                            updateTicketTier(ticketTier.id, {
                              status: e.target.value,
                            })
                          }
                          disabled={ticketTier?.id?.includes("-")}
                          className={`w-full h-[50px] bg-slate-50 border rounded-lg px-4 py-2 outline-none font-semibold transition-all focus:ring-2 ${
                            statusStyles[ticketTier.status] ||
                            "border-slate-200 text-slate-600"
                          }`}
                        >
                          <option
                            value="ACTIVE"
                            className="text-emerald-600 font-semibold"
                          >
                            ● Đang hoạt động
                          </option>
                          <option
                            value="INACTIVE"
                            className="text-slate-400 font-semibold"
                          >
                            ○ Tạm ẩn
                          </option>
                          <option
                            value="SUSPENDED"
                            className="text-yellow-400 font-semibold"
                          >
                            ○ Dừng
                          </option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                          Giá vé cho giai đoạn này
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pl-10 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={ticketTier.price}
                            onChange={(e) =>
                              updateTicketTier(ticketTier.id, {
                                price: e.target.value,
                              })
                            }
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            ₫
                          </span>
                          {getTierError("price") && (
                            <p className="text-red-500 text-xs mt-1">
                              {getTierError("price")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Số lượng giới hạn */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                          Số lượng vé tối đa{" "}
                          {ticketTier?.soldQuantity >= 0 && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                              (ĐÃ BÁN: {ticketTier.soldQuantity})
                            </span>
                          )}
                        </label>

                        <input
                          type="number"
                          className={`w-full bg-slate-50 border ${getTierError("limitQuantity") ? "border-red-500" : "border-slate-200"} rounded-lg px-4 py-3`}
                          value={ticketTier.limitQuantity}
                          onChange={(e) =>
                            updateTicketTier(ticketTier.id, {
                              limitQuantity: e.target.value,
                            })
                          }
                        />
                        {getTierError("limitQuantity") && (
                          <p className="text-red-500 text-xs mt-1">
                            {getTierError("limitQuantity")}
                          </p>
                        )}
                      </div>

                      {/* Thời gian bắt đầu */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Thời gian bắt đầu
                        </label>
                        <input
                          type="datetime-local"
                          value={ticketTier.saleStartTime || ""}
                          onChange={(e) =>
                            updateTicketTier(ticketTier.id, {
                              saleStartTime: e.target.value,
                            })
                          }
                          className={`w-full bg-slate-50 border ${getTierError("saleStartTime") ? "border-red-500" : "border-slate-200"} rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500 text-sm`}
                        />
                        {getTierError("saleStartTime") && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {getTierError("saleStartTime")}
                          </p>
                        )}
                      </div>

                      {/* Thời gian kết thúc */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Thời gian kết thúc
                        </label>
                        <input
                          type="datetime-local"
                          value={ticketTier.saleEndTime || ""}
                          onChange={(e) =>
                            updateTicketTier(ticketTier.id, {
                              saleEndTime: e.target.value,
                            })
                          }
                          className={`w-full bg-slate-50 border ${getTierError("saleEndTime") ? "border-red-500" : "border-slate-200"} rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500 text-sm`}
                        />
                        {getTierError("saleEndTime") && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {getTierError("saleEndTime")}
                          </p>
                        )}
                      </div>

                      {/* Thông tin vé */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                          Ghi chú cho giai đoạn này
                        </label>
                        <textarea
                          rows="2"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-emerald-500"
                          value={ticketTier.description}
                          onChange={(e) =>
                            updateTicketTier(ticketTier.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Chỉ áp dụng cho học sinh sinh viên..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                );
              })}
              {errors.ticketTiers && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {errors.ticketTiers}
                </div>
              )}
              {/* Nút thêm Tier mới */}
              <button
                type="button"
                onClick={addTicketTier}
                className="w-full py-4 border-2 border-dashed border-emerald-500 text-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Thêm đợt mở bán mới
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-lg font-medium border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-lg shadow-emerald-200 transition-all"
          >
            Lưu loại vé
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketTypeModal;
