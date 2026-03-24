const EventSkeleton = () => {
  // Class dùng chung cho các lỗ đục (cutout) để đồng bộ với bản chính
  const cutoutClass =
    "absolute left-[355px] w-[30px] h-[30px] bg-[#121212] rounded-full z-10 hidden md:block";

  return (
    <div className="w-full min-h-screen bg-[#121212] text-white antialiased animate-pulse">
      <main className="flex-1 px-6 lg:px-12 py-8 mx-auto max-w-9xl w-full">
        <div className="space-y-10">
          <section className="relative bg-[#1E1E21] flex flex-col md:flex-row rounded-[1.5rem] overflow-hidden min-h-[471px]">
            <div className={`${cutoutClass} -top-[15px]`}></div>
            <div className={`${cutoutClass} -bottom-[15px]`}></div>
            <div className="absolute left-[370px] top-5 bottom-5 border-l-2 border-dashed border-white/5 hidden md:block"></div>
            <div className="w-full md:w-[375px] p-8 flex flex-col justify-between relative z-20">
              <div>
                <div className="h-8 bg-gray-700 rounded-md w-full mb-6"></div>

                <div className="space-y-4">
                  {/* Ngày giờ */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                  {/* Địa điểm */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                <div className="flex items-baseline gap-2 mb-4">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-7 bg-gray-700 rounded w-32"></div>
                </div>
                <div className="h-12 bg-gray-700 rounded-lg w-full"></div>
              </div>
            </div>

            <div className="flex-1 bg-gray-800/50"></div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <section className="lg:col-span-3 space-y-8">
              <div className="bg-[#1E1E21] rounded-2xl overflow-hidden">
                <div className="bg-[#2D2D32] px-6 py-4 h-14">
                  <div className="h-5 bg-gray-700 rounded w-24"></div>
                </div>
                <div className="p-10 space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                </div>
              </div>

              <div className="bg-[#1E1E21] rounded-2xl overflow-hidden">
                <div className="px-6 py-6 border-b border-white/5">
                  <div className="h-6 bg-gray-700 rounded w-48"></div>
                </div>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-6 border-b border-white/5 flex justify-between items-center"
                  >
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-700 rounded w-40"></div>
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-10 bg-gray-700 rounded-lg w-28"></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventSkeleton;
