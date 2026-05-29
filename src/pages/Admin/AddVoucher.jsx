import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../../api/axiosClient";
import { formatDateVN } from "../../utils/format";
import Modal from "../../components/common/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import { useHeader } from "../../hooks/useHeader";
import { useAuth } from "../../hooks/useAuth";

const voucherSchema = z
  .object({
    name: z.string().min(1, "Tên voucher không được để trống"),
    code: z.string().min(3, "Mã voucher phải ít nhất 3 ký tự"),
    quantity: z.coerce.number().optional(),
    isUnlimited: z.boolean().default(false),
    startTime: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endTime: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    discountValue: z.coerce.number().min(1, "Giá trị giảm phải lớn hơn 0"),
    minOrderValue: z.coerce.number().min(0, "Giá trị tối thiểu không được âm"),
    discountType: z.enum(["VALUE", "PERCENT"]),
    scope: z.enum(["SYSTEM", "ORGANIZER"]),
    ticketTypeIds: z.array(z.string()).optional(),

    showId: z.string().optional(),
    maxDiscountValue: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isUnlimited) {
      if (!data.quantity || data.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantity"],
          message: "Số lượng phải lớn hơn 0",
        });
      }
    }

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      });
    }

    if (data.discountType === "PERCENT") {
      if (data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountValue"],
          message: "Phần trăm giảm không được > 100%",
        });
      }

      if (
        data.maxDiscountValue !== null &&
        data.maxDiscountValue !== undefined &&
        data.maxDiscountValue <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxDiscountValue"],
          message: "Giảm tối đa phải > 0",
        });
      }
    }

    if (data.scope === "ORGANIZER" && !data.showId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["showId"],
        message: "Vui lòng chọn suất diễn",
      });
    }

    if (data.scope === "SYSTEM" && data.showId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["showId"],
        message: "Voucher hệ thống không được gắn với suất diễn",
      });
    }

    if (data.discountType === "VALUE") {
      if (data.maxDiscountValue !== undefined && data.maxDiscountValue !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxDiscountValue"],
          message: "VALUE voucher không dùng max discount",
        });
      }
    }

    if (data.scope === "ORGANIZER") {
      if (!data.ticketTypeIds || data.ticketTypeIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ticketTypeIds"],
          message: "Vui lòng chọn ít nhất một loại vé",
        });
      }
    }

    if (
      data.scope === "SYSTEM" &&
      data.ticketTypeIds &&
      data.ticketTypeIds.length > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ticketTypeIds"],
        message: "Voucher hệ thống không áp dụng theo loại vé",
      });
    }
  });

const AddVoucher = () => {
  const { setTitle } = useHeader();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [discountType, setDiscountType] = useState("VALUE");
  const [voucherScope, setVoucherScope] = useState("ORGANIZER");
  const [eventCode, setEventCode] = useState("");
  const [shows, setShows] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      ticketTypeIds: [],
      minOrderValue: 0,
      scope: "ORGANIZER",
      isUnlimited: false,
    },
  });

  const selectedTicketIds = watch("ticketTypeIds");
  const hasMax = watch("maxDiscountValue") !== undefined && watch("maxDiscountValue") !== null;
  const isUnlimited = watch("isUnlimited") || false;

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const handleTicketChange = (id) => {
    if (selectedTicketIds.includes(id)) {
      setValue(
        "ticketTypeIds",
        selectedTicketIds.filter((ticketId) => ticketId !== id),
        { shouldValidate: true },
      );
    } else {
      setValue("ticketTypeIds", [...selectedTicketIds, id], {
        shouldValidate: true,
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedTicketIds.length === tickets.length) {
      setValue("ticketTypeIds", [], { shouldValidate: true });
    } else {
      const allIds = tickets.map((ticket) => ticket.id);
      setValue("ticketTypeIds", allIds, { shouldValidate: true });
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy và xóa toàn bộ dữ liệu đã nhập?",
      )
    ) {
      reset();
      setDiscountType("VALUE");
    }
  };

  const handleSearchEvent = async () => {
    try {
      if (eventCode.length === 0) return;
      const response = await axiosClient.get(
        `/events/${eventCode}/shows/selection`,
      );
      setShows(response?.data);
      setTickets([]);
      setValue("ticketTypeIds", []);
    } catch (err) {
      setModal({
        isOpen: true,
        title: "Tạo mới voucher",
        message: err.message,
        type: "error",
      });
      console.error(err);
    }
  };

  const handleSelectShow = async (showId) => {
    try {
      const response = await axiosClient.get(
        `/shows/${showId}/ticket-types/selection`,
      );
      setTickets(response?.data);
      setValue("ticketTypeIds", []);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (data) => {
    const finalData = {
      ...data,
      discountType,
      scope: voucherScope,
      showId: voucherScope === "SYSTEM" ? null : data.showId,
      ticketTypeIds: voucherScope === "SYSTEM" ? [] : data.ticketTypeIds,
    };
    try {
      await axiosClient.post(`/vouchers`, finalData);
      setModal({
        isOpen: true,
        title: "Thành công",
        message: "Tạo voucher thành công",
        type: "success",
      });
    } catch (error) {
      const serverError = error?.response?.data || error;
      if (serverError && serverError.details && typeof serverError.details === "object") {
        Object.entries(serverError.details).forEach(([field, message]) => {
          setError(field, {
            type: "server",
            message,
          });
        });
        setModal({
          isOpen: true,
          title: "Lỗi tạo voucher",
          message: "Vui lòng kiểm tra lại các thông tin lỗi được hiển thị trên form.",
          type: "error",
        });
        return;
      }

      setModal({
        isOpen: true,
        title: "Lỗi",
        message: serverError?.message || error.message || "Tạo voucher thất bại.",
        type: "error",
      });
    }
    console.log(finalData);
  };

  const onError = (errors) => {
    console.log("🚨 SUBMIT FAIL:");
    Object.entries(errors).forEach(([field, error]) => {
      console.log(`❌ ${field}: ${error.message}`);
    });
  };

  useEffect(() => {
    setTitle("Thêm khuyến mãi");
  }, []);

  useEffect(() => {
    setValue("discountType", discountType);
    if (discountType === "VALUE") {
      setValue("maxDiscountValue", undefined);
    }
  }, [discountType]);

  useEffect(() => {
    setValue("scope", voucherScope);
  }, [voucherScope]);

  useEffect(() => {
    if (voucherScope === "SYSTEM") {
      setEventCode("");
      setShows([]);
      setTickets([]);
      setValue("showId", "");
      setValue("ticketTypeIds", []);
    }
  }, [voucherScope]);

  useEffect(() => {
    if (isUnlimited) {
      setValue("quantity", undefined, { shouldValidate: true });
    }
  }, [isUnlimited]);

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
      <main className="flex-1 p-6 lg:p-10 max-w-[1000px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Block */}
        <div className="bg-white dark:bg-[#1a2c15] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Tạo mới khuyến mãi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Tạo mã giảm giá và chương trình khuyến mãi mới cho các sự kiện của hệ thống.
          </p>
        </div>

        {/* Form chính */}
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="bg-white dark:bg-[#1c2e18] rounded-3xl shadow-md border border-slate-100 dark:border-[#2a4225] p-6 lg:p-10 transition-all duration-300 hover:shadow-lg flex flex-col gap-8"
        >
          {/* SECTION 1: Thông tin Voucher */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2a4225] pb-4">
              <span className="material-symbols-outlined text-emerald-500 text-2xl">
                confirmation_number
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Thông tin Voucher
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                Tên Voucher <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-[#a1aebf] hover:border-slate-300 dark:hover:border-[#36532f] ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                  }`}
                placeholder="Ví dụ: Giảm giá mùa hè 2024"
                type="text"
              />
              {errors.name && (
                <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                  Mã Voucher <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("code")}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm font-mono uppercase placeholder:text-slate-400 dark:placeholder:text-[#a1aebf] hover:border-slate-300 dark:hover:border-[#36532f] ${errors.code ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                    }`}
                  placeholder="SUMMER24"
                  type="text"
                />
                {errors.code && (
                  <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.code.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
                    Số lượng áp dụng <span className="text-red-500">*</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] font-bold text-emerald-600 dark:text-emerald-450 hover:text-emerald-700 dark:hover:text-emerald-350 transition-colors">
                    <input
                      type="checkbox"
                      {...register("isUnlimited")}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 focus:ring-2 border-slate-300 dark:border-[#2a4225] cursor-pointer"
                    />
                    Không giới hạn số lượng
                  </label>
                </div>
                <input
                  {...register("quantity")}
                  readOnly={isUnlimited}
                  className={`w-full h-11 px-4 rounded-xl transition-all duration-200 outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-[#a1aebf] hover:border-slate-300 dark:hover:border-[#36532f] ${
                    isUnlimited
                      ? "bg-slate-100/80 dark:bg-[#142210]/80 cursor-not-allowed text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#2a4225]"
                      : "bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white"
                  } ${
                    errors.quantity ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                  }`}
                  placeholder={isUnlimited ? "Không giới hạn số lượng" : "Nhập số lượng..."}
                  type="number"
                />
                {errors.quantity && (
                  <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.quantity.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("startTime")}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm hover:border-slate-300 dark:hover:border-[#36532f] ${errors.startTime ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                    }`}
                  type="datetime-local"
                />
                {errors.startTime && (
                  <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.startTime.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("endTime")}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm hover:border-slate-300 dark:hover:border-[#36532f] ${errors.endTime ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                    }`}
                  type="datetime-local"
                />
                {errors.endTime && (
                  <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.endTime.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                Áp dụng cho đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                {...register("minOrderValue")}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-[#a1aebf] hover:border-slate-300 dark:hover:border-[#36532f] ${errors.minOrderValue ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                  }`}
                placeholder="Ví dụ: 50000"
                type="number"
              />
              {errors.minOrderValue && (
                <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.minOrderValue.message}
                </span>
              )}
            </div>

            {/* Mức giảm & Phân loại dạng Pills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                  Loại giảm giá
                </label>
                <div className="flex bg-slate-100 dark:bg-[#142210] rounded-xl p-1 shadow-inner gap-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setDiscountType("VALUE")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${discountType === "VALUE"
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm"
                        : "text-slate-500 dark:text-[#a1aebf] hover:text-slate-700 dark:hover:text-white"
                      }`}
                  >
                    VALUE (VNĐ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("PERCENT")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${discountType === "PERCENT"
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm"
                        : "text-slate-500 dark:text-[#a1aebf] hover:text-slate-700 dark:hover:text-white"
                      }`}
                  >
                    PERCENT (%)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                  Giá trị giảm giá <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("discountValue")}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-[#a1aebf] hover:border-slate-300 dark:hover:border-[#36532f] ${errors.discountValue ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                    }`}
                  placeholder={discountType === "VALUE" ? "Ví dụ: 20000" : "Ví dụ: 10"}
                  type="number"
                />
                {errors.discountValue && (
                  <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.discountValue.message}
                  </span>
                )}
              </div>
            </div>

            {discountType === "PERCENT" && (
              <div className="flex flex-col gap-4 bg-slate-50/30 dark:bg-[#142210]/20 p-5 rounded-2xl border border-slate-100 dark:border-[#2a4225] mt-2">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 dark:border-[#2a4225] text-emerald-500 focus:ring-emerald-500 cursor-pointer bg-white dark:bg-[#142210]"
                    checked={hasMax}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue("maxDiscountValue", 0);
                      } else {
                        setValue("maxDiscountValue", undefined);
                      }
                    }}
                  />
                  <span>Giới hạn mức giảm tối đa</span>
                </label>

                {hasMax && (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                      Giảm tối đa (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("maxDiscountValue")}
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-[#a1aebf] hover:border-slate-300 dark:hover:border-[#36532f] ${errors.maxDiscountValue ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                      placeholder="Ví dụ: 50000"
                      type="number"
                    />
                    {errors.maxDiscountValue && (
                      <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {errors.maxDiscountValue.message}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <input type="hidden" {...register("discountType")} value={discountType} />
            <input type="hidden" {...register("scope")} value={voucherScope} />

            <div className="flex flex-col gap-3 pt-4">
              <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                Phạm vi áp dụng (Loại Voucher)
              </label>
              <div className="flex bg-slate-100 dark:bg-[#142210] rounded-xl p-1 shadow-inner gap-1 w-full max-w-xs">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setVoucherScope("SYSTEM")}
                    className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${voucherScope === "SYSTEM"
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm"
                        : "text-slate-500 dark:text-[#a1aebf] hover:text-slate-700 dark:hover:text-white"
                      }`}
                  >
                    SYSTEM
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setVoucherScope("ORGANIZER")}
                  className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${voucherScope === "ORGANIZER"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm"
                      : "text-slate-500 dark:text-[#a1aebf] hover:text-slate-700 dark:hover:text-white"
                    }`}
                >
                  ORGANIZER
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Điều kiện Sự kiện (ORGANIZER) */}
          {voucherScope === "ORGANIZER" && (
            <div className="flex flex-col gap-6 pt-4 border-t border-slate-100 dark:border-[#2a4225] animate-in fade-in duration-300">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2a4225] pb-4">
                <span className="material-symbols-outlined text-emerald-500 text-2xl">
                  rule
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Cấu hình Áp dụng cho Sự kiện
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                    Nhập mã sự kiện <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={eventCode}
                      onChange={(e) => setEventCode(e.target.value)}
                      className="flex-1 h-11 px-4 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-[#a1aebf] hover:border-slate-300 dark:hover:border-[#36532f]"
                      placeholder="Ví dụ: EVENT123"
                      type="text"
                    />
                    <button
                      type="button"
                      onClick={handleSearchEvent}
                      className="h-11 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white px-5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-400/10 active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      TÌM KIẾM
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                    Chọn suất diễn <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        const value = e.target.value;
                        handleSelectShow(value);
                        setValue("showId", value, { shouldValidate: true });
                      }}
                      className={`w-full h-11 px-4 pr-10 rounded-xl bg-slate-50/50 dark:bg-[#142210]/50 border border-slate-200 dark:border-[#2a4225] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all duration-200 outline-none text-sm cursor-pointer hover:border-slate-300 dark:hover:border-[#36532f] appearance-none ${errors.showId ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                    >
                      <option value="">-- Chọn suất diễn --</option>
                      {shows?.map((show) => (
                        <option key={show.id} value={show.id}>
                          {formatDateVN(show.startTime)} - {formatDateVN(show.endTime)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                      <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </div>
                  </div>
                  {errors.showId && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.showId.message}
                    </span>
                  )}
                </div>
              </div>

              {tickets.length > 0 && (
                <div className="flex flex-col gap-4 pt-4 animate-in fade-in duration-300">
                  <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                    Chọn loại vé áp dụng <span className="text-red-500">*</span>
                  </label>

                  <div className="bg-slate-50/50 dark:bg-[#142210]/30 rounded-2xl border border-slate-100 dark:border-[#2a4225] p-5 space-y-4">
                    {/* Chọn tất cả */}
                    <div className="bg-white dark:bg-[#1c2e18] rounded-xl border border-slate-100 dark:border-[#2a4225] shadow-sm overflow-hidden hover:shadow transition-shadow">
                      <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors select-none">
                        <input
                          className="w-5 h-5 rounded border-gray-300 dark:border-[#2a4225] text-emerald-500 focus:ring-emerald-500 cursor-pointer bg-white dark:bg-[#142210]"
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            selectedTicketIds.length === tickets.length &&
                            tickets.length > 0
                          }
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            Chọn tất cả loại vé
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            Áp dụng cho mọi vị trí và hạng ghế trong sự kiện này
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Danh sách vé */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-white dark:bg-[#1c2e18] rounded-xl border border-slate-100 dark:border-[#2a4225] shadow-sm overflow-hidden hover:shadow transition-shadow"
                        >
                          <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors select-none">
                            <input
                              className="w-4.5 h-4.5 rounded border-gray-300 dark:border-[#2a4225] text-emerald-500 focus:ring-emerald-500 cursor-pointer bg-white dark:bg-[#142210]"
                              type="checkbox"
                              checked={selectedTicketIds.includes(ticket.id)}
                              onChange={() => handleTicketChange(ticket.id)}
                            />
                            <span className="text-sm font-medium text-slate-800 dark:text-white">
                              {ticket.name}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {errors.ticketTypeIds && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium mt-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.ticketTypeIds.message}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-[#2a4225] mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 h-12 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer bg-slate-100 dark:bg-[#2a4225] hover:bg-slate-200 dark:hover:bg-[#36532f] rounded-xl"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 h-12 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
                }`}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={18} thickness={5} color="inherit" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">check</span>
                  <span>Tạo mới Voucher</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default AddVoucher;
