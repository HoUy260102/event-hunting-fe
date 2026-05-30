import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const STATUS_LABELS = {
  AWAITING_PUBLICATION: "Chưa mở bán",
  CANCELLED: "Đã hủy",
  POSTPONED: "Hoãn lại",
  ACTIVE: "Đang hoạt động",
  TIER_SOLD_OUT: "Hết vé",
  COMING_SOON: "Sắp mở bán",
  SUSPENDED: "Ngưng bán",
  SOLD_OUT: "Hết vé",
  EXPIRED: "Hết hạn",
  INACTIVE: "Ngưng hoạt động",
  DELETED: "Đã xóa"
};

function TicketItem({ type, isOpen, onToggle }) {
  const isAvailable = type?.status === "ON_SALE";

  return (
    <div
      onClick={() => {
        if (!isAvailable) return;
        onToggle();
      }}
      className={`overflow-hidden rounded-lg border transition-all duration-300 ${
        !isAvailable
          ? "border-gray-200 bg-gray-100/60 opacity-65 cursor-not-allowed"
          : isOpen
          ? "border-green-500 bg-green-50 shadow-md cursor-pointer"
          : "border-gray-200 bg-gray-50 hover:border-green-300 cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-bold ${
                !isAvailable
                  ? "text-gray-400 line-through"
                  : isOpen
                  ? "text-green-700"
                  : "text-gray-800"
              }`}
            >
              {type.name} - {type.seatingType}
            </p>
            {isAvailable && (isOpen ? (
              <ExpandLessIcon sx={{ fontSize: 20, color: "green" }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 20, color: "gray" }} />
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          {isAvailable ? (
            <p className="text-sm font-bold text-green-600">
              {type.tierPrice?.toLocaleString()}đ
            </p>
          ) : (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-500 border border-red-100/50">
              {STATUS_LABELS[type?.status] || type?.status}
            </span>
          )}
        </div>
      </div>

      <div
        className={`px-4 text-xs text-gray-600 transition-all duration-300 ease-in-out ${
          isOpen && isAvailable ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-2 border-t border-green-200/50">
          <p className="leading-relaxed">{type.tierDescription}</p>
        </div>
      </div>
    </div>
  );
}

export default TicketItem;
