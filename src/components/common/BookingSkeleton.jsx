import React from "react";

const BookingSkeleton = () => {
  return (
    <div className="bg-slate-50 min-h-screen animate-pulse">
      {/* 1. TOP STEPPER SKELETON */}
      <div className="min-h-[5rem] w-full bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Back button + Step pills */}
        <div className="flex items-center gap-3 md:gap-6 w-full justify-between md:justify-start">
          {/* Back button */}
          <div className="w-10 h-10 shrink-0 rounded-full bg-gray-200"></div>

          {/* Stepper items */}
          <div className="pl-2 flex items-center gap-4 md:gap-8 overflow-x-auto py-1">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"></div>
                <div className="h-4 w-16 md:w-20 bg-gray-200 rounded"></div>
                {step < 3 && (
                  <div className="hidden sm:block w-8 h-0.5 bg-gray-200 ml-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Timer skeleton */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* 2. MAIN SEAT & TICKET SELECTION SKELETON */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Seat Map Overview / Canvas Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 min-h-[440px] flex flex-col items-center justify-between relative overflow-hidden">
            {/* Top Stage Bar */}
            <div className="h-7 w-56 md:w-72 bg-gray-200 rounded-full mb-8"></div>

            {/* Simulated Stage / Section Grid */}
            <div className="w-full max-w-xl grid grid-cols-3 gap-4 my-auto">
              <div className="h-28 bg-gray-100/90 rounded-2xl border border-gray-200/60 flex flex-col items-center justify-center p-3 space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-28 bg-gray-200/80 rounded-2xl border border-gray-200/80 flex flex-col items-center justify-center p-3 space-y-2">
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
                <div className="h-3 w-14 bg-gray-300 rounded"></div>
              </div>
              <div className="h-28 bg-gray-100/90 rounded-2xl border border-gray-200/60 flex flex-col items-center justify-center p-3 space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
              </div>

              {/* Lower Section row */}
              <div className="col-span-3 h-20 bg-gray-100/60 rounded-2xl border border-gray-200/50 flex items-center justify-center gap-4 mt-2">
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Legend bar at bottom */}
            <div className="w-full flex items-center justify-center gap-6 pt-6 border-t border-slate-100 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-gray-300"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Policy & Rules Card */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] p-4 md:p-5 space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-3">
              <div className="h-4 w-52 bg-gray-200 rounded"></div>
              <div className="h-3 w-64 bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-12 rounded-xl bg-gray-100 flex items-center px-4 gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 rounded-xl bg-gray-100 flex items-center px-4 gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* Ticket Type Selector Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>

            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Summary Card Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-5 w-36 bg-gray-200 rounded"></div>

              {/* Placeholder cart item */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Total price + Action Button */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-6 w-28 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSkeleton;
