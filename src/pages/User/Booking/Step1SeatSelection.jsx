import BookingSummary from "../../../components/Booking/BookingSummary";
import SeatGrid from "../../../components/Booking/SeatGrid";
import SeatMapOverview from "../../../components/Booking/SeatMapOverview";
import TicketQuantityCard from "../../../components/Booking/TicketQuantityCard";
import TicketTypeSelector from "../../../components/Booking/TicketTypeSelector";

function Step1BookingSelection({
  show,
  activeTicketType,
  handleBackToOverview,
  handleSectionSelect,
  handleSeatClick,
  bookedSeats,
  selectedSeats,
  handleUpdateCart,
  cart,
  removeTicketTypeFromCart,
  handleRemoveSeat,
  onNext,
  soldOutSectionIds
}) {
  return (
    <>
      <div className="animate-fadeIn">
        <div className="px-5">
          {show?.seatMapType !== "NONE" && (
            <button
              type="button"
              onClick={handleBackToOverview}
              className="flex items-center text-blue-600 hover:underline mb-2"
            >
              <span>Quay lại sơ đồ tổng thể</span>
            </button>
          )}
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Cột trái */}
          <div className="lg:col-span-8 space-y-6">
            {/* KIỂM TRA: Nếu CHƯA có activeTicketType thì hiện Overview */}
            {!activeTicketType ? (
              <div className="space-y-6 animate-fadeIn">
                {show?.seatMapType !== "NONE" && (
                  <SeatMapOverview
                    onSectionClick={handleSectionSelect}
                    selectedSectionId={activeTicketType?.sectionId}
                    svgContent={show?.seatMapSvg}
                    soldOutSectionIds={soldOutSectionIds}
                  />
                )}

                {/* Khung thông báo giới hạn vé & Quy định tổng quan - DẠNG SLIM ĐỘC ĐÁO */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] p-4 md:p-5 space-y-3.5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-3">
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-base">info</span>
                      Thông tin & Quy định mua vé chung
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold italic flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">help</span>
                      Mẹo: Click vào các khu vực trên sơ đồ để bắt đầu chọn chỗ chi tiết
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Giới hạn mua vé */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50/20 border border-amber-100/10">
                      <span className="material-symbols-outlined text-amber-500 text-xl shrink-0">production_quantity_limits</span>
                      <p className="text-slate-500 text-[10px] font-semibold leading-relaxed">
                        Mỗi giao dịch tối đa <strong className="text-amber-600 font-bold">{show?.maxOrder || 10} vé</strong> để đảm bảo công bằng.
                      </p>
                    </div>
                    
                    {/* Giới hạn thời gian */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50/20 border border-emerald-100/10">
                      <span className="material-symbols-outlined text-emerald-500 text-xl shrink-0">schedule</span>
                      <p className="text-slate-500 text-[10px] font-semibold leading-relaxed">
                        Hệ thống giữ vị trí ghế tạm thời trong vòng <strong className="text-emerald-600 font-bold">10 phút</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {show?.seatMapType === "SECTION_WITH_SEATS" &&
                  activeTicketType?.seatingType === "SEATED" ? (
                  <SeatGrid
                    key={activeTicketType?.id}
                    svgContent={activeTicketType?.seatMapSvg}
                    onSeatClick={handleSeatClick}
                    bookedSeats={bookedSeats}
                    selectedSeats={selectedSeats}
                  />
                ) : (
                  <TicketQuantityCard
                    key={activeTicketType?.id}
                    ticketType={activeTicketType}
                    onUpdateCart={handleUpdateCart}
                    quan={
                      cart?.find(
                        (item) => item.ticketTypeId === activeTicketType?.id,
                      )?.quantity || 0
                    }
                  />
                )}

                {/* 3. Quy định & Hướng dẫn sử dụng vé */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] p-6 md:p-8 space-y-4">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
                    <span className="material-symbols-outlined text-slate-600 text-lg">gavel</span>
                    Quy định & Lưu ý khi tham gia sự kiện
                  </h4>
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-lg mt-0.5">check_circle</span>
                      <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                        <strong className="text-slate-700">Check-in sớm:</strong> Quầy soát vé sẽ mở cửa trước khi sự kiện bắt đầu <strong>90 phút</strong>. Vui lòng đến sớm để hoàn thành các thủ tục soát vé và ổn định vị trí đúng giờ.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-lg mt-0.5">check_circle</span>
                      <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                        <strong className="text-slate-700">Mã vé điện tử:</strong> Vui lòng chuẩn bị sẵn mã QR trên điện thoại di động hoặc in ra giấy. Mỗi mã QR chỉ có giá trị check-in một lần duy nhất cho một người tham dự.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-lg mt-0.5">check_circle</span>
                      <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                        <strong className="text-slate-700">Chính sách hoàn trả:</strong> Vé đã thanh toán thành công <strong>không được hỗ trợ hủy hoặc hoàn tiền</strong> dưới mọi hình thức, trừ trường hợp sự kiện bị ban tổ chức đơn phương hoãn hoặc hủy bỏ.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">warning</span>
                      <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                        <strong className="text-slate-700">Vật phẩm cấm:</strong> Nghiêm cấm mang theo vũ khí, chất cháy nổ, đồ uống có cồn, hoặc các thiết bị ghi hình chuyên nghiệp (ngoại trừ điện thoại di động cá nhân) vào khu vực diễn ra sự kiện.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Cột phải */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <TicketTypeSelector
              ticketTypes={show?.ticketTypes}
              onSelectTicket={handleSectionSelect}
              activeTypeId={activeTicketType?.id}
            />
            <BookingSummary
              cart={cart}
              removeTicketTypeFromCart={removeTicketTypeFromCart}
              handleRemoveSeat={handleRemoveSeat}
              onNext={onNext}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </>
  );
}
export default Step1BookingSelection;
