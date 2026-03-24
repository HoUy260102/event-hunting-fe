import React from "react";

const TicketDetailSkeleton = () => {
  return (
    <div className="bg-[#0e0e0e] text-[#e7e5e5] font-['Inter'] min-h-screen">
      {/* Giữ nguyên CSS đặc thù để layout khớp 100% */}
      <style
        dangerouslySetInnerHTML={{
          __html: `        
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        
        .ticket-shape {
          clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 95% 73%, 95% 77%, 100% 80%, 100% 100%, 0% 100%, 0% 80%, 5% 77%, 5% 73%, 0% 70%);
        }

        @keyframes pulse-custom {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-skeleton {
          animation: pulse-custom 1.5s ease-in-out infinite;
        }
      `,
        }}
      />

      <div className="px-10">
        <div className="mb-5">
          <div className="border-b border-[#474848]/20 py-5">
            <div className="h-8 w-40 bg-[#1f2020] rounded animate-skeleton"></div>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-6 pt-10 pb-24 font-inter">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Ticket Visual Skeleton */}
            <div className="md:col-span-7 flex flex-col gap-6">
              <div className="bg-[#1f2020] rounded-xl overflow-hidden shadow-2xl relative">
                {/* Banner Placeholder */}
                <div className="h-48 w-full bg-[#2b2c2c] animate-skeleton"></div>

                {/* Ticket Body Placeholder */}
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-[#2b2c2c] rounded animate-skeleton"></div>
                    <div className="h-4 w-1/2 bg-[#2b2c2c] rounded mt-10 animate-skeleton"></div>
                  </div>

                  <div className="pt-6 border-t border-[#474848]/20 space-y-6">
                    <div className="h-4 w-40 bg-[#2b2c2c] rounded animate-skeleton"></div>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div className="col-span-2 space-y-2">
                        <div className="h-3 w-24 bg-[#2b2c2c] rounded animate-skeleton"></div>
                        <div className="h-5 w-48 bg-[#2b2c2c] rounded animate-skeleton"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-[#2b2c2c] rounded animate-skeleton"></div>
                        <div className="h-5 w-32 bg-[#2b2c2c] rounded animate-skeleton"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-[#2b2c2c] rounded animate-skeleton"></div>
                        <div className="h-5 w-32 bg-[#2b2c2c] rounded animate-skeleton"></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-[#474848]/20 pt-6">
                    <div className="col-span-2 space-y-2">
                      <div className="h-3 w-16 bg-[#2b2c2c] rounded animate-skeleton"></div>
                      <div className="h-5 w-64 bg-[#2b2c2c] rounded animate-skeleton"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-[#2b2c2c] rounded animate-skeleton"></div>
                      <div className="h-5 w-20 bg-[#2b2c2c] rounded animate-skeleton"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-[#2b2c2c] rounded animate-skeleton"></div>
                      <div className="h-5 w-16 bg-[#2b2c2c] rounded animate-skeleton"></div>
                    </div>
                  </div>
                </div>

                {/* Perforated Line & Two Circles (Giống y chang Details) */}
                <div className="relative h-px w-full border-t-2 border-dashed border-[#474848]/30 my-2">
                  {/* Hình tròn bên trái */}
                  <div className="absolute -left-4 -top-3 w-6 h-6 rounded-full bg-[#0e0e0e]"></div>
                  {/* Hình tròn bên phải */}
                  <div className="absolute -right-4 -top-3 w-6 h-6 rounded-full bg-[#0e0e0e]"></div>
                </div>

                {/* Bottom Branding Placeholder */}
                <div className="px-8 py-6 bg-[#252626]/30 h-16 animate-skeleton"></div>
              </div>
            </div>

            {/* Right Column: QR & Actions Skeleton */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-[#191a1a] rounded-xl p-8 border border-[#474848]/10 flex flex-col items-center">
                {/* QR Box */}
                <div className="w-40 h-40 bg-[#2b2c2c] rounded-lg mb-6 animate-skeleton"></div>
                <div className="h-6 w-32 bg-[#2b2c2c] rounded mb-2 animate-skeleton"></div>
                <div className="h-3 w-full bg-[#2b2c2c] rounded animate-skeleton"></div>
              </div>

              {/* Instructions Box */}
              <div className="bg-[#131313] p-6 rounded-xl border-l-4 border-[#2b2c2c] space-y-4">
                <div className="h-4 w-20 bg-[#2b2c2c] rounded animate-skeleton"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-[#2b2c2c] rounded animate-skeleton"></div>
                  <div className="h-3 w-full bg-[#2b2c2c] rounded animate-skeleton"></div>
                  <div className="h-3 w-2/3 bg-[#2b2c2c] rounded animate-skeleton"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TicketDetailSkeleton;
