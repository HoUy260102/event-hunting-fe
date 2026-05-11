const ShowStatusButton = ({ status, onBuy }) => {
  const baseClass = "px-6 py-2 font-bold rounded-lg text-sm transition-all";
  switch (status) {
    case "ON_SALE":
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBuy) onBuy();
          }}
          className={`${baseClass} bg-[#2DC275] text-black hover:bg-[#22A05E] shadow-lg active:scale-95`}
        >
          Mua vé ngay
        </button>
      );

    case "SOLD_OUT":
      return (
        <div
          className={`${baseClass} bg-gray-600 text-white cursor-default text-center`}
        >
          Hết vé
        </div>
      );

    case "UPCOMING":
      return (
        <div
          className={`${baseClass} bg-blue-600 text-white cursor-default text-center`}
        >
          Sắp diễn ra
        </div>
      );

    case "HAPPENING":
      return (
        <div
          className={`${baseClass} bg-orange-500 text-white cursor-default text-center animate-pulse`}
        >
          Đang diễn ra
        </div>
      );

    case "FINISHED":
      return (
        <div
          className={`${baseClass} bg-gray-800 text-gray-400 cursor-default text-center`}
        >
          Đã kết thúc
        </div>
      );

    case "CANCELLED":
      return (
        <div
          className={`${baseClass} bg-red-700 text-white cursor-default text-center opacity-70`}
        >
          Đã hủy
        </div>
      );

    case "POSTPONED":
      return (
        <div
          className={`${baseClass} bg-yellow-500 text-white cursor-default text-center opacity-70`}
        >
          Đã hủy
        </div>
      );

    default:
      return null;
  }
};
export default ShowStatusButton;
