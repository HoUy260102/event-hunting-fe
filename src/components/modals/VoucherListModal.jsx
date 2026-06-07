import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { formatDateVN } from "../../utils/format";
import VoucherSkeleton from "../../components/common/VoucherSkeleton";

const VoucherListModal = ({
  isOpen,
  onClose,
  showId,
  selectedId,
  handleSelectVoucher,
  toastSuccess,
  toastError,
}) => {
  const [vouchers, setVouchers] = useState([]);
  const [code, setCode] = useState();
  const [selectedInId, setSelectedId] = useState(selectedId);
  const [isLoading, setIsLoading] = useState(true);
  const toggleVoucher = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };
  const handleApplyVoucherByCode = async () => {
    try {
      const res = await axiosClient.get(`/shows/${showId}/vouchers/search`, {
        params: { code },
      });
      toastSuccess(
        "Áp dụng voucher " + res?.data?.name + " vào đơn hàng thành công.",
      );
      handleSelectVoucher(res?.data?.id);
    } catch (error) {
      console.log(error?.message);
      toastError(error?.message);
    }
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setIsLoading(true);
        const res = await axiosClient.get(`/shows/${showId}/vouchers`);
        setVouchers(res?.data);
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVouchers();
  }, [showId]);

  useEffect(() => {
    setSelectedId(selectedId);
  }, [selectedId, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Cấu hình CSS đặc thù cho Icon và Scrollbar */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F3EDF7;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CAC4D0;
          border-radius: 10px;
        }
      `}</style>

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        {/* Modal Content */}
        <div className="bg-[#FFFFFF] w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.15)] border border-[#CAC4D0]/30">
          {/* Modal Header */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-[#CAC4D0]/20">
            <h3 className="font-['Manrope'] text-lg font-bold tracking-tight text-[#1C1B1F]">
              Chọn tối đa 1 voucher
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="material-symbols-outlined text-[#49454F] hover:text-[#1C1B1F] transition-colors"
            >
              close
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Search Section */}
            <div className="p-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    onChange={(e) => setCode(e.target.value)}
                    value={code}
                    className="w-full bg-[#F3EDF7] border-none rounded-lg px-4 py-3 text-[#1C1B1F] placeholder:text-[#49454F] focus:ring-1 focus:ring-[#00FF85] transition-all font-medium text-sm"
                    placeholder="Nhập mã voucher"
                    type="text"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyVoucherByCode}
                  className="px-6 py-3 bg-[#00FF85] text-black rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Section 1: Ban Tổ Chức */}
            <div className="px-6 mb-8">
              <h2 className="font-['Manrope'] text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#49454F] mb-4">
                VOUCHER TỪ BAN TỔ CHỨC
              </h2>
              {isLoading ? (
                <VoucherSkeleton />
              ) : vouchers?.filter((voucher) => voucher.scope === "ORGANIZER")
                ?.length > 0 ? (
                <div className="space-y-4">
                  {vouchers
                    ?.filter((voucher) => voucher.scope === "ORGANIZER")
                    .map((voucher) => (
                      <div
                        key={voucher.id}
                        onClick={() => toggleVoucher(voucher.id)}
                        className={`${selectedInId === voucher.id ? "border-[#00FF85]/60" : "border-[#CAC4D0]/30 hover:border-[#00FF85]/40"}  group relative bg-[#FFFFFF] rounded-xl border-2 flex overflow-hidden hover:bg-[#F3EDF7]/50 transition-colors`}
                      >
                        <div className="w-24 bg-white border-r border-[#CAC4D0]/20 flex items-center justify-center p-4">
                          <span className="material-symbols-outlined text-4xl text-[#49454F]">
                            sell
                          </span>
                        </div>

                        <div className="flex-1 p-4 flex justify-between items-center">
                          <div className="space-y-1">
                            <h3 className="font-['Manrope'] font-bold text-[#1C1B1F]">
                              {voucher.name}
                            </h3>
                            {voucher?.discountType === "PERCENT" ? (
                              <p className="text-[11px] text-[#49454F] font-medium">
                                Giảm {voucher.discountValue} %
                              </p>
                            ) : (
                              <p className="text-[11px] text-[#49454F] font-medium">
                                Giảm{" "}
                                {voucher?.discountValue?.toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </p>
                            )}
                            {voucher?.minOrderValue > 0 && (
                              <p className="text-[11px] text-[#49454F] font-medium">
                                Áp dụng cho đơn hàng từ{" "}
                                {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                              </p>
                            )}
                            {voucher?.maxDiscountValue && (
                              <p className="text-[11px] text-[#49454F] font-medium">
                                Giảm tối đa{" "}
                                {voucher?.maxDiscountValue?.toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </p>
                            )}
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-[10px] text-[#49454F]/70 font-medium">
                                NBD: {formatDateVN(voucher.startTime)}
                              </span>
                              <span className="text-[10px] text-[#49454F]/70 font-medium">
                                HSD: {formatDateVN(voucher.endTime)}
                              </span>
                            </div>
                          </div>

                          {/* checkbox */}
                          <div className="relative flex items-center justify-center w-6 h-6">
                            <label className="relative flex items-center justify-center w-6 h-6 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedInId === voucher.id}
                                readOnly
                                className="
              peer
              appearance-none
              w-6 h-6
              rounded-full
              border-2 border-[#CAC4D0]
              bg-white
              checked:bg-[#00FF85]
              checked:border-[#00FF85]
              transition-all
            "
                              />

                              <svg
                                className="absolute w-3 h-3 text-white hidden peer-checked:block"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-[#F3EDF7] rounded-xl border border-dashed border-[#CAC4D0]/40">
                  <span className="material-symbols-outlined text-4xl text-[#CAC4D0] mb-3">
                    confirmation_number
                  </span>
                  <p className="text-sm text-[#49454F] font-medium">
                    Chưa có voucher nào
                  </p>
                </div>
              )}
            </div>

            {/* Section 2: Ticketbox */}
            <div className="px-6 pb-6">
              <h2 className="font-['Manrope'] text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#49454F] mb-4">
                VOUCHER TỪ EVENTHUNTING
              </h2>
              {isLoading ? (
                <VoucherSkeleton />
              ) : vouchers?.filter((voucher) => voucher.scope === "SYSTEM")
                ?.length > 0 ? (
                <div className="space-y-4">
                  {vouchers
                    ?.filter((voucher) => voucher.scope === "SYSTEM")
                    .map((voucher) => (
                      <div
                        key={voucher.id}
                        onClick={() => toggleVoucher(voucher.id)}
                        className={`${selectedInId === voucher.id ? "border-[#00FF85]/60" : "border-[#CAC4D0]/30 hover:border-[#00FF85]/40"}  group relative bg-[#FFFFFF] rounded-xl border-2 flex overflow-hidden hover:bg-[#F3EDF7]/50 transition-colors`}
                      >
                        <div className="w-24 bg-white border-r border-[#CAC4D0]/20 flex items-center justify-center p-4">
                          <span className="material-symbols-outlined text-4xl text-[#49454F]">
                            sell
                          </span>
                        </div>

                        <div className="flex-1 p-4 flex justify-between items-center">
                          <div className="space-y-1">
                            <h3 className="font-['Manrope'] font-bold text-[#1C1B1F]">
                              {voucher.name}
                            </h3>
                            {voucher?.discountType === "PERCENT" ? (
                              <p className="text-[11px] text-[#49454F] font-medium">
                                Giảm {voucher.discountValue} %
                              </p>
                            ) : (
                              <p className="text-[11px] text-[#49454F] font-medium">
                                Giảm{" "}
                                {voucher?.discountValue?.toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </p>
                            )}
                            {voucher?.minOrderValue > 0 && (
                              <p className="text-[11px] text-[#49454F] font-medium">
                                Áp dụng cho đơn hàng từ{" "}
                                {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                              </p>
                            )}
                            {voucher?.maxDiscountValue && (
                              <p className="text-[11px] text-[#49454F] font-medium">
                                Giảm tối đa{" "}
                                {voucher?.maxDiscountValue?.toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </p>
                            )}
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-[10px] text-[#49454F]/70 font-medium">
                                NBD: {formatDateVN(voucher.startTime)}
                              </span>
                              <span className="text-[10px] text-[#49454F]/70 font-medium">
                                HSD: {formatDateVN(voucher.endTime)}
                              </span>
                            </div>
                          </div>

                          {/* checkbox */}
                          <div className="relative flex items-center justify-center w-6 h-6">
                            <label className="relative flex items-center justify-center w-6 h-6 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedInId === voucher.id}
                                readOnly
                                className="
              peer
              appearance-none
              w-6 h-6
              rounded-full
              border-2 border-[#CAC4D0]
              bg-white
              checked:bg-[#00FF85]
              checked:border-[#00FF85]
              transition-all
            "
                              />

                              <svg
                                className="absolute w-3 h-3 text-white hidden peer-checked:block"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-[#F3EDF7] rounded-xl border border-dashed border-[#CAC4D0]/40">
                  <span className="material-symbols-outlined text-4xl text-[#CAC4D0] mb-3">
                    confirmation_number
                  </span>
                  <p className="text-sm text-[#49454F] font-medium">
                    Chưa có voucher nào
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 bg-[#FFFFFF] border-t border-[#CAC4D0]/20 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-4 border border-[#CAC4D0] text-[#1C1B1F] font-bold rounded-xl hover:bg-[#F3EDF7] active:scale-[0.98] transition-all uppercase tracking-wider text-xs"
            >
              Huỷ bỏ
            </button>
            <button
              type="button"
              onClick={() => {
                handleSelectVoucher(selectedInId);
              }}
              className="py-4 bg-[#00FF85] text-black font-black rounded-xl shadow-[0_8px_20px_rgba(0,255,133,0.2)] hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-wider text-xs"
            >
              Xong
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoucherListModal;
