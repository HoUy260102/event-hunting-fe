import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import UpdateEventInfor from "./UpdateEventInfor";
import UpdateShow from "./UpdateShow";
import { useHeader } from "../../../hooks/useHeader";

function UpdateEvent() {
  const { setTitle } = useHeader();
  const location = useLocation();
  const steps = [
    { id: 1, title: "Thông tin sự kiện" },
    { id: 2, title: "Thời gian & Loại vé" },
    { id: 3, title: "Cài đặt" },
    { id: 4, title: "Thông tin thanh toán" },
  ];
  const [currentStep, setCurrentStep] = useState(location.state?.step || 1);
  
  const handleStep = async (targetStep) => {
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  
  useEffect(() => {
    setTitle("Quản lý sự kiện");
  }, []);
  
  return (
    <>
      <header className="rounded-xl shadow bg-white border-b border-slate-200 z-10 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4 md:px-8">
          <div className="flex items-center h-full overflow-x-auto flex-1 mr-4 no-scrollbar scroll-smooth">
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => {
                  handleStep(step.id);
                }}
                className={`cursor-pointer flex items-center gap-2 md:gap-3 h-full px-4 md:px-6 shrink-0 transition-all ${
                  step.id === currentStep
                    ? "border-b-[3px] border-emerald-500"
                    : "opacity-60"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    step.id === currentStep
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {step.id}
                </div>
                <span
                  className={`text-sm whitespace-nowrap ${
                    step.id === currentStep
                      ? "font-medium text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Khối nút bấm */}
          <div className="flex gap-2 md:gap-4 items-center self-center shrink-0">
            <button
              type="button"
              disabled={currentStep >= steps.length}
              onClick={() => {
                handleNext();
              }}
              className="px-4 md:px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Tiếp tục
            </button>
          </div>
        </div>

        <style>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
      </header>
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar pt-8">
        {currentStep === 1 && <UpdateEventInfor></UpdateEventInfor>}
        {currentStep === 2 && <UpdateShow></UpdateShow>}
      </div>
    </>
  );
}
export default UpdateEvent;
