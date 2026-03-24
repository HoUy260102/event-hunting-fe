import React from "react";

const TicketCardSkeleton = ({ rows = 3 }) => {
  // Tạo mảng dựa trên số lượng rows truyền vào
  const skeletonItems = Array.from({ length: rows });

  return (
    <>
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="w-full md:min-w-5xl relative flex flex-col md:flex-row bg-[#131313] rounded-2xl overflow-visible border border-[#474848]/10 ticket-notches shadow-2xl animate-pulse mb-8"
        >
          {/* Date Sidebar (Left 25%) */}
          <div className="w-full md:w-1/4 flex flex-col items-center justify-center p-8 py-5">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-12 w-16 bg-[#474848]/30 rounded-md"></div>
              <div className="h-5 w-20 bg-[#474848]/20 rounded"></div>
              <div className="h-4 w-12 bg-[#474848]/10 rounded mt-1"></div>
            </div>
          </div>

          {/* Perforation Divider (Visual only) */}
          <div className="hidden md:block ticket-divider opacity-20"></div>

          {/* Main Content (Right 75%) */}
          <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
            <div>
              {/* Status Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="h-7 w-28 bg-[#474848]/30 rounded-full"></div>
                <div className="h-7 w-24 bg-[#474848]/20 rounded-full"></div>
              </div>

              {/* Title */}
              <div className="h-8 w-3/4 bg-[#474848]/40 rounded-md mb-6"></div>

              {/* Details Grid */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#474848]/30 rounded-full"></div>
                    <div
                      className={`h-4 bg-[#474848]/20 rounded ${i === 3 ? "w-2/3" : "w-1/2"}`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-3 border-t border-[#474848]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="h-5 w-28 bg-[#474848]/20 rounded"></div>
              <div className="h-11 w-full sm:w-32 bg-[#474848]/40 rounded-xl"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TicketCardSkeleton;
