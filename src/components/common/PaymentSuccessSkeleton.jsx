import React from "react";

const PaymentSuccessSkeleton = () => {
  return (
    <main
      className="flex flex-col items-center justify-center px-4 py-20 animate-pulse"
      style={{
        background: "radial-gradient(circle at top left, #252626 0%, #0e0e0e 100%)",
        minHeight: "100vh"
      }}
    >
      {/* Success Card Skeleton */}
      <div className="w-full max-w-2xl bg-[#131313] border border-[#474848]/20 rounded-xl overflow-hidden shadow-2xl relative">
        {/* Top bar skeleton */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#22c55e]/30"></div>
        
        <div className="p-8 md:p-12 flex flex-col items-center text-center">
          {/* Icon Circle Skeleton */}
          <div className="w-24 h-24 bg-[#252626] rounded-2xl mb-8 border border-[#474848]/20"></div>
          
          {/* Title Skeleton */}
          <div className="h-8 w-64 bg-[#252626] rounded-md mb-4"></div>
          
          {/* Description Skeleton */}
          <div className="space-y-2 mb-10 w-full max-w-md">
            <div className="h-4 bg-[#252626] rounded w-full"></div>
            <div className="h-4 bg-[#252626] rounded w-3/4 mx-auto"></div>
          </div>

          {/* Order Details Card Skeleton */}
          <div className="w-full bg-[#1f2020] rounded-lg p-6 md:p-8 text-left border border-[#474848]/10 mb-10">
            {/* Order ID & Status Row */}
            <div className="flex justify-between items-start border-b border-[#474848]/20 pb-4 mb-6">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-[#252626] rounded"></div>
                <div className="h-6 w-32 bg-[#252626] rounded"></div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="h-3 w-16 bg-[#252626] rounded"></div>
                <div className="h-6 w-24 bg-[#252626] rounded-full"></div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Event Info Skeleton */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-[#252626] rounded"></div>
                  <div className="h-5 w-3/4 bg-[#252626] rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-[#252626] rounded"></div>
                  <div className="h-5 w-1/2 bg-[#252626] rounded"></div>
                </div>
                {/* Location Skeleton */}
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-[#252626] rounded-full"></div>
                  <div className="h-4 w-40 bg-[#252626] rounded"></div>
                </div>
              </div>

              {/* Items List Skeleton (Mock 2 items) */}
              <div className="pt-4 border-t border-[#474848]/10 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-[#252626] rounded"></div>
                      <div className="h-5 w-32 bg-[#252626] rounded"></div>
                    </div>
                    <div className="space-y-2 flex flex-col items-end">
                      <div className="h-3 w-16 bg-[#252626] rounded"></div>
                      <div className="h-6 w-24 bg-[#252626] rounded"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount Skeleton */}
              <div className="pt-4 border-t border-[#474848]/10">
                <div className="h-3 w-20 bg-[#252626] rounded mb-2"></div>
                <div className="h-7 w-40 bg-[#252626] rounded"></div>
              </div>
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1 h-14 bg-[#252626] rounded-full"></div>
            <div className="flex-1 h-14 bg-[#252626] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Help Support Skeleton */}
      <div className="mt-8 flex items-center gap-2">
        <div className="h-4 w-4 bg-[#252626] rounded-full"></div>
        <div className="h-4 w-48 bg-[#252626] rounded"></div>
      </div>
    </main>
  );
};

export default PaymentSuccessSkeleton;