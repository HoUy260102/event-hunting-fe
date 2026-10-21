import React from "react";

const WaitingRoomSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex-grow flex flex-col items-center justify-center w-full">
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-pulse">
          {/* LEFT (Event / Show Information) */}
          <div className="w-full md:w-[50%] p-6 md:p-10 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center md:items-start bg-gray-50/70">
            <div className="w-full mb-6">
              {/* Event Name */}
              <div className="h-6 md:h-7 w-3/4 bg-gray-200 rounded-md mb-4"></div>

              {/* Location */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0"></div>
                <div className="h-4 w-3/5 bg-gray-200 rounded"></div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Poster Image Skeleton */}
            <div className="w-full aspect-square max-w-[200px] md:max-w-none rounded-xl overflow-hidden shadow-lg mb-6 bg-gray-200 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 18"
              >
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.175 4.35 1.478-1.478a1 1 0 0 1 1.414 0l3.5 3.5a1 1 0 0 1 .041 1.556Z" />
              </svg>
            </div>

            {/* Brand Logo / Watermark (Desktop) */}
            <div className="mt-auto pt-4 hidden md:block">
              <div className="h-6 w-28 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          {/* RIGHT (Queue Details) */}
          <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col items-center justify-center bg-white">
            <div className="w-full text-center space-y-8">
              {/* Queue Position */}
              <div>
                <div className="h-4 w-48 bg-gray-200 rounded mx-auto mb-3"></div>
                <div className="h-20 md:h-24 w-32 md:w-40 bg-gray-200 rounded-2xl mx-auto"></div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-gray-300 h-full w-1/4 rounded-full"></div>
                </div>
                <div className="h-3 w-28 bg-gray-200 rounded mx-auto mt-3"></div>
              </div>

              {/* Notice & Instructions */}
              <div className="border-t border-gray-200 pt-8 mt-4 text-left space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-4/5 bg-gray-200 rounded"></div>

                <div className="pt-6">
                  <div className="h-3 w-40 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Brand Logo / Watermark (Mobile) */}
            <div className="mt-8 md:hidden">
              <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaitingRoomSkeleton;
