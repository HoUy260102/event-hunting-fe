import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import StatusBadge from "../../../components/common/StatusBadge";
import InfoTicketTypeModal from "./InfoTicketTypeModal";

function InfoShow() {
  const { id } = useParams();
  const [shows, setShows] = useState([]);
  const [activeShowId, setActiveShowId] = useState(null);
  const [activeTicketType, setActiveTicketType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const seatMapTypes = [
    {
      id: "NONE",
      label: "Không sơ đồ",
      desc: "Vé tự do, vé đứng...",
      icon: "layers_clear",
    },
    {
      id: "SECTION_ONLY",
      label: "Theo khu vực",
      desc: "Chia khu, không số ghế",
      icon: "grid_view",
    },
    {
      id: "SECTION_WITH_SEATS",
      label: "Sơ đồ ghế",
      desc: "Chọn chính xác vị trí ghế",
      icon: "event_seat",
    },
  ];

  const SHOW_STATUS_MAP = {
    DRAFT: {
      label: "Bản nháp",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
    ACTIVE: {
      label: "Hoạt động",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    POSTPONED: {
      label: "Tạm hoãn",
      color: "bg-orange-100 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const showsRes = await axiosClient.get(`/events/${id}/shows`);
        setShows(showsRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu suất diễn:", error.message);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const openViewTicket = (showId, ticketType) => {
    setActiveShowId(showId);
    setActiveTicketType(ticketType);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="pl-2 text-xl font-bold text-slate-800 flex items-center">
          Thông tin các suất diễn
        </h2>
      </div>

      {shows.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-slate-400 border border-slate-200 border-dashed">
          Chưa có suất diễn nào được cấu hình
        </div>
      ) : (
        shows.map((show, index) => (
          <div
            key={show.id}
            className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-slate-800 font-bold text-lg">
                  Suất diễn {shows.length > 1 ? index + 1 : ""}
                </span>
                <StatusBadge
                  status={show.status}
                  options={SHOW_STATUS_MAP}
                  readOnly={true}
                />
              </div>
            </div>

            {/* Loại sơ đồ */}
            <div className="mb-8 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
              <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">map</span>
                Loại sơ đồ chỗ ngồi
              </label>
              <div className="flex flex-col md:flex-row gap-6">
                {seatMapTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`flex-1 flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${show.seatMapType === type.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-100 bg-slate-50/50 opacity-50"
                      }`}
                  >
                    <div className="mt-1 w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                      {show.seatMapType === type.id && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-sm text-slate-900">
                        <span className="material-symbols-outlined text-sm">
                          {type.icon}
                        </span>
                        {type.label}
                      </div>
                      <p className="text-xs text-slate-500">{type.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sơ đồ Preview nếu có */}
            {show.seatMapSvg && (
              <div className="mb-8 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                <label className="block text-sm font-bold text-slate-800 mb-4">Sơ đồ chỗ ngồi</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden p-8 shadow-sm">
                  <div
                    className="w-full max-w-3xl flex items-center justify-center preview-svg-container"
                    dangerouslySetInnerHTML={{ __html: show.seatMapSvg }}
                  />
                </div>
              </div>
            )}

            {/* Thời gian & Giới hạn đơn hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bắt đầu</label>
                <div className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {formatDate(show.startTime)}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kết thúc</label>
                <div className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {formatDate(show.endTime)}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tối thiểu / đơn</label>
                <div className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {show.minOrder} vé
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tối đa / đơn</label>
                <div className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {show.maxOrder} vé
                </div>
              </div>
            </div>

            {/* Danh sách loại vé */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-t border-slate-100 pt-6 mb-4">
                <span className="material-symbols-outlined text-emerald-600">confirmation_number</span>
                <span className="text-slate-800 font-bold">Các loại vé</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {show.ticketTypes?.map((ticketType) => (
                  <div
                    key={ticketType.id}
                    onClick={() => openViewTicket(show.id, ticketType)}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">confirmation_number</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{ticketType.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-slate-500">Tổng SL: {ticketType.totalQuantity}</p>
                          <p className="text-xs text-emerald-600 font-medium">Đã bán: {ticketType.soldQuantity || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Xem chi tiết</span>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-emerald-500">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <InfoTicketTypeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={activeTicketType}
          show={shows.find(s => s.id === activeShowId)}
        />
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .preview-svg-container svg {
          width: 100% !important;
          height: auto !important;
          max-height: 500px;
          display: block;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

export default InfoShow;
