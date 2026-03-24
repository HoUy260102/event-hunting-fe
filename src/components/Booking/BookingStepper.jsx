import React, { useEffect, useState } from "react";

const steps = [
  { id: 1, label: "Chọn vé" },
  { id: 2, label: "Nhập thông tin" },
  { id: 3, label: "Thanh toán" },
];

const BookingStepper = ({ currentStep, onBack, expiryTime, onExpire}) => {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    if (!expiryTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const distance = expiryTime - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(Math.floor(distance / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpire]);

  const formatTime = () => {
    const mins = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const secs = (timeLeft % 60).toString().padStart(2, "0");
    return (mins + secs).split(""); // Trả về mảng ['0', '9', '2', '6']
  };

  const timeArray = formatTime();
  return (
    <div className="min-h-[5rem] w-full bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Cụm bên trái: Nút Back + Các bước */}
      <div className="flex items-center gap-3 md:gap-6 w-full justify-between md:justify-start">
        <div className="flex items-center gap-3 md:gap-6 overflow-hidden">
          {/* Nút Back */}
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 shrink-0 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          {/* Danh sách các bước - Thêm overflow-x-auto để mobile có thể vuốt ngang nếu quá dài */}
          <div className="pl-2 flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-2 shrink-0 ${
                    currentStep >= step.id ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {/* Ô tròn số - Quan trọng: dùng shrink-0 để không bị méo */}
                  <div
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep === step.id
                        ? "bg-blue-600 text-white scale-110 shadow-md shadow-blue-200"
                        : currentStep > step.id
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <span className="material-symbols-outlined text-sm">
                        check
                      </span>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      currentStep >= step.id
                        ? "font-bold text-gray-800"
                        : "font-medium text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <span className="material-symbols-outlined text-gray-300 text-lg shrink-0">
                    chevron_right
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 bg-gray-50 md:bg-transparent px-4 py-2 md:p-0 rounded-xl w-full md:w-auto justify-center border border-gray-100 md:border-none">
        <span className="text-[11px] md:text-sm text-gray-500 font-bold uppercase tracking-tight">
          Hết hạn sau
        </span>
        <div className="flex items-center gap-1">
          {timeArray.map((char, i) =>
            char === ":" ? (
              <span
                key={i}
                className="font-bold text-gray-400 animate-pulse px-1"
              >
                :
              </span>
            ) : (
              <div
                key={i}
                className="w-7 h-9 md:w-8 md:h-10 border border-gray-200 rounded-lg flex items-center justify-center font-bold text-lg bg-white shadow-sm text-gray-700"
              >
                {char}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingStepper;
