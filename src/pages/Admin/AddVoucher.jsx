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
    quantity: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
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
    },
  });

  const selectedTicketIds = watch("ticketTypeIds");
  const hasMax = watch("maxDiscountValue") !== undefined && watch("maxDiscountValue") !== null;

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
      const res = error;
      if (
        res?.status === 400 &&
        (res?.code === "VOUCHER_VALIDATION_ERROR" ||
          res?.code === "VALIDATION_ERROR") &&
        typeof res.details === "object"
      ) {
        Object.entries(res.details).forEach(([field, message]) => {
          setError(field, {
            type: "server",
            message,
          });
        });
        return;
      }

      setModal({
        isOpen: true,
        title: "Lỗi",
        message: res?.message || error.message,
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
      <div className="w-full flex flex-col gap-3 mb-8">
        <h2 className="text-2xl min-[480px]:text-3xl font-extrabold text-[#111b0d] tracking-tight">
          Tạo mới khuyến mãi
        </h2>
        <p className="text-slate-500">
          Thêm khuyến mãi mới vào hệ thống.
        </p>
      </div>
      <main className="flex-1 flex flex-col min-h-screen bg-[#f3f4f6]">
        {/* Bao bọc bằng thẻ form để handleSubmit hoạt động */}
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="p-10 space-y-8 max-w-5xl mx-auto w-full flex-1"
        >
          {/* SECTION 1: General Info */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-12 bg-white p-8 rounded-xl border border-[#e5e7eb] shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                  Voucher Name
                </label>
                <input
                  {...register("name")}
                  className={`w-full bg-gray-50 border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827] ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Ví dụ: Giảm giá mùa hè 2024"
                  type="text"
                />
                {errors.name && (
                  <p className="text-red-500 text-[10px]">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                    Voucher Code
                  </label>
                  <input
                    {...register("code")}
                    className="flex-1 bg-gray-50 w-full border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827] font-mono uppercase"
                    placeholder="SUMMER24"
                    type="text"
                  />
                  {errors.code && (
                    <p className="text-red-500 text-[10px]">
                      {errors.code.message}
                    </p>
                  )}
                  <div className="flex gap-2"></div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                    Số lượng voucher áp dụng
                  </label>
                  <input
                    {...register("quantity")}
                    className="w-full bg-gray-50 border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827]"
                    placeholder="0"
                    type="number"
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-[10px]">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                    Ngày bắt đầu
                  </label>
                  <input
                    {...register("startTime")}
                    className="w-full bg-gray-50 border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827]"
                    type="datetime-local"
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-[10px]">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                    Ngày kết thúc
                  </label>
                  <input
                    {...register("endTime")}
                    className="w-full bg-gray-50 border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827]"
                    type="datetime-local"
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-[10px]">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>

              {/* FIELD: Áp dụng cho đơn hàng tối thiểu */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                  Áp dụng cho đơn hàng tối thiểu (VNĐ)
                </label>
                <input
                  {...register("minOrderValue")}
                  className="w-full bg-gray-50 border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827]"
                  placeholder="0"
                  type="number"
                />
                {errors.minOrderValue && (
                  <p className="text-red-500 text-[10px]">
                    {errors.minOrderValue.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                  Mức giảm
                </label>
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-[#e5e7eb]">
                  <input
                    {...register("discountValue")}
                    className="flex-1 bg-transparent text-lg text-[#111827] px-4 border-transparent focus:border-transparent focus:ring-0 focus:outline-none"
                    placeholder="0"
                    type="number"
                    style={{ boxShadow: "none" }}
                  />
                  <div className="flex bg-white rounded-lg p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setDiscountType("VALUE")}
                      className={`px-4 py-2 text-[10px] font-bold rounded-md transition-all duration-200 ${discountType === "VALUE"
                          ? "bg-[#53d22d] text-[#152012] shadow-sm"
                          : "text-[#6b7280] hover:text-[#111827]"
                        }`}
                    >
                      VALUE (VNĐ)
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiscountType("PERCENT")}
                      className={`px-4 py-2 text-[10px] font-bold rounded-md transition-all duration-200 ${discountType === "PERCENT"
                          ? "bg-[#53d22d] text-[#152012] shadow-sm"
                          : "text-[#6b7280] hover:text-[#111827]"
                        }`}
                    >
                      PERCENT (%)
                    </button>
                  </div>
                </div>
                {errors.discountValue && (
                  <p className="text-red-500 text-[10px]">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>

              {discountType === "PERCENT" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hasMax}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue("maxDiscountValue", 0);
                        } else {
                          setValue("maxDiscountValue", undefined);
                        }
                      }}
                    />
                    Giới hạn giảm tối đa
                  </label>
                </div>
              )}

              {discountType === "PERCENT" && hasMax && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                    Giảm tối đa (VNĐ)
                  </label>

                  <input
                    {...register("maxDiscountValue")}
                    className="w-full bg-gray-50 border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827]"
                    placeholder="0"
                    type="number"
                  />

                  {errors.maxDiscountValue && (
                    <p className="text-red-500 text-xs">
                      {errors.maxDiscountValue.message}
                    </p>
                  )}
                </div>
              )}

              <input
                type="hidden"
                {...register("discountType")}
                value={discountType}
              />

              <input
                type="hidden"
                {...register("scope")}
                value={voucherScope}
              />

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                  Loại voucher
                </label>

                <div className="flex gap-3">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setVoucherScope("SYSTEM")}
                      className={`px-4 py-2 text-xs font-bold rounded-lg ${voucherScope === "SYSTEM"
                          ? "bg-[#53d22d] text-black"
                          : "bg-white text-gray-600"
                        }`}
                    >
                      SYSTEM
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setVoucherScope("ORGANIZER")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg ${voucherScope === "ORGANIZER"
                        ? "bg-[#53d22d] text-black"
                        : "bg-white text-gray-600"
                      }`}
                  >
                    ORGANIZER
                  </button>
                </div>
              </div>
            </div>
          </section>

          {voucherScope === "ORGANIZER" && (
            <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
              <div className="md:col-span-12 bg-white p-8 rounded-xl border border-[#e5e7eb] shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                      Nhập mã sự kiện
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value)}
                        className="flex-1 bg-gray-50 border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827]"
                        placeholder="Ví dụ: EVENT123"
                        type="text"
                      />
                      <button
                        type="button"
                        onClick={handleSearchEvent}
                        className="bg-[#53d22d] text-[#152012] px-4 rounded-lg text-xs font-bold transition-colors hover:brightness-105"
                      >
                        TÌM KIẾM
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                      Select Show
                    </label>
                    <select
                      onChange={(e) => {
                        const value = e.target.value;
                        handleSelectShow(value);
                        setValue("showId", value, { shouldValidate: true });
                      }}
                      className="w-full bg-gray-50 border-[#e5e7eb] rounded-lg py-3 px-4 text-sm focus:ring-[#53d22d]/50 focus:border-[#53d22d] text-[#111827] appearance-none"
                    >
                      <option value="">Chọn suất diễn</option>
                      {shows?.map((show) => (
                        <option key={show.id} value={show.id}>
                          {formatDateVN(show.startTime)} -{" "}
                          {formatDateVN(show.endTime)}
                        </option>
                      ))}
                    </select>
                    {errors.showId && (
                      <p className="text-red-500 text-[10px] italic">
                        {errors.showId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-widest">
                    Ticket Type Selection
                  </label>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
                      <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          className="w-5 h-5 rounded border-gray-300 text-[#53d22d] focus:ring-[#53d22d]"
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            selectedTicketIds.length === tickets.length &&
                            tickets.length > 0
                          }
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#111827]">
                            Chọn tất cả loại vé
                          </p>
                          <p className="text-[10px] text-[#6b7280]">
                            Áp dụng cho mọi vị trí và hạng ghế trong sự kiện này
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden"
                        >
                          <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              className="w-4 h-4 rounded border-gray-300 text-[#53d22d] focus:ring-[#53d22d]"
                              type="checkbox"
                              checked={selectedTicketIds.includes(ticket.id)}
                              onChange={() => handleTicketChange(ticket.id)}
                            />
                            <span className="text-sm font-medium text-[#111827]">
                              {ticket.name}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.ticketTypeIds && (
                      <p className="text-red-500 text-[10px] italic">
                        {errors.ticketTypeIds.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex items-center justify-end gap-4 py-12 border-t border-[#e5e7eb]">
            <button
              type="button"
              s
              onClick={() => {
                handleCancel();
              }}
              className="px-8 py-3 text-sm font-bold text-[#6b7280] hover:text-[#111827] transition-colors uppercase tracking-widest"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-10 py-3 text-sm font-black rounded-full uppercase tracking-widest flex items-center justify-center gap-2 transition-all
    ${isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#53d22d] text-[#152012] hover:brightness-110 transform hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-[#53d22d]/20"
                }`}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={18} thickness={5} />
                  Đang tạo...
                </>
              ) : (
                "Lưu Voucher"
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default AddVoucher;
