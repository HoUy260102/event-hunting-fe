import React from "react";

const EventCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-[hsla(0,0%,100%,.07)] rounded-xl overflow-hidden border border-white/5 h-full animate-pulse">
      {/* 1. Phần Image Skeleton (khớp với h-48 bạn dùng ở EventCard) */}
      <div className="relative h-48 bg-zinc-800">
        {/* Giả lập cái nút favorite và price tag nếu muốn */}
        <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-zinc-700"></div>
        <div className="absolute bottom-3 right-3 h-7 w-24 rounded-lg bg-zinc-700"></div>
      </div>

      {/* 2. Phần Content Section */}
      <div className="p-4 flex flex-col flex-grow space-y-4">
        {/* Giả lập Category Tag */}
        <div className="h-4 bg-zinc-800 rounded w-1/4"></div>

        {/* Giả lập Title (2 dòng như line-clamp-2 bạn dùng) */}
        <div className="space-y-2">
          <div className="h-5 bg-zinc-700 rounded w-full"></div>
          <div className="h-5 bg-zinc-700 rounded w-2/3"></div>
        </div>

        {/* Giả lập Location & Date */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-zinc-800 rounded-full"></div>{" "}
            {/* Icon */}
            <div className="h-3 bg-zinc-800 rounded w-1/2"></div> {/* Text */}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-zinc-800 rounded-full"></div>{" "}
            {/* Icon */}
            <div className="h-3 bg-zinc-800 rounded w-3/4"></div> {/* Text */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
