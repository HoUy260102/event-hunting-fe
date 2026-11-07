import { motion } from "framer-motion";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axiosClient from "../../../api/axiosClient";
import { formatDateTime, formatDateVN } from "../../../utils/format";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useAuth } from "../../../hooks/useAuth";
import { toast, ToastContainer } from "react-toastify";
import WaitingRoomSkeleton from "../../../components/common/WaitingRoomSkeleton";
import { Turnstile } from "@marsidev/react-turnstile";

function WaitingRoom() {
  const { eventId, showId } = useParams();
  const [show, setShow] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [initialPosition, setInitialPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const turnstileRef = useRef(null);
  const { requireAuth } = useAuth();

  const handleJoinQueue = async (token = null) => {
    try {
      setIsJoining(true);
      const payload = token ? { captchaToken: token } : {};
      const queueRes = await axiosClient.post(`/shows/${showId}/queue/join`, payload);

      if (queueRes?.data?.status === "BUYING") {
        requireAuth(`/event/${eventId}/show/${showId}/booking`);
        return true;
      }
      setQueueInfo(queueRes?.data);
      setInitialPosition(queueRes?.data.position);
      setLastUpdate(new Date());
      setNeedsCaptcha(false);
      return true;
    } catch (error) {
      const errorMsg = error?.message || error?.response?.data?.message || "";
      const statusCode = error?.status || error?.response?.status;

      // Nếu là lần probe ban đầu (chưa gửi token) mà backend báo cần Captcha -> bật widget Turnstile
      if (!token && (errorMsg.toLowerCase().includes("captcha") || statusCode === 400)) {
        setNeedsCaptcha(true);
        return false;
      }

      // Nếu đã gửi token giải rồi mà vẫn lỗi -> thông báo cho người dùng
      if (token) {
        toast.error(errorMsg || "Xác thực Captcha không thành công. Vui lòng thử lại!");
      }

      if (statusCode === 404) {
        window.location.href = "/notfound";
      }
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const showRes = await axiosClient.get(`/shows/${showId}/detail`);
        if (!isMounted) return;
        setShow(showRes?.data);
        setLastUpdate(new Date());

        // Thử join queue (nếu người dùng đã có trong queue/buying hoặc captcha tắt, API sẽ thành công ngay)
        await handleJoinQueue(null);
      } catch (error) {
        if (!isMounted) return;
        if (error.status === 404) {
          window.location.href = "/notfound";
          return;
        }
        console.log("Lỗi khi lấy dữ liệu show:", error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [showId]);

  const handleTurnstileSuccess = async (token) => {
    if (!token) return;
    const ok = await handleJoinQueue(token);
    if (!ok && turnstileRef.current) {
      turnstileRef.current.reset();
    }
  };

  useEffect(() => {
    if (!queueInfo) return;

    const interval = setInterval(async () => {
      try {
        const res = await axiosClient.get(`/shows/${showId}/queue/status`);
        if (res?.data?.status === "BUYING") {
          toastSuccess(
            "Đang chuyển vào trang mua vé vui lòng chờ trong giây lát!",
          );
          setTimeout(() => {
            requireAuth(`/event/${eventId}/show/${showId}/booking`);
          }, 3000);
          return;
        }
        setQueueInfo(res?.data);
        setLastUpdate(new Date());
      } catch (e) {
        console.log(e);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [showId, queueInfo]);

  const progress = initialPosition
    ? Math.max(
      0,
      Math.min(100, (1 - queueInfo?.peopleAhead / initialPosition) * 100),
    )
    : 0;

  const toastSuccess = (message) => {
    toast.success(message, {
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
    if (!showId) return;

    const wsUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"}/ws`;
    const socket = new SockJS(wsUrl);
    const stompClient = Stomp.over(socket);

    stompClient.debug = null;
    const token = localStorage.getItem("accessToken");
    stompClient.connect(
      {
        Authorization: "Bearer " + token,
      },
      () => {
        stompClient.subscribe(`/user/p/show/${showId}/queue`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            if (data?.status === "BUYING") {
              toastSuccess(
                "Đang chuyển vào trang mua vé vui lòng chờ trong giây lát!",
              );
              setTimeout(() => {
                requireAuth(`/event/${eventId}/show/${showId}/booking`);
              }, 3000);
              return;
            }
          }
        });
      },
      (error) => {
        console.error("WebSocket error:", error);
      },
    );

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [showId]);

  if (isLoading || !show || (!queueInfo && !needsCaptcha)) {
    return <WaitingRoomSkeleton />;
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex-grow flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* LEFT */}
            <div className="w-full md:w-[50%] p-6 md:p-10 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center md:items-start bg-gray-50">
              <div className="w-full mb-6">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight leading-tight">
                  {show?.eventName}
                </h3>
                <div className="flex items-center gap-2 mt-3 text-gray-600 text-sm font-medium">
                  <LocationOnIcon className="w-4 h-4" />
                  <span>{show?.eventLocation}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-gray-600 text-sm font-medium">
                  <CalendarTodayIcon className="w-4 h-4" />
                  <span>
                    {formatDateVN(show?.startTime)} -{" "}
                    {formatDateVN(show?.endTime)}
                  </span>
                </div>
              </div>

              <div className="w-full aspect-square max-w-[200px] md:max-w-none rounded-xl overflow-hidden shadow-lg mb-6">
                <img
                  alt="Concert Event Poster"
                  className="w-full h-full object-cover"
                  src={show?.eventPoster?.url}
                />
              </div>

              <div className="mt-auto pt-4 hidden md:block">
                <span className="text-xl font-black text-gray-500">
                  EventHunting
                </span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col items-center justify-center">
              {needsCaptcha && !queueInfo ? (
                /* CAPTCHA CHALLENGE VIEW */
                <div className="w-full text-center space-y-6 py-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                      <ShieldOutlinedIcon className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      Xác Minh Bảo Vệ
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      Vui lòng hoàn tất xác thực chống bot để nhận số thứ tự vào hàng đợi.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center my-6 min-h-[70px]">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                      onSuccess={handleTurnstileSuccess}
                      onError={() =>
                        toast.error(
                          "Không thể xác thực Cloudflare Turnstile. Vui lòng thử lại!",
                        )
                      }
                      onExpire={() => turnstileRef.current?.reset()}
                      options={{
                        theme: "light",
                        size: "normal",
                      }}
                    />
                  </div>

                  {isJoining && (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm animate-pulse">
                      <span>Đang xác thực và xếp hàng...</span>
                    </div>
                  )}

                  <div className="text-[11px] text-gray-400 border-t border-gray-100 pt-4">
                    Bảo vệ bởi Cloudflare Turnstile • An toàn & Tự động
                  </div>
                </div>
              ) : (
                /* QUEUE ACTIVE VIEW */
                <div className="w-full text-center space-y-8">
                  {/* QUEUE */}
                  <div>
                    <p className="text-gray-600 text-base font-semibold mb-2">
                      Số người đứng trước bạn:
                    </p>

                    <span className="text-green-500 font-black text-7xl md:text-8xl block">
                      {queueInfo?.peopleAhead ?? "-"}
                    </span>
                  </div>

                  {/* PROGRESS */}
                  <div className="w-full max-w-md mx-auto">
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="bg-green-500 h-full rounded-full shadow"
                      />
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-[11px] text-gray-500 mt-2 uppercase tracking-widest font-bold"
                    >
                      Đang trong hàng đợi...
                    </motion.p>
                  </div>

                  {/* NOTICE */}
                  <div className="text-sm text-gray-600 text-left border-t border-gray-200 pt-8 mt-4">
                    <p className="mb-4">
                      <span className="font-bold text-gray-900">Chú ý:</span> Khi
                      đến lượt, bạn sẽ được chuyển sang trang mua vé. Bạn có{" "}
                      <span className="font-bold text-gray-900">10 phút</span> để
                      hoàn tất thanh toán.
                    </p>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-gray-500 italic mt-6">
                      <p>Cập Nhật Lần Cuối: {formatDateTime(lastUpdate)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 md:hidden">
                <span className="text-lg font-black text-gray-500">
                  EventHunting
                </span>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}

export default WaitingRoom;
