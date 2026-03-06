import { useState } from "react";

// const StatusShowBadge = ({ status, onStatusChange }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const STATUS_MAP = {
//     DRAFT: {
//       label: "Bản nháp",
//       color: "bg-slate-100 text-slate-600 border-slate-200",
//       dot: "bg-slate-400",
//     },
//     ACTIVE: {
//       label: "Hoạt động",
//       color: "bg-emerald-100 text-emerald-700 border-emerald-200",
//       dot: "bg-emerald-500",
//     },
//     POSTPONED: {
//       label: "Tạm hoãn",
//       color: "bg-orange-100 text-orange-700 border-orange-200",
//       dot: "bg-orange-500",
//     },
//     CANCELLED: {
//       label: "Đã hủy",
//       color: "bg-red-100 text-red-700 border-red-200",
//       dot: "bg-red-500",
//     },
//   };

//   const config = STATUS_MAP[status] || STATUS_MAP.DRAFT;

//   return (
//     <div className="relative inline-block">
//       {/* Badge Button */}
//       <button
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold shadow-sm transition-all hover:ring-2 hover:ring-offset-1 hover:ring-slate-200 ${config.color}`}
//       >
//         <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
//         {config.label}
//         <span className="material-symbols-outlined text-[14px] leading-none ml-0.5">
//           {isOpen ? "expand_less" : "expand_more"}
//         </span>
//       </button>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <>
//           {/* Overlay để click ra ngoài là đóng */}
//           <div
//             className="fixed inset-0 z-10"
//             onClick={() => setIsOpen(false)}
//           ></div>

//           <div className="absolute left-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-75">
//             {Object.keys(STATUS_MAP).map((key) => (
//               <button
//                 key={key}
//                 type="button"
//                 onClick={() => {
//                   onStatusChange(key);
//                   setIsOpen(false);
//                 }}
//                 className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-slate-50
//                   ${status === key ? "bg-slate-50 text-emerald-600" : "text-slate-700"}
//                 `}
//               >
//                 <span
//                   className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[key].dot}`}
//                 ></span>
//                 {STATUS_MAP[key].label}
//                 {status === key && (
//                   <span className="material-symbols-outlined text-[14px] ml-auto">
//                     check
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };
// export default StatusShowBadge;


const StatusBadge = ({ status, options, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = options[status] || Object.values(options)[0];

  if (!currentConfig) return null; 

  return (
    <div className="relative inline-block">
      {/* Nút bấm hiển thị Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold shadow-sm transition-all hover:ring-2 hover:ring-offset-1 hover:ring-slate-200 ${currentConfig.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentConfig.dot}`}></span>
        {currentConfig.label}
        <span className="material-symbols-outlined text-[14px] leading-none ml-0.5">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {/* Menu lựa chọn */}
      {isOpen && (
        <>
          {/* Lớp phủ để click ra ngoài là đóng */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>

          <div className="absolute left-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-75">
            {Object.keys(options).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onStatusChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-slate-50
                  ${status === key ? "bg-slate-50 text-emerald-600" : "text-slate-700"}
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${options[key].dot}`}></span>
                {options[key].label}
                {status === key && (
                  <span className="material-symbols-outlined text-[14px] ml-auto">check</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusBadge;