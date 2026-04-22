import { Html5Qrcode } from "html5-qrcode";
import React, { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast, ToastContainer } from "react-toastify";
import { formatDateVN } from "../../utils/format";

const QrScanModal = ({ isOpen, onClose, showId, handleUpdateTicket}) => {
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
        (errorMessage) => {},
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
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        {/* Modal Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-7xl h-[95vh] bg-[#fcfdfd] text-[#1a1c1c] font-sans overflow-hidden flex flex-col rounded-3xl shadow-2xl overflow-y-auto"
        >
          {/* Nút đóng Modal (Thêm vào để điều khiển) */}
          <div className="flex justify-end items-center px-8 py-5 border-b border-[#eaf3e7]">
            <button
              onClick={onClose}
              className="size-10 flex items-center justify-center rounded-xl bg-background-light hover:scale-120 transition-all"
            >
              <span className="material-symbols-outlined font-bold">close</span>
            </button>
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
          .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          .scanner-line {
              height: 2px;
              background: linear-gradient(90deg, transparent, #4a6363, transparent);
              box-shadow: 0 0 15px rgba(74, 99, 99, 0.5);
              position: absolute;
              width: 100%;
              top: 50%;
              left: 0;
              animation: scan 3s linear infinite;
          }
          @keyframes scan {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
          }
          .qr-gradient {
              background: radial-gradient(circle at top left, #f8f9f9 0%, #f0f1f1 100%);
          }
        `,
            }}
          />

          {/* <main className="qr-gradient flex-1 flex flex-col md:flex-row overflow-y-auto overflow-hidden min-h-0">
          <section className="flex-1 p-6 p-10 flex flex-col items-center justify-start lg:justify-center">
            <div className="mt-45 relative shrink-0 w-full max-w-md h-[350px] bg-[#ffffff] border border-[#c4c7c7]/50 rounded-3xl overflow-hidden shadow-xl flex items-center justify-center group">
              <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#4a6363] rounded-tl-lg"></div>
              <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#4a6363] rounded-tr-lg"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#4a6363] rounded-bl-lg"></div>
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#4a6363] rounded-br-lg"></div>
              <div className="w-[250px] h-[250px] bg-[#f8f9f9] rounded-xl flex items-center justify-center relative border border-[#c4c7c7]/30 overflow-hidden">
                <img
                  alt="QR Code"
                  className="w-full h-full object-cover opacity-80"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe6Ms9S9qiPorQ1LGaiW_CSWy_qoycX8nWKpRWj7a_4LdHIhK-qdpRnj5JJewvzflPpMRbV_yQ7SJ6KZMq_2w2RkRNqJEFNlW0RDw3TQx9OkDejPFiTiufG0Os0S1aBijPrxYyTjVZRe5d8YZRy1O_4ExvxYro9Z_8ZJldk_RLx-Goir8XIiuC_6LVR8RO8SzxZQ_tv4r_qU9gUgBceLtLSzWYIbH8iGiPZ2BiBXFVh171bqDC7eJ5lHPTond3TTcP2f28nRdJi7oe"
                />
                <div className="scanner-line"></div>
              </div>
              <div className="absolute bottom-8 px-6 py-2 bg-[#fcfdfd]/90 backdrop-blur-md rounded-full border border-[#c4c7c7]/50 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse"></div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#1a1c1c]">
                  Live Camera Active
                </span>
              </div>
            </div>
            <div className="mt-8 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-[#c4c7c7]/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#444748] mb-1">
                    Scanning Result
                  </span>
                  <h2 className="font-sans text-2xl font-extrabold text-[#1a1c1c]">
                    Alex Nguyen
                  </h2>
                </div>
                <div className="bg-[#e8f5e9] text-[#2e7d32] px-3 py-1.5 rounded-lg border border-[#2e7d32]/20 flex items-center gap-1.5">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="text-xs font-bold tracking-wide">VALID</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-[#444748] font-bold tracking-widest">
                    Ticket Type
                  </p>
                  <p className="text-sm font-semibold text-[#1a1c1c]">
                    VIP - SEATED
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-[#444748] font-bold tracking-widest">
                    Seat Number
                  </p>
                  <p className="text-sm font-semibold text-[#1a1c1c]">
                    Row A - Seat 12
                  </p>
                </div>
                <div className="col-span-2 space-y-1 pt-2 border-t border-[#c4c7c7]/10">
                  <p className="text-[10px] uppercase text-[#444748] font-bold tracking-widest">
                    Event Name
                  </p>
                  <p className="text-sm font-semibold text-[#1a1c1c]">
                    [HCMC] Monochrome Nights
                  </p>
                </div>
              </div>
            </div>
          </section>
          <aside className="flex w-80 bg-[#f6f7f7] flex-col border-l border-[#c4c7c7]/20">
            <div className="p-6 border-b border-[#c4c7c7]/20 flex items-center justify-between">
              <h3 className="font-sans font-bold text-[#1a1c1c]">
                Recent Check-ins
              </h3>
              <span className="bg-[#ebeeed] px-2 py-1 rounded text-[10px] font-bold text-[#444748]">
                248 / 500
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="bg-[#fcfdfd] p-3 rounded-xl border border-[#c4c7c7]/20 flex items-center gap-3 hover:bg-[#f8f9f9] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#ebeeed] flex items-center justify-center group-hover:bg-[#4a6363]/10 transition-colors">
                  <span className="material-symbols-outlined text-[#444748] group-hover:text-[#4a6363]">
                    person
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-[#1a1c1c]">
                    Sarah Jenkins
                  </p>
                  <p className="text-[11px] text-[#444748]">
                    2 mins ago • General Entry
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-[#2e7d32] text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
              <div className="bg-[#fcfdfd] p-3 rounded-xl border border-[#c4c7c7]/20 flex items-center gap-3 hover:bg-[#f8f9f9] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#ebeeed] flex items-center justify-center group-hover:bg-[#4a6363]/10 transition-colors">
                  <span className="material-symbols-outlined text-[#444748] group-hover:text-[#4a6363]">
                    person
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-[#1a1c1c]">
                    Marcus Thorne
                  </p>
                  <p className="text-[11px] text-[#444748]">
                    5 mins ago • VIP Access
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-[#2e7d32] text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
              <div className="bg-[#fcfdfd] p-3 rounded-xl border border-[#c4c7c7]/20 flex items-center gap-3 hover:bg-[#f8f9f9] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#ebeeed] flex items-center justify-center group-hover:bg-[#4a6363]/10 transition-colors">
                  <span className="material-symbols-outlined text-[#444748] group-hover:text-[#4a6363]">
                    person
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-[#1a1c1c]">
                    Linh Pham
                  </p>
                  <p className="text-[11px] text-[#444748]">
                    12 mins ago • Backstage Pass
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-[#2e7d32] text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
              <div className="bg-[#fcfdfd] p-3 rounded-xl border border-[#c4c7c7]/20 flex items-center gap-3 hover:bg-[#f8f9f9] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#ebeeed] flex items-center justify-center group-hover:bg-[#ba1a1a]/10 transition-colors">
                  <span className="material-symbols-outlined text-[#444748] group-hover:text-[#ba1a1a]">
                    person
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-[#1a1c1c]">
                    David Miller
                  </p>
                  <p className="text-[11px] text-[#444748]">
                    15 mins ago • General Entry
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-[#ba1a1a] text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  error
                </span>
              </div>
              <div className="bg-[#fcfdfd] p-3 rounded-xl border border-[#c4c7c7]/20 flex items-center gap-3 hover:bg-[#f8f9f9] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#ebeeed] flex items-center justify-center group-hover:bg-[#4a6363]/10 transition-colors">
                  <span className="material-symbols-outlined text-[#444748] group-hover:text-[#4a6363]">
                    person
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-[#1a1c1c]">
                    Sofia Rossi
                  </p>
                  <p className="text-[11px] text-[#444748]">
                    18 mins ago • VIP Access
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-[#2e7d32] text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
            </div>
            <div className="p-4 bg-[#fcfdfd] border-t border-[#c4c7c7]/10">
              <button className="w-full py-3 bg-[#ebeeed] rounded-xl text-xs font-bold uppercase tracking-widest text-[#1a1c1c] hover:bg-[#4a6363] hover:text-white transition-all duration-300">
                View All Activity
              </button>
            </div>
          </aside>
        </main> */}

          {/* THAY ĐỔI: main bây giờ là Grid container */}
          <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] min-h-0 overflow-hidden">
            {/* CỘT 1: Scanner Area */}
            <section className="qr-gradient h-full p-6 lg:p-10 flex flex-col items-center justify-center overflow-y-auto border-b md:border-b-0">
              <div className="relative shrink-0 mt-5 bg-[#ffffff] border border-[#c4c7c7]/50 rounded-3xl overflow-hidden shadow-xl flex items-center justify-center group">
                <div className="w-auto h-auto bg-[#f8f9f9] rounded-xl flex items-center justify-center relative border border-[#c4c7c7]/30 overflow-hidden">
                  <div
                    id="reader"
                    className="w-[350px] h-[350px] object-cover"
                  ></div>
                  <div className="scanner-line"></div>
                </div>

                {/* Live Feed Overlay */}
                <div className="absolute bottom-8 px-6 py-2 bg-[#fcfdfd]/90 backdrop-blur-md rounded-full border border-[#c4c7c7]/50 flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold tracking-widest uppercase text-[#1a1c1c]">
                    Live Camera Active
                  </span>
                </div>
              </div>
              {!isCameraActive && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
                  <button
                    onClick={startScanning}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#4a6363]/10 flex items-center justify-center group-hover:bg-[#4a6363]/20 transition-all">
                      <span className="material-symbols-outlined text-[#4a6363] text-4xl">
                        videocam
                      </span>
                    </div>
                    <span className="font-bold text-[#4a6363] tracking-widest uppercase text-sm">
                      Nhấn để Live Cam
                    </span>
                  </button>
                </div>
              )}

              {/* Result Card */}
              {checkInResult ? (
                <div className="mt-8 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-[#c4c7c7]/20 shrink-0 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#444748] mb-1">
                        Kết quả quét
                      </span>
                      <h2 className="font-sans text-2xl font-extrabold text-[#1a1c1c]">
                        {checkInResult.customerName}
                      </h2>
                    </div>
                    <div className="bg-[#e8f5e9] text-[#2e7d32] px-3 py-1.5 rounded-lg border border-[#2e7d32]/20 flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span className="text-xs font-bold tracking-wide">
                        VALID
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-[#444748] font-bold tracking-widest">
                        Khu vực
                      </p>
                      <p className="text-sm font-semibold text-[#1a1c1c]">
                        {checkInResult?.section}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-[#444748] font-bold tracking-widest">
                        Số ghế / Queue
                      </p>
                      <p className="text-sm font-semibold text-[#1a1c1c]">
                        {checkInResult?.seatLabel}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 col-span-2 space-y-1 pt-2 border-t border-[#c4c7c7]/10">
                    <p className="text-[10px] uppercase text-[#444748] font-bold tracking-widest">
                      Mã đơn hàng
                    </p>
                    <p className="text-sm font-semibold text-[#1a1c1c]">
                      {checkInResult?.reservationId}
                    </p>
                  </div>
                  <div className="mt-2 col-span-2 space-y-1 pt-2 border-t border-[#c4c7c7]/10">
                    <p className="text-[10px] uppercase text-[#444748] font-bold tracking-widest">
                      Ngày check in
                    </p>
                    <p className="text-sm font-semibold text-[#1a1c1c]">
                      {formatDateVN(checkInResult?.checkInAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-gray-100 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Kết quả quét
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#1a1c1c] mt-1 truncate">
                    Đang chờ...
                  </h2>
                </div>
              )}
            </section>

            {/* CỘT 2: Side Panel */}
            <aside className="bg-[#f6f7f7] flex flex-col border-l border-[#c4c7c7]/20 overflow-hidden">
              <div className="p-6 border-b border-[#c4c7c7]/20 flex items-center justify-between shrink-0">
                <h3 className="font-sans font-bold text-[#1a1c1c]">
                  Recent Check-ins
                </h3>
              </div>

              {/* Danh sách cuộn riêng biệt */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {tickets?.map((ticket) => {
                  return (
                    <div
                      key={ticket?.id}
                      className="bg-[#fcfdfd] p-3 rounded-xl border border-[#c4c7c7]/20 flex items-center gap-3 hover:bg-[#f8f9f9] transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#ebeeed] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#444748]">
                          person
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-[#1a1c1c]">
                          {ticket?.customerName}
                        </p>
                        <p className="text-[11px] text-[#444748]">
                          {formatDateVN(ticket?.checkInAt)} •{" "}
                          {ticket?.displayName}
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined text-[#2e7d32] text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer Aside */}
              <div className="p-4 bg-[#fcfdfd] border-t border-[#c4c7c7]/10 shrink-0">
                <button className="w-full py-3 bg-[#ebeeed] rounded-xl text-xs font-bold uppercase tracking-widest text-[#1a1c1c] hover:bg-[#4a6363] hover:text-white transition-all duration-300">
                  View All Activity
                </button>
              </div>
            </aside>
          </main>

          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-[#4a6363]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#ebeeed]/20 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default QrScanModal;
