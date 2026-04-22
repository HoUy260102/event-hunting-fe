import { motion } from "framer-motion";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { formatDateTime, formatDateVN } from "../../../utils/format";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useAuth } from "../../../hooks/useAuth";
import { useEventSession } from "../../../hooks/useEventSession";
import { toast, ToastContainer } from "react-toastify";

function WaitingRoom() {
  const { eventId } = useParams();
  const { showId } = useParams();
  const [show, setShow] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [initialPosition, setInitialPosition] = useState(null);
  const { requireAuth } = useAuth();
  const { updateSession } = useEventSession();

  useEffect(() => {
    try {
      const fetchData = async () => {
        const showRes = await axiosClient.get(`/shows/${showId}/detail`);
        setShow(showRes?.data);
        setLastUpdate(new Date());
        const queueRes = await axiosClient.post(`/shows/${showId}/queue/join`);
        if (queueRes?.data?.status === "BUYING") {
          requireAuth(`/event/${eventId}/show/${showId}/booking`);
          return;
        }
        setQueueInfo(queueRes?.data);
        setInitialPosition(queueRes?.data.position);
      };
      fetchData();
    } catch (error) {
      if (error.status === 404) {
        window.location.href = "/notfound";
        return;
      }
      console.log("Lỗi khi lấy dữ liệu show:", error.message);
    }
  }, [showId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axiosClient.get(`/shows/${showId}/queue/status`);
        if (res?.data?.status === "BUYING") {
          updateSession(showId, res?.data?.token, res?.data?.expiresIn);
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
  }, [showId]);

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
    const socket = new SockJS("http://localhost:8080/api/v1/ws");
    const stompClient = Stomp.over(socket);

    stompClient.debug = null;
    const token = localStorage.getItem("accessToken");
    stompClient.connect(
      {
        Authorization: "Bearer " + token,
      },
      () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe(`/user/p/show/${showId}/queue`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            if (data?.status === "BUYING") {
              updateSession(showId, data?.token, data?.expiresIn);
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
              <div className="w-full text-center space-y-8">
                {/* QUEUE */}
                <div>
                  <p className="text-gray-600 text-base font-semibold mb-2">
                    Số người đứng trước bạn:
                  </p>

                  <span className="text-green-500 font-black text-7xl md:text-8xl block">
                    {queueInfo?.peopleAhead ?? "-"}
                  </span>

                  {/* <div className="flex items-center justify-center gap-2 mt-6 text-gray-600">
                  <AccessTimeIcon className="w-5 h-5" />
                  <p className="text-base font-medium">
                    Thời gian chờ dự kiến:{" "}
                    <span className="text-gray-900 font-bold">~15 phút</span>
                  </p>
                </div> */}
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
                    Đang tải...
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
