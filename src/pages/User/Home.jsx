import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import TrendingEvent from "../../components/common/TrendingEvent";
import EventCard from "../../components/EventSearch/User/EventCard";
import { useAuth } from "../../hooks/useAuth";
import EventCardSkeleton from "../../components/EventSearch/User/EventCardSkeleton";
import { formatDateVN } from "../../utils/format";

const formatISO = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
};

const getWeekRange = () => {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    startTime: formatISO(monday),
    endTime: formatISO(sunday),
  };
};

const getMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return {
    startTime: formatISO(startOfMonth),
    endTime: formatISO(endOfMonth),
  };
};

const getNext3MonthsRange = () => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(now.getMonth() + 3);
  threeMonthsLater.setHours(23, 59, 59, 999);

  return {
    startTime: formatISO(todayStart),
    endTime: formatISO(threeMonthsLater),
  };
};

const getLast3MonthsRange = () => {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  threeMonthsAgo.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  return {
    startTime: formatISO(threeMonthsAgo),
    endTime: formatISO(todayEnd),
  };
};

function Home() {
  useEffect(() => {
    document.title = "Trang chủ - Săn vé sự kiện | Event Hunting";
    return () => {
      document.title = "Event Hunting";
    };
  }, []);

  const { user, openLogin } = useAuth();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [cat1, setCat1] = useState([]);
  const [cat2, setCat2] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);

  const [timeTab, setTimeTab] = useState("week"); // "week" | "month" | "next3months" | "3months"
  const [timeEvents, setTimeEvents] = useState([]);
  const [timeLoading, setTimeLoading] = useState(false);

  const [bannerEvents, setBannerEvents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const getTrending = async () => {
      try {
        setLoading(true);
        setRecLoading(true);
        const [resTrending, resCat1, resCat2, resRec] = await Promise.all([
          axiosClient.get(`/events/trending`),
          axiosClient.get("/events/public/search", {
            params: { categoryIds: ["01KGJ1PKYHGAME8BA3QAXYDSCJ"], size: 4 },
          }),
          axiosClient.get("/events/public/search", {
            params: { categoryIds: ["01KGJ1N6SG60BZD68S7W09QD6P"], size: 4 },
          }),
          axiosClient.get("/events/recommendations", {
            params: { limit: 4 },
          }).catch((err) => {
            console.error("Fetch recommendations error, fallback to empty list", err);
            return { data: [] };
          }),
        ]);
        setTrending(resTrending?.data || []);
        setCat1(resCat1?.data?.content || []);
        setCat2(resCat2?.data?.content || []);
        setRecommendations(resRec?.data || []);
      } catch (error) {
        console.error("Fetch trending error:", error);
      } finally {
        setLoading(false);
        setRecLoading(false);
      }
    };
    getTrending();
  }, [user]);

  useEffect(() => {
    const fetchTimeEvents = async () => {
      try {
        setTimeLoading(true);
        let range;
        if (timeTab === "week") {
          range = getWeekRange();
        } else if (timeTab === "month") {
          range = getMonthRange();
        } else if (timeTab === "next3months") {
          range = getNext3MonthsRange();
        } else {
          range = getLast3MonthsRange();
        }

        const response = await axiosClient.get("/events/public/search", {
          params: {
            startTime: range.startTime,
            endTime: range.endTime,
            statuses: ["PUBLISHED"],
            size: 8,
          },
        });
        setTimeEvents(response?.data?.content || []);
      } catch (error) {
        console.error("Fetch time events error:", error);
      } finally {
        setTimeLoading(false);
      }
    };
    fetchTimeEvents();
  }, [timeTab, user]);

  useEffect(() => {
    const fetchBannerEvents = async () => {
      try {
        const range = getMonthRange();
        const response = await axiosClient.get("/events/public/search", {
          params: {
            startTime: range.startTime,
            endTime: range.endTime,
            statuses: ["PUBLISHED"],
            size: 5,
          },
        });
        setBannerEvents(response?.data?.content || []);
      } catch (error) {
        console.error("Fetch banner events error:", error);
      }
    };
    fetchBannerEvents();
  }, [user]);

  useEffect(() => {
    if (bannerEvents.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerEvents, currentSlide]);

  return (
    <>
      {/* Hero Banner Section (Auto-playing slideshow of events this month) */}
      {bannerEvents.length > 0 && (
        <div className="max-w-7xl mx-auto px-2 pt-6 pb-2">
          <div className="relative w-full aspect-[16/9] md:aspect-[2.4/1] lg:aspect-[3/1] max-h-[220px] sm:max-h-[300px] md:max-h-[340px] lg:max-h-[360px] rounded-2xl overflow-hidden shadow-2xl border border-white/5 group bg-slate-950">
            {bannerEvents.map((event, index) => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}/details`)}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 cursor-pointer flex items-center ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
              >
                {/* Background blurred poster for a gorgeous glass effect */}
                <div
                  className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-20"
                  style={{ backgroundImage: `url(${event?.poster?.url})` }}
                />

                {/* Clean background poster */}
                <img
                  src={event?.poster?.url}
                  alt={event.name}
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex flex-col justify-center px-6 md:px-16 py-6 md:py-8 z-20">
                  <div className="max-w-xl space-y-1.5 md:space-y-2">
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      Sự kiện trong tháng này
                    </span>
                    <h1
                      className="text-lg md:text-2xl lg:text-3xl font-extrabold text-white leading-tight drop-shadow-md"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: "1.4",
                        paddingBottom: "4px",
                      }}
                    >
                      {event.name}
                    </h1>
                    <div className="mt-2 md:mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-gray-300 text-[11px] md:text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] md:text-[20px] text-green-400">
                          calendar_today
                        </span>
                        <span className="whitespace-nowrap">{formatDateVN(event.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] md:text-[20px] text-green-400">
                          location_on
                        </span>
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    <div className="pt-1 md:pt-1.5 flex items-center gap-4">
                      <button className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-xs md:text-sm shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">local_activity</span>
                        Mua vé ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Left/Right Controls */}
            {bannerEvents.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + bannerEvents.length) % bannerEvents.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-30 shadow-lg"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % bannerEvents.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-30 shadow-lg"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                  {bannerEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(index);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 bg-green-500" : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {(!loading && trending.length === 0) ? null : (
        <main className="px-2 py-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <WhatshotIcon className="text-orange-500" sx={{ fontSize: 35 }} />
              <h3 className="text-xl font-bold text-white">Sự kiện nổi bật</h3>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full">
                  <EventCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <TrendingEvent events={trending}></TrendingEvent>
          )}
        </main>
      )}

      {/* Personalized Recommendations Section */}
      {(!recLoading && recommendations.length === 0) ? null : (
        <main className="px-2 py-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400 text-[35px] animate-pulse">
                auto_awesome
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Gợi ý dành riêng cho bạn</h3>
                <p className="text-xs text-gray-400 mt-0.5">Khám phá các sự kiện được đề xuất dựa trên sở thích của bạn</p>
              </div>
            </div>
          </div>

          {recLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full">
                  <EventCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
              {recommendations.map((item) => (
                <EventCard
                  key={item?.id}
                  event={item}
                  user={user}
                  openLogin={openLogin}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Time Filtered Events Tabs Section */}
      <main className="px-2 py-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-3">
          <div className="flex items-center gap-6">
            {[
              { id: "week", label: "Trong tuần" },
              { id: "month", label: "Trong tháng" },
              { id: "next3months", label: "Trong 3 tháng tới" },
              { id: "3months", label: "Trong 3 tháng qua" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeTab(tab.id)}
                className={`text-sm md:text-base font-semibold pb-2 relative transition-all ${timeTab === tab.id ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                {tab.label}
                {timeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              let range;
              if (timeTab === "week") {
                range = getWeekRange();
              } else if (timeTab === "month") {
                range = getMonthRange();
              } else if (timeTab === "next3months") {
                range = getNext3MonthsRange();
              } else {
                range = getLast3MonthsRange();
              }
              navigate(`/search?startTime=${range.startTime}&endTime=${range.endTime}&statuses=PUBLISHED`);
            }}
            className="text-gray-400 hover:text-white text-xs md:text-sm font-medium transition-colors"
          >
            Xem thêm &gt;
          </button>
        </div>

        {timeLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full">
                <EventCardSkeleton />
              </div>
            ))}
          </div>
        ) : timeEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm md:text-base bg-[hsla(0,0%,100%,.02)] rounded-xl border border-white/5">
            Không có sự kiện nào diễn ra trong khoảng thời gian này.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {timeEvents.map((item) => (
              <EventCard
                key={item?.id}
                event={item}
                user={user}
                openLogin={openLogin}
              />
            ))}
          </div>
        )}
      </main>

      {(!loading && cat1.length === 0) ? null : (
        <main className="px-2 py-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">Liveshow & Concert</h3>
            </div>
            <button
              onClick={() => navigate("/search?categoryIds=01KGJ1PKYHGAME8BA3QAXYDSCJ")}
              className="text-gray-400 hover:text-white text-xs md:text-sm font-medium transition-colors"
            >
              Xem thêm &gt;
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full">
                  <EventCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cat1?.map((item) => (
                <EventCard
                  event={item}
                  key={item?.id}
                  user={user}
                  openLogin={openLogin}
                ></EventCard>
              ))}
            </div>
          )}
        </main>
      )}

      {(!loading && cat2.length === 0) ? null : (
        <main className="px-2 py-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">
                Sân khấu & Nhạc kịch
              </h3>
            </div>
            <button
              onClick={() => navigate("/search?categoryIds=01KGJ1N6SG60BZD68S7W09QD6P")}
              className="text-gray-400 hover:text-white text-xs md:text-sm font-medium transition-colors"
            >
              Xem thêm &gt;
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full">
                  <EventCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cat2?.map((item) => (
                <EventCard
                  key={item?.id}
                  event={item}
                  user={user}
                  openLogin={openLogin}
                ></EventCard>
              ))}
            </div>
          )}
        </main>
      )}
    </>
  );
}

export default Home;
