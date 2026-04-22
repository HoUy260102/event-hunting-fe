const VoucherSkeleton = () => (
  <div className="w-full space-y-4">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="relative bg-white rounded-xl border-2 border-[#CAC4D0]/20 flex overflow-hidden animate-pulse"
      >
        {/* Left Icon Section Skeleton */}
        <div className="w-24 bg-[#F3EDF7]/50 border-r border-[#CAC4D0]/20 flex items-center justify-center p-4">
          <div className="w-10 h-10 bg-[#CAC4D0]/40 rounded-full"></div>
        </div>

        {/* Right Content Section Skeleton */}
        <div className="flex-1 p-4 flex justify-between items-center">
          <div className="space-y-2 flex-1">
            {/* Title */}
            <div className="h-4 bg-[#CAC4D0]/40 rounded w-3/4"></div>

            {/* Discount info lines */}
            <div className="space-y-1.5">
              <div className="h-3 bg-[#CAC4D0]/20 rounded w-1/2"></div>
              <div className="h-3 bg-[#CAC4D0]/20 rounded w-2/3"></div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-2.5 bg-[#CAC4D0]/10 rounded w-20"></div>
              <div className="h-2.5 bg-[#CAC4D0]/10 rounded w-20"></div>
            </div>
          </div>

          {/* Checkbox Skeleton */}
          <div className="w-6 h-6 rounded-full bg-[#CAC4D0]/30 ml-4"></div>
        </div>
      </div>
    ))}
  </div>
);
export default VoucherSkeleton;