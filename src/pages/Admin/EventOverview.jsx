import { useNavigate, useParams } from "react-router-dom";
import ShowItem from "../../components/EventOverview/ShowItem";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import EventStatusBadge from "../../components/common/EventStatusBadge";
import { formatEventDateToString } from "../../utils/format";
function StatBlock({ label, value, color = "text-gray-900" }) {
  return (
    <div className="min-w-0 flex flex-col">
      <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider truncate">
        {label}
      </p>
      <p
        className={`text-base md:text-lg font-extrabold ${color} truncate mt-0.5`}
      >
        {value}
      </p>
    </div>
  );
}
function EventOverview() {
  const eventDashboard = {
    id: 1,
    eventName: "Đại nhạc hội Mùa Hè 2024",
    bannerUrl:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop",
    location: "Sân vận động Mỹ Đình, Hà Nội",
    statusText: "Đang diễn ra",
    totalTickets: 15000,
    soldTickets: 12450,
    revenue: "4.2 tỷ",
    occupancy: 83,
    shows: [
      {
        id: 101,
        day: "15",
        month: "THG 7",
        name: "Suất diễn Khai mạc - Đêm 1",
        timeFull: "19:30, Thứ Bảy 15/07/2024",
        soldCount: 4500,
        totalCount: 5000,
        ticketTypes: [
          {
            id: 201,
            name: "VIP Diamond",
            description: "Khu vực sát sân khấu, có đồ uống nhẹ",
            totalQuantity: 500,
            soldQuantity: 482,
            // Tầng 4: Các Tier con
            tiers: [
              {
                id: 301,
                name: "Tier 1 - Early Bird",
                price: 2200000,
                totalQuantity: 200,
                soldQuantity: 200,
              },
              {
                id: 302,
                name: "Tier 2 - Standard",
                price: 2500000,
                totalQuantity: 300,
                soldQuantity: 282,
              },
            ],
          },
          {
            id: 202,
            name: "Hạng Phổ thông",
            description: "Khu vực khán đài B",
            basePrice: 850000, // Giá cố định nếu không có Tier
            totalQuantity: 3000,
            soldQuantity: 2810,
            tiers: [], // Không có tầng 4
          },
        ],
      },
      {
        id: 102,
        day: "16",
        month: "THG 7",
        name: "Đêm Nhạc Trẻ - Đêm 2",
        timeFull: "19:30, Chủ Nhật 16/07/2024",
        soldCount: 3120,
        totalCount: 5000,
        ticketTypes: [
          {
            id: 203,
            name: "Vé đứng (GA)",
            description: "Khu vực sân cỏ",
            basePrice: 650000,
            totalQuantity: 2000,
            soldQuantity: 1500,
            tiers: [],
          },
        ],
      },
    ],
  };
  const { id } = useParams();
  const [event, setEvent] = useState();
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRes = await axiosClient.get(`/events/${id}/overview`);
        setEvent(eventRes.data);
        console.log("Data xịn nè:", eventRes.data);
      } catch (error) {
        console.error(error.message);
      }
    };
    if (id) {
      fetchEvent();
    }
  }, [id]);
  const navigate = useNavigate();
  return (
    <div class="p-8 space-y-6">
      <h2 class="text-lg font-bold">Chi tiết Sự kiện &amp; Suất diễn</h2>
      <div className="bg-white border border-gray-200 shadow-md rounded-xl p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        <div
          className="w-full lg:w-64 h-48 md:h-56 lg:h-48 rounded-lg bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${event?.poster?.url})` }}
        />

        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <EventStatusBadge status={event?.status}></EventStatusBadge>

                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 break-words">
                  {event?.name}
                </h2>

                <p className="text-gray-500 flex items-center gap-1 mt-1 text-sm">
                  <span className="material-symbols-outlined text-sm shrink-0">
                    location_on
                  </span>
                  <span className="truncate">{event?.location}</span>
                </p>
                <p className="text-gray-500 flex items-center gap-1 mt-1 text-sm">
                  <span className="material-symbols-outlined text-sm shrink-0">
                    calendar_today
                  </span>
                  <span className="truncate">{formatEventDateToString(event?.startDate)} - {formatEventDateToString(event?.endDate)} </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/admin/update-event/${id}`)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-200 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 shrink-0 transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>

            {/* --- GRID THÔNG SỐ: Giải quyết chồng lấp --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6 border-t border-gray-50 pt-6">
              <StatBlock
                label="Tổng vé"
                value={event?.totalQuantity.toLocaleString()}
              />
              <StatBlock
                label="Đã bán"
                value={event?.soldQuantity.toLocaleString()}
                color="text-green-600"
              />
              <StatBlock
                label="Doanh thu"
                value={`${event?.totalRevenue} ₫`}
              />
              <StatBlock
                label="Lấp đầy"
                value={`${eventDashboard.occupancy}%`}
                color="text-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Danh sách Suất diễn & Loại vé
            <span className="bg-green-100 whitespace-nowrap text-green-600 text-xs px-2 py-0.5 rounded-full">
              {event?.shows?.length || 0} Suất
            </span>
          </h3>
          <button className="flex whitespace-nowrap items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600">
            <span className="whitespace-nowrap material-symbols-outlined text-sm">add</span> Thêm
            suất diễn mới
          </button>
        </div>

        {event?.shows?.map((show) => (
          <ShowItem key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
}
export default EventOverview;
