import { useNavigate, useParams } from "react-router-dom";
import ShowItem from "../../components/EventOverview/ShowItem";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import EventStatusBadge from "../../components/common/EventStatusBadge";
import { formatEventDateToString } from "../../utils/format";
import { useHeader } from "../../hooks/useHeader";

function StatBlock({ label, value, icon, color = "text-slate-800", borderColor = "border-l-indigo-500", iconBg = "bg-indigo-50 text-indigo-600" }) {
  return (
    <div className={`min-w-0 p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 border-l-4 ${borderColor} shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4`}>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] md:text-xs text-slate-400 uppercase font-extrabold tracking-wider truncate">
          {label}
        </p>
        <p className={`text-base md:text-xl font-extrabold ${color} truncate mt-1`}>
          {value}
        </p>
      </div>
      {icon && (
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-inner shrink-0`}>
          <span className="material-symbols-outlined text-lg font-bold">{icon}</span>
        </div>
      )}
    </div>
  );
}

function EventOverview() {
  const { setTitle } = useHeader();
  const { id } = useParams();
  const [event, setEvent] = useState();

  useEffect(() => {
    setTitle("Chi tiết Sự kiện & Suất diễn");
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRes = await axiosClient.get(`/events/${id}/summary`);
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
    <div className="pt-4 max-w-[1400px] mx-auto space-y-6">
      {/* Khung Thông Tin Sự Kiện Premium Glassmorphism với Gradient Tinh Tế */}
      <div className="bg-gradient-to-br from-white via-slate-50/30 to-white backdrop-blur-xl border border-white/60 shadow-[0_10px_35px_rgba(0,0,0,0.02)] rounded-3xl p-5 md:p-6 flex flex-col lg:flex-row gap-6 hover:shadow-[0_20px_50px_rgba(99,102,241,0.05)] transition-all duration-300">
        {/* Poster Sự Kiện với viền sáng sang trọng */}
        <div
          className="w-full lg:w-64 h-52 md:h-60 lg:h-52 rounded-2xl bg-cover bg-center shrink-0 shadow-md border-2 border-white hover:scale-[1.02] transition-all duration-500 cursor-pointer"
          style={{ backgroundImage: `url(${event?.posterUrl})` }}
        />

        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-block transform scale-95 origin-left">
                  <EventStatusBadge status={event?.status} />
                </div>

                <h2 className="text-xl md:text-3xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 bg-clip-text text-transparent mt-2 tracking-tight leading-tight break-words">
                  {event?.name}
                </h2>

                <div className="flex flex-col gap-2 mt-3.5">
                  <p className="text-slate-500 flex items-center gap-2.5 text-sm font-medium">
                    <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                      location_on
                    </span>
                    <span className="break-words text-slate-600">
                      {event?.address
                        ? `${event?.location} - ${event?.address}`
                        : event?.location}
                    </span>
                  </p>
                  <p className="text-slate-500 flex items-center gap-2.5 text-sm font-medium">
                    <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                      calendar_today
                    </span>
                    <span className="truncate text-slate-600">
                      {formatEventDateToString(event?.startTime)} -{" "}
                      {formatEventDateToString(event?.endTime)}{" "}
                    </span>
                  </p>
                </div>
              </div>

              {/* Nút Chỉnh Sửa Outline sang trọng */}
              <button
                type="button"
                onClick={() => navigate(`/admin/update-event/${id}`)}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl text-sm font-extrabold hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-sm font-bold">edit</span>
                Chỉnh sửa sự kiện
              </button>
            </div>

            {/* --- GRID THÔNG SỐ KPI HOÀN HẢO --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 border-t border-slate-100 pt-6">
              <StatBlock
                label="Doanh thu gộp"
                value={`${event?.totalAmount?.toLocaleString()} ₫`}
                icon="payments"
                color="text-indigo-600"
                borderColor="border-l-indigo-500"
                iconBg="bg-indigo-50 text-indigo-600"
              />
              <StatBlock
                label="Chiết khấu"
                value={`${event?.discountAmount?.toLocaleString()} ₫`}
                icon="sell"
                color="text-amber-600"
                borderColor="border-l-amber-500"
                iconBg="bg-amber-50 text-amber-600"
              />
              <StatBlock
                label="Doanh thu thuần"
                value={`${event?.totalFinalAmount?.toLocaleString()} ₫`}
                icon="monetization_on"
                color="text-emerald-600"
                borderColor="border-l-emerald-500"
                iconBg="bg-emerald-50 text-emerald-600"
              />
              <StatBlock
                label="Tổng vé"
                value={event?.totalQuantity?.toLocaleString()}
                icon="confirmation_number"
                color="text-blue-600"
                borderColor="border-l-blue-500"
                iconBg="bg-blue-50 text-blue-600"
              />
              <StatBlock
                label="Đã bán"
                value={event?.soldQuantity?.toLocaleString()}
                icon="group"
                color="text-teal-600"
                borderColor="border-l-teal-500"
                iconBg="bg-teal-50 text-teal-600"
              />
              <StatBlock
                label="Lấp đầy"
                value={`${(((event?.soldQuantity || 0) * 100) / (event?.totalQuantity || 1)).toFixed(1)}%`}
                icon="percent"
                color="text-purple-600"
                borderColor="border-l-purple-500"
                iconBg="bg-purple-50 text-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH SUẤT DIỄN */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm">
          <h3 className="text-base md:text-lg font-extrabold text-slate-800 flex items-center gap-2">
            Danh sách Suất diễn & Loại vé
            <span className="bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {event?.shows?.length || 0} Suất diễn
            </span>
          </h3>
          <button className="flex whitespace-nowrap items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] rounded-xl text-sm font-extrabold active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm font-extrabold">
              add
            </span>{" "}
            Thêm suất diễn mới
          </button>
        </div>

        <div className="space-y-1">
          {event?.shows?.map((show) => (
            <ShowItem key={show.id} show={show} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventOverview;
