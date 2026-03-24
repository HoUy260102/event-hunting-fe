import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { DateRange } from "react-date-range";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
const DateRangeFilter = ({ isOpen, onClose, handleFilterChange }) => {
  const defaultRange = [
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ];
  const [range, setRange] = useState(defaultRange);
  const handleReset = () => {
    setRange(defaultRange);
  };
  const handleApplyAction = () => {
    const { startDate, endDate } = range[0];
    const formattedData = {
      startDateTime: format(startDate, "yyyy-MM-dd'T'00:00:00"),
      endDateTime: format(endDate, "yyyy-MM-dd'T'23:59:59"),
    };
    handleFilterChange("startTime", formattedData?.startDateTime);
    handleFilterChange("endTime", formattedData?.endDateTime);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="absolute inset-0 bg-[#142210]/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-[800px] max-h-[95vh] bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">
              tune
            </span>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight">
              Bộ lọc thời gian
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
              close
            </span>
          </button>
        </header>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 w-full overflow-y-auto justify-center custom-scrollbar p-2 space-y-8 max-h-[70vh]">
          <div className="flex justify-center w-full">
            <DateRange
              onChange={(item) => setRange([item.selection])}
              editableDateInputs={true}
              moveRangeOnFirstSelection={false}
              ranges={range}
              months={2}
              direction="horizontal"
              locale={vi}
              rangeColors={["#22c55e"]}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
          <button
            onClick={handleReset}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              restart_alt
            </span>
            Thiết lập lại
          </button>
          <button
            onClick={() => {
              handleApplyAction();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-green-500 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-[#46ec13]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm">done</span>
            Áp dụng
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DateRangeFilter;
