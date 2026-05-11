import React, { useState } from "react";
import { formatDateVN } from "../../../utils/format";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

const EventCard = ({ event, user, openLogin }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(event?.isSaved || false);
  const [loading, setLoading] = useState(false);
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      openLogin();
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      if (isSaved) {
        await axiosClient.delete(`/favorites/${event.id}`);
        setIsSaved(false);
      } else {
        await axiosClient.post(`/favorites/${event.id}`);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý favorite:", error);
      alert(error?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => {
        navigate(`/event/${event?.id}/details`);
      }}
      className="group relative flex flex-col bg-[hsla(0,0%,100%,.07)] rounded-xl overflow-hidden 
             border border-white/5 hover:border-white/20 
             hover:-translate-y-1 transition-all duration-300 h-full cursor-pointer"
    >
      {/* Top Image Section */}
      <div className="relative h-45 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={event?.poster?.url}
          alt={event?.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Price Tag Overlay */}
        {event?.minPrice && (
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-md border border-slate-100">
            <span className="text-green-500 text-sm">
              Từ {event?.minPrice?.toLocaleString()} đ
            </span>
          </div>
        )}
        {/* Save Action */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={loading}
          className={`absolute top-4 right-4 h-9 w-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg z-10
            ${
              isSaved
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white hover:bg-white hover:text-red-500"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="material-symbols-outlined text-xl">favorite</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 rounded bg-[#46ec13]/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
            {event?.category === null
              ? "Chưa phân loại"
              : event?.category?.status === "INACTIVE"
                ? "Danh mục đã ngừng hoạt động"
                : event?.category?.name}
          </span>
        </div>
        <h5 className="font-bold text-white leading-snug mb-4 line-clamp-2 h-12">
          {event?.name}
        </h5>
        <div className="flex flex-col gap-1.5 text-slate-500 text-[13px] mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-white">
              location_on
            </span>
            <span className="truncate text-white">{event?.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-white">
              calendar_today
            </span>
            <span className="text-white">
              {formatDateVN(event?.startTime)} - {formatDateVN(event?.endTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
