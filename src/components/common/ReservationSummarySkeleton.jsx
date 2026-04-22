import React from "react";

const ReservationSummarySkeleton = () => {
  return (
    <main
      className="flex flex-col items-center justify-center px-4 py-20 min-h-screen"
      style={{
        background: "radial-gradient(circle at top left, #252626 0%, #0e0e0e 100%)",
      }}
    >
      {/* Success Card Skeleton */}
      <div className="w-full max-w-2xl bg-[#131313] border border-[#474848]/20 rounded-xl overflow-hidden shadow-2xl relative animate-pulse">
        {/* Accent line top (Màu xám tạm thời thay cho Green) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#474848]/30"></div>

        <div className="p-8 md:p-12 flex flex-col items-center text-center">
          {/* Checkmark Icon Circle Skeleton */}
          <div className="w-24 h-24 bg-[#474848]/20 rounded-2xl mb-8 border border-[#474848]/10"></div>

          {/* Title Skeleton */}
          <div className="h-8 w-64 bg-[#474848]/30 rounded-md mb-4"></div>

          {/* Description Skeleton */}
          <div className="h-4 w-80 bg-[#474848]/20 rounded-md mb-10"></div>

          {/* Order Details Card Skeleton */}
          <div className="w-full bg-[#1f2020] rounded-lg p-6 md:p-8 text-left border border-[#474848]/10 mb-10">
            {/* Header section (ID & Status) */}
            <div className="flex justify-between items-start border-b border-[#474848]/20 pb-4 mb-6">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-[#474848]/40 rounded"></div>
                <div className="h-6 w-48 bg-[#474848]/30 rounded"></div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="h-3 w-16 bg-[#474848]/40 rounded"></div>
                <div className="h-6 w-24 bg-[#474848]/20 rounded-full"></div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
              {/* Event Info Skeleton */}
              <div className="space-y-4 border-b border-[#474848]/20 pb-6">
                <div className="h-3 w-32 bg-[#474848]/40 rounded"></div>
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-[#474848]/30 rounded"></div>
                  <div className="h-5 w-1/2 bg-[#474848]/30 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 bg-[#474848]/40 rounded-full"></div>
                   <div className="h-4 w-2/3 bg-[#474848]/20 rounded"></div>
                </div>
              </div>

              {/* Customer Info Skeleton (Grid 2 cột) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-b border-[#474848]/20 pb-6">
                <div className="col-span-2 h-3 w-32 bg-[#474848]/40 rounded"></div>
                <div className="col-span-2 space-y-2">
                  <div className="h-3 w-24 bg-[#474848]/20 rounded"></div>
                  <div className="h-5 w-48 bg-[#474848]/30 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-[#474848]/20 rounded"></div>
                  <div className="h-5 w-40 bg-[#474848]/30 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-[#474848]/20 rounded"></div>
                  <div className="h-5 w-40 bg-[#474848]/30 rounded"></div>
                </div>
              </div>

              {/* Payment Info Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border-b border-[#474848]/20 pb-6">
                <div className="col-span-2 h-3 w-32 bg-[#474848]/40 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-[#474848]/20 rounded"></div>
                  <div className="h-5 w-36 bg-[#474848]/30 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-[#474848]/20 rounded"></div>
                  <div className="h-5 w-36 bg-[#474848]/30 rounded"></div>
                </div>
              </div>

              {/* Ticket Items Skeleton */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-[#474848]/40 rounded"></div>
                    <div className="h-5 w-32 bg-[#474848]/30 rounded"></div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="h-3 w-16 bg-[#474848]/40 rounded"></div>
                    <div className="h-6 w-24 bg-[#474848]/30 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Final Amount Skeleton */}
              <div className="space-y-2 pt-4">
                <div className="h-3 w-20 bg-[#474848]/40 rounded"></div>
                <div className="h-7 w-32 bg-[#474848]/30 rounded"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <div className="flex-1 h-14 bg-[#474848]/30 rounded-full"></div>
            <div className="flex-1 h-14 bg-[#474848]/20 rounded-full border border-[#474848]/30"></div>
          </div>
        </div>
      </div>

      {/* Footer Support Skeleton */}
      <div className="mt-8 flex items-center gap-2">
        <div className="w-4 h-4 bg-[#474848]/30 rounded-full"></div>
        <div className="h-4 w-56 bg-[#474848]/20 rounded-md"></div>
      </div>
    </main>
  );
};

export default ReservationSummarySkeleton;