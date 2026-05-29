import { Html5Qrcode } from "html5-qrcode";
import React, { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast, ToastContainer } from "react-toastify";
import { formatDateVN } from "../../utils/format";

const QrScanModal = ({ isOpen, onClose, showId, handleUpdateTicket }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const qrCodeRef = useRef(null);
  const [checkInResult, setCheckInResult] = useState();
  const [tickets, setTickets] = useState([]);
  const isProcessing = useRef(false);
  const toastError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  useEffect(() => {
    const handleCheckIn = async () => {
      if (isProcessing.current || !scanResult) return;
      try {
        isProcessing.current = true;
        const res = await axiosClient.post(`/tickets/${scanResult}/check-in`, {
          checkInMethod: "QR_CODE",
          showId: showId,
        });
        setCheckInResult(res?.data);
        setTickets((prev) => [...prev, res?.data]);
        handleUpdateTicket(res?.data);
      } catch (error) {
        console.log(error.message);
        toastError(error.message);
      } finally {
        setTimeout(() => {
          isProcessing.current = false;
          setScanResult("");
        }, 2000);
      }
    };
    handleCheckIn();
  }, [scanResult]);

  const startScanning = async () => {
    const html5QrCode = new Html5Qrcode("reader");
    qrCodeRef.current = html5QrCode;

    try {
      setIsCameraActive(true);
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          console.log(decodedText);
          setScanResult(decodedText);
        },
        (errorMessage) => { },
      );
    } catch (err) {
      console.error("Lỗi camera:", err);
      setIsCameraActive(false);
    }
  };

  // Hàm tắt Camera
  const stopScanning = async () => {
    if (qrCodeRef.current && qrCodeRef.current.isScanning) {
      await qrCodeRef.current.stop();
      qrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) stopScanning();
  }, [isOpen]);

  const handleClose = async () => {
    if (qrCodeRef.current) {
      await stopScanning();
    }
    onClose();
  };

  if (!isOpen) return null;
  return (
    <>
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      >
        {/* Modal Container: Premium High-End Light Glassmorphic Design */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-7xl h-[92vh] bg-gradient-to-br from-[#fcfdfd] via-[#f8faf9] to-[#f4f6f5] text-[#1a1c1c] font-sans overflow-hidden flex flex-col rounded-3xl border border-emerald-100 shadow-[0_20px_60px_rgba(74,99,99,0.15)]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-emerald-100 bg-white/40 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <span className="material-symbols-outlined text-emerald-600 font-semibold">qr_code_scanner</span>
              </div>
              <div>
                <h2 className="text-lg font-black tracking-wide text-[#1a1c1c]">Hệ Thống Check-in Sự Kiện</h2>
                <p className="text-xs text-[#5c6060]">Quét mã QR Code của vé để xác thực check-in nhanh</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="size-10 flex items-center justify-center rounded-xl bg-white/80 border border-emerald-100/50 hover:bg-emerald-50 text-[#1a1c1c] active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
          .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          #reader {
              border: none !important;
          }
          #reader video {
              object-fit: cover !important;
              border-radius: 1.5rem !important;
          }
          .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(74, 99, 99, 0.02);
              border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(16, 185, 129, 0.2);
              border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(16, 185, 129, 0.4);
          }
          .scanner-line {
              height: 3px;
              background: linear-gradient(90deg, transparent, #10b981, transparent);
              box-shadow: 0 0 15px #10b981, 0 0 5px #10b981;
              position: absolute;
              width: 100%;
              top: 50%;
              left: 0;
              animation: scan 2.2s ease-in-out infinite;
              z-index: 10;
          }
          @keyframes scan {
              0% { top: 5%; }
              50% { top: 95%; }
              100% { top: 5%; }
          }
          .corner-target {
              position: absolute;
              width: 24px;
              height: 24px;
              border-color: #10b981;
              border-style: solid;
              z-index: 20;
              filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.4));
          }
          .slide-in {
              animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          @keyframes slideIn {
              from {
                  opacity: 0;
                  transform: translateY(16px);
              }
              to {
                  opacity: 1;
                  transform: translateY(0);
              }
          }
          .animate-pulse-glow {
              animation: pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulseGlow {
              0%, 100% {
                  opacity: 1;
                  box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
              }
              50% {
                  opacity: .75;
                  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
              }
          }
        `,
            }}
          />

          {/* Main Grid Layout */}
          <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_360px] min-h-0 overflow-hidden">
            {/* COLUMN 1: Scan Workspace - Changed to justify-start with top padding to prevent clipping */}
            <section className="relative h-full p-6 lg:p-10 flex flex-col items-center justify-start pt-10 pb-8 overflow-y-auto border-b md:border-b-0 border-emerald-100/50 bg-gradient-to-br from-white/30 to-[#f4f6f5]/20">

              {/* Camera Container Frame */}
              <div className="relative shrink-0 p-4 bg-white border border-emerald-100 rounded-[2.5rem] shadow-[0_15px_35px_rgba(74,99,99,0.06)] flex items-center justify-center group backdrop-blur-md">

                <div className="w-[350px] h-[350px] bg-slate-900 rounded-3xl flex items-center justify-center relative border border-emerald-100/30 overflow-hidden shadow-inner">
                  {/* Neon Target Corners inside the camera viewfinder */}
                  <div className="corner-target top-4 left-4 border-t-4 border-l-4 rounded-tl-xl"></div>
                  <div className="corner-target top-4 right-4 border-t-4 border-r-4 rounded-tr-xl"></div>
                  <div className="corner-target bottom-4 left-4 border-b-4 border-l-4 rounded-bl-xl"></div>
                  <div className="corner-target bottom-4 right-4 border-b-4 border-r-4 rounded-br-xl"></div>

                  <div
                    id="reader"
                    className="w-full h-full object-cover"
                  ></div>

                  {isCameraActive && <div className="scanner-line"></div>}

                  {/* Camera Offline Overlay */}
                  {!isCameraActive && (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#f8faf9] to-[#eff2f1] flex flex-col items-center justify-center z-10 transition-all">
                      <button
                        onClick={startScanning}
                        className="flex flex-col items-center gap-4 group"
                      >
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.08)]">
                          <span className="material-symbols-outlined text-emerald-600 text-4xl animate-pulse">
                            videocam
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700 tracking-widest uppercase text-[10px] bg-emerald-500/15 px-5 py-2 rounded-full border border-emerald-500/20 transition-all group-hover:bg-emerald-500/25">
                          BẬT CAMERA QUÉT
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Active Camera Live Badge */}
                  {isCameraActive && (
                    <div className="absolute bottom-6 px-4 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-red-500/30 flex items-center gap-2 shadow-lg z-20">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] font-extrabold tracking-widest uppercase text-red-400">
                        LIVE CAMERA
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scanning Result Area */}
              <div className="w-full max-w-lg mt-8 shrink-0">
                {checkInResult ? (
                  <div className="w-full bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(74,99,99,0.08)] border border-emerald-200 slide-in relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 mb-1">
                          KẾT QUẢ QUÉT
                        </span>
                        <h2 className="font-sans text-xl font-extrabold text-[#1a1c1c] truncate pr-2">
                          {checkInResult.customerName}
                        </h2>
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shrink-0 shadow-sm animate-pulse-glow">
                        <span
                          className="material-symbols-outlined text-sm font-semibold"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        <span className="text-xs font-black tracking-widest uppercase">HỢP LỆ</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">
                          Khu vực vé
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {checkInResult?.section || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">
                          Số ghế
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {checkInResult?.seatLabel || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <p className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">
                          Mã đặt chỗ
                        </p>
                        <p className="text-sm font-bold text-emerald-600 font-mono">
                          {checkInResult?.reservationCode || checkInResult?.reservationId || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <p className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">
                          Thời gian quét
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {formatDateVN(checkInResult?.checkInAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-white rounded-2xl p-6 border border-emerald-100 shrink-0 flex items-center gap-4 backdrop-blur-md shadow-[0_10px_25px_rgba(74,99,99,0.04)]">
                    <div className="size-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-inner">
                      <span className="material-symbols-outlined text-2xl">sensors</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#5c6060]">
                        TRẠNG THÁI QUÉT
                      </span>
                      <h2 className="text-base font-extrabold text-slate-600 mt-0.5 truncate flex items-center gap-2">
                        {isCameraActive ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                            Đang chờ quét QR...
                          </>
                        ) : (
                          "Vui lòng bật Camera để bắt đầu"
                        )}
                      </h2>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* COLUMN 2: Side Activity Panel */}
            <aside className="bg-[#f5f7f6]/80 flex flex-col border-l border-emerald-100/70 overflow-hidden">
              <div className="p-6 border-b border-emerald-100/70 flex items-center justify-between shrink-0 bg-white/40">
                <h3 className="font-sans font-black text-sm tracking-widest uppercase text-[#1a1c1c] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Lịch Sử Check-in
                </h3>
                <span className="bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-extrabold border border-emerald-500/20 shrink-0">
                  {tickets?.length || 0} Lượt
                </span>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {tickets?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                      person_off
                    </span>
                    <p className="text-xs font-bold text-slate-500">Chưa có lượt quét nào</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mọi lượt check-in thành công sẽ hiển thị ở đây</p>
                  </div>
                ) : (
                  tickets?.map((ticket, index) => {
                    return (
                      <div
                        key={ticket?.id || index}
                        className="bg-white p-3.5 rounded-xl border border-emerald-100/50 flex items-center gap-3.5 hover:bg-emerald-50/20 hover:border-emerald-300 hover:shadow-md transition-all duration-300 cursor-pointer group slide-in shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all shadow-inner">
                          <span className="material-symbols-outlined text-slate-500 group-hover:text-emerald-600 text-xl transition-all">
                            person
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-slate-800">
                            {ticket?.customerName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            {ticket?.displayName || "Vé Hợp Lệ"}
                          </p>
                          <p className="text-[9px] text-emerald-600 font-mono mt-0.5 font-bold">
                            {formatDateVN(ticket?.checkInAt)}
                          </p>
                        </div>
                        <span
                          className="material-symbols-outlined text-emerald-600 text-base shrink-0 bg-emerald-50 p-1 rounded-full border border-emerald-200"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Aside */}
              <div className="p-4 bg-white/40 border-t border-emerald-100/70 shrink-0">
                <button className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all duration-300 shadow-sm border border-emerald-700">
                  XEM TOÀN BỘ HOẠT ĐỘNG
                </button>
              </div>
            </aside>
          </main>

          {/* Ambient decorative glowing soft light */}
          <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-emerald-500/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default QrScanModal;
