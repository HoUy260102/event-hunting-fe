import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function TicketItem({ type, isOpen, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`overflow-hidden rounded-lg border transition-all duration-300 cursor-pointer ${
        isOpen
          ? "border-green-500 bg-green-50 shadow-md"
          : "border-gray-200 bg-gray-50 hover:border-green-300"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-bold ${isOpen ? "text-green-700" : "text-gray-800"}`}
            >
              {type.name} - {type.seatingType}
            </p>
            {isOpen ? (
              <ExpandLessIcon sx={{ fontSize: 20, color: "green" }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 20, color: "gray" }} />
            )}
          </div>
        </div>
        <p className="text-sm font-bold text-green-600">
          {type.tierPrice?.toLocaleString()}đ
        </p>
      </div>

      <div
        className={`px-4 text-xs text-gray-600 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
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
