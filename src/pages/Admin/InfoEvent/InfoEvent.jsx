import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InfoEventInfor from "./InfoEventInfor";
import InfoShow from "./InfoShow";
import { useHeader } from "../../../hooks/useHeader";
import { useCan } from "../../../hooks/useCan";
import axiosClient from "../../../api/axiosClient";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import RejectEventModal from "../../../components/modals/RejectEventModal";

function InfoEvent() {
  const { id } = useParams();
  const { setTitle } = useHeader();
  const can = useCan();
  const [eventData, setEventData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
  });

  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  const closeRejectModal = () =>
    setRejectModal((prev) => ({ ...prev, isOpen: false }));

  const steps = [
    { id: 1, title: "Thông tin sự kiện" },
    { id: 2, title: "Thời gian & Loại vé" },
    { id: 3, title: "Cài đặt" },
    { id: 4, title: "Thông tin thanh toán" },
  ];
  const [currentStep, setCurrentStep] = useState(1);

  const fetchEventData = async () => {
    try {
      const result = await axiosClient.get(`/events/${id}`);
      setEventData(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sự kiện:", error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
  }, [id]);

  const handleStep = async (targetStep) => {
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleApprove = () => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận duyệt sự kiện này",
      message: "Bạn có chắc sẽ xác nhận duyệt sự kiện này?",
      onConfirm: async () => {
        try {
          await axiosClient.patch(`/events/${id}/approve`);
          closeConfirmModal();
          fetchEventData();
        } catch (error) {
          console.log("Duyệt thất bại: ", error.message);
        }
      },
    });
  };

  const handleReject = () => {
    setRejectModal({
      isOpen: true,
      onConfirm: async (reason) => {
        try {
          await axiosClient.patch(`/events/${id}/reject`, {
            rejectionReason: reason,
          });
          closeRejectModal();
          fetchEventData();
        } catch (error) {
          console.log("Từ chối thất bại: ", error.message);
        }
      },
    });
  };


  useEffect(() => {
    setTitle("Thông tin sự kiện");
  }, []);

  return (
    <>
      <RejectEventModal
        isOpen={rejectModal.isOpen}
        onClose={closeRejectModal}
        onConfirm={rejectModal?.onConfirm}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        title={confirmModal.title}
        onClose={closeConfirmModal}
        onConfirm={confirmModal?.onConfirm}
      />
      <header className="rounded-xl shadow bg-white border-b border-slate-200 z-10 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4 md:px-8">
          <div className="flex items-center h-full overflow-x-auto flex-1 mr-4 no-scrollbar scroll-smooth">
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => {
                  handleStep(step.id);
                }}
                className={`cursor-pointer flex items-center gap-2 md:gap-3 h-full px-4 md:px-6 shrink-0 transition-all ${step.id === currentStep
                  ? "border-b-[3px] border-emerald-500"
                  : "opacity-60"
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${step.id === currentStep
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {step.id}
                </div>
                <span
                  className={`text-sm whitespace-nowrap ${step.id === currentStep
                    ? "font-medium text-slate-900"
                    : "text-slate-500"
                    }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 md:gap-4 items-center self-center shrink-0">
            {eventData?.status === "PENDING" && (
              <>
                {can("EVENT:APPROVE") && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="px-4 md:px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
                  >
                    Duyệt
                  </button>
                )}
                {can("EVENT:REJECT") && (
                  <button
                    type="button"
                    onClick={handleReject}
                    className="px-4 md:px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
                  >
                    Từ chối
                  </button>
                )}
              </>
            )}

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
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar pt-8 pb-10">
        {currentStep === 1 && <InfoEventInfor />}
        {currentStep === 2 && <InfoShow />}
      </div>
    </>
  );
}
export default InfoEvent;

