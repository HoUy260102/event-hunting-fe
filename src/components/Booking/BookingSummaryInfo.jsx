const BookingSummaryInfo = ({ cart = [] }) => {
  const subTotal = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );
  const total = subTotal;
  const noScrollbarStyles = `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full">
      <style>{noScrollbarStyles}</style>
      <div className="p-6 bg-slate-900 text-white">
        <h3 className="text-lg font-bold">Tóm tắt đơn hàng</h3>
      </div>

      <div className="p-6">
        {/* Danh sách các mục trong giỏ hàng */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          {cart.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">
              Giỏ hàng trống
            </p>
          )}

          {cart.map((item, idx) => (
            <div
              key={idx}
              className="pb-3 border-b border-gray-50 last:border-0"
            >
              {/* Header của loại vé */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">
                    {item.ticketTypeName}
                  </h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tight">
                    {item.tierName}
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {(item.unitPrice * item.quantity).toLocaleString()}đ
                </span>
              </div>

              {/* Chi tiết cho vé ngồi (Fixed) */}
              {item?.selectedSeats?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.selectedSeats.map((seat) => (
                    <div
                      key={seat.id}
                      className="group flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded-md"
                    >
                      <span className="mr-1 text-[11px] font-bold">
                        {seat.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Chi tiết cho vé đứng (Standing) */
                <div className="flex items-center justify-between text-gray-600 bg-gray-50 px-3 py-2 rounded-lg mt-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      confirmation_number
                    </span>
                    <span className="text-xs font-medium">Số lượng:</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold border-r border-gray-200 px-4">
                      x{item.quantity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Phần tính tiền */}
        <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-100 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              Tạm tính ({cart.reduce((a, b) => a + b.quantity, 0)} vé)
            </span>
            <span className="font-semibold text-gray-900">
              {subTotal.toLocaleString()}đ
            </span>
          </div>

          <div className="flex justify-between items-center py-4 mt-2 border-t border-gray-100">
            <span className="text-base font-bold text-gray-900 uppercase tracking-tight">
              Tổng cộng
            </span>
            <div className="text-right">
              <span className="text-2xl font-black text-green-600 tracking-tighter">
                {total.toLocaleString()}đ
              </span>
              <p className="text-[10px] text-gray-400 font-medium">
                Đã bao gồm VAT
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[10px] text-center text-gray-400 leading-relaxed uppercase font-bold tracking-widest">
          Bảo mật • An toàn • Nhanh chóng
        </p>
      </div>
    </div>
  );
};

export default BookingSummaryInfo;
