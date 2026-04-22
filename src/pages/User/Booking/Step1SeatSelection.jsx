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
              show?.seatMapType !== "NONE" && (
                <SeatMapOverview
                  onSectionClick={handleSectionSelect}
                  selectedSectionId={activeTicketType?.sectionId}
                  svgContent={show?.seatMapSvg}
                  soldOutSectionIds={soldOutSectionIds}
                />
              )
            ) : /* KIỂM TRA: Nếu ĐÃ CÓ activeTicketType thì hiện SeatGrid + Nút Undo */
            show?.seatMapType === "SECTION_WITH_SEATS" &&
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
          </div>
          {/* Cột phải */}
          <div className="lg:col-span-4 space-y-6">
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
            />
          </div>
        </div>
      </div>
    </>
  );
}
export default Step1BookingSelection;
