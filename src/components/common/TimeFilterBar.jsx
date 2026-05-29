import React, { useState, useEffect } from "react";

function TimeFilterBar({ onFilterChange }) {
  const [filterMode, setFilterMode] = useState("year"); // "date-range" | "month" | "year"

  // Khởi tạo với tháng và năm hiện tại
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State lưu khoảng ngày tự chọn (Mặc định 'Đến ngày' là ngày hôm nay)
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Tự động áp dụng bộ lọc mỗi khi các giá trị thay đổi (onChange)
  useEffect(() => {
    let startDate = "";
    let endDate = "";

    if (filterMode === "month") {
      startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      endDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${lastDay}`;
    } else if (filterMode === "year") {
      startDate = `${selectedYear}-01-01`;
      endDate = `${selectedYear}-12-31`;
    } else if (filterMode === "date-range") {
      // Chỉ áp dụng lọc khi 'Từ ngày' đã được chọn
      if (!customStartDate) {
        return;
      }

      // Nếu 'Đến ngày' bị trống, tự động mặc định lấy ngày hôm nay
      let finalEndDate = customEndDate;
      if (!finalEndDate) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        finalEndDate = `${yyyy}-${mm}-${dd}`;
      }

      if (new Date(customStartDate) > new Date(finalEndDate)) {
        return; // Đợi cho đến khi khoảng ngày hợp lệ
      }
      startDate = customStartDate;
      endDate = finalEndDate;
    }

    if (onFilterChange) {
      onFilterChange({ startDate, endDate, mode: filterMode });
    }
  }, [filterMode, selectedMonth, selectedYear, customStartDate, customEndDate]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
        {/* Bộ chọn Chế độ lọc */}
        <div className="relative flex-1 w-full">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#a1aebf] tracking-wider block mb-1">
            Chế độ lọc
          </label>
          <div className="relative">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 pr-10 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer appearance-none"
            >
              <option value="month">Lọc theo Tháng</option>
              <option value="year">Lọc theo Năm</option>
              <option value="date-range">Khoảng ngày tùy chọn</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="material-symbols-outlined text-[18px] text-[#6b7280] dark:text-[#a1aebf]">
                keyboard_arrow_down
              </span>
            </div>
          </div>
        </div>

        {/* Hiển thị trường nhập liệu tùy vào Chế độ lọc */}
        {filterMode === "month" && (
          <>
            {/* Dropdown chọn Tháng */}
            <div className="relative flex-1 w-full">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#a1aebf] tracking-wider block mb-1">
                Tháng
              </label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 pr-10 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer appearance-none"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7280] dark:text-[#a1aebf]">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>
            </div>

            {/* Dropdown chọn Năm */}
            <div className="relative flex-1 w-full">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#a1aebf] tracking-wider block mb-1">
                Năm
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 pr-10 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer appearance-none"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7280] dark:text-[#a1aebf]">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {filterMode === "year" && (
          <div className="relative flex-1 w-full">
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#a1aebf] tracking-wider block mb-1">
              Chọn Năm
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 pr-10 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer appearance-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="material-symbols-outlined text-[18px] text-[#6b7280] dark:text-[#a1aebf]">
                  keyboard_arrow_down
                </span>
              </div>
            </div>
          </div>
        )}

        {filterMode === "date-range" && (
          <>
            <div className="relative flex-1 w-full">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#a1aebf] tracking-wider block mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer"
              />
            </div>
            <div className="pt-5 text-slate-400 dark:text-slate-500 font-medium text-center shrink-0">đến</div>
            <div className="relative flex-1 w-full">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#a1aebf] tracking-wider block mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TimeFilterBar;
