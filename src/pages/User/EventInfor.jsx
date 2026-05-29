import { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useParams, Link } from "react-router-dom";
import ShowItem from "../../components/EventInfor/ShowItem";
import { formatShowTime } from "../../utils/format";
import EventSkeleton from "../../components/EventInfor/EventSkeleton";
import { useAuth } from "../../hooks/useAuth";
import EventCard from "../../components/EventSearch/User/EventCard";
import EventCardSkeleton from "../../components/EventSearch/User/EventCardSkeleton";

function EventInfor() {
  const showSectionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const cutoutClass =
    "absolute left-[355px] w-[30px] h-[30px] bg-[#121212] rounded-full z-10 hidden md:block";
  const [isExpanded, setIsExpanded] = useState(false);
  const [event, setEvent] = useState(false);
  const [shows, setShows] = useState([]);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const contentRef = useRef(null);
  const { user, openLogin, requireAuth } = useAuth();
  const { id } = useParams();
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const eventRes = await axiosClient.get(`/events/${id}/info`);
        const eventData = eventRes.data;
        setEvent(eventData);
        setShows(eventData?.shows);
        console.log("Data xịn nè:", eventData);

        if (eventData?.category?.id) {
          try {
            setIsRelatedLoading(true);
            const relatedRes = await axiosClient.get("/events/public/search", {
              params: { categoryIds: [eventData.category.id], size: 5 },
            });
            const filtered = (relatedRes?.data?.content || [])
              .filter((item) => item.id !== eventData.id)
              .slice(0, 4);
            setRelatedEvents(filtered);
          } catch (err) {
            console.error("Fetch related events error:", err);
          } finally {
            setIsRelatedLoading(false);
          }
        }
      } catch (error) {
        if (error.status === 404) {
          window.location.href = "/notfound";
          return;
        }
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchEvent();
    }
  }, [id]);

  useEffect(() => {
    if (event?.name) {
      document.title = `${event.name} | Event Hunting`;
    } else {
      document.title = "Đang tải sự kiện... | Event Hunting";
    }
    return () => {
      document.title = "Event Hunting";
    };
  }, [event]);

  const scrollToShows = () => {
    showSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleBuy = (show) => {
    requireAuth(`/event/${id}/show/${show.id}/queue`);
  };

  const renderBuyButton = () => {
    const baseClass = "w-full py-3 font-bold rounded-lg transition-colors";

    if (event?.status === "CANCELLED") {
      return (
        <div className={`${baseClass} bg-red-700 text-white text-center cursor-default`}>
          Đã hủy
        </div>
      );
    }

    if (event?.status === "POSTPONED") {
      return (
        <div className={`${baseClass} bg-yellow-500 text-white text-center cursor-default`}>
          Hoãn lại
        </div>
      );
    }

    if (event?.status !== "PUBLISHED") {
      return (
        <div className={`${baseClass} bg-gray-600 text-white text-center cursor-default`}>
          Chưa mở bán
        </div>
      );
    }

    if (!shows || shows.length === 0) {
      return (
        <div className={`${baseClass} bg-gray-600 text-white text-center`}>
          Chưa có lịch diễn
        </div>
      );
    }

    if (shows.length > 1) {
      return (
        <button
          onClick={scrollToShows}
          className={`${baseClass} bg-[#2DC275] text-black hover:bg-[#22A05E]`}
        >
          Vui lòng chọn lịch diễn
        </button>
      );
    }
    const status = shows[0]?.status;
    switch (status) {
      case "ON_SALE":
        return (
          <button
            onClick={() => {
              handleBuy(shows[0]);
            }}
            className={`${baseClass} bg-[#2DC275] text-black hover:bg-[#22A05E]`}
          >
            Mua vé ngay
          </button>
        );

      case "SOLD_OUT":
        return (
          <div className={`${baseClass} bg-gray-600 text-white text-center`}>
            Hết vé
          </div>
        );

      case "UPCOMING":
        return (
          <div className={`${baseClass} bg-blue-600 text-white text-center`}>
            Sắp diễn ra
          </div>
        );

      case "HAPPENING":
        return (
          <div className={`${baseClass} bg-orange-500 text-white text-center`}>
            Đang diễn ra
          </div>
        );

      case "FINISHED":
        return (
          <div className={`${baseClass} bg-gray-800 text-gray-400 text-center`}>
            Đã kết thúc
          </div>
        );

      case "CANCELLED":
        return (
          <div className={`${baseClass} bg-red-700 text-white text-center`}>
            Đã hủy
          </div>
        );

      case "POSTPONED":
        return (
          <div className={`${baseClass} bg-yellow-500 text-white text-center`}>
            Hoãn lại
          </div>
        );

      default:
        return null;
    }
  };

  const otherShowCount = shows?.length > 1 ? shows.length - 1 : 0;

  if (isLoading) return <EventSkeleton />;
  return (
    <>
      <style>{`
        .ck-content {
          color: white !important;
        }
        
        .ck-content span[style*="color"] {
          color: inherit; 
        }

        .ck-content .text-align-center { text-align: center; }
        .ck-content .text-align-right { text-align: right; }
        .ck-content .text-align-justify { text-align: justify; }

        .ck-content h1, .ck-content h2, .ck-content h3, .ck-content strong {
          color: white !important;
          font-weight: bold;
        }
      `}</style>
      <div className="w-full min-h-screen bg-[#121212] text-white antialiased">
        <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 mx-auto max-w-9xl w-full">
          <div className="space-y-10">
            <section className="relative bg-[#1E1E21] flex flex-col md:flex-row rounded-[1.5rem] overflow-hidden shadow-2xl">
              {/* PHẦN RĂNG CƯA (CUTOUT) */}
              <div className={`${cutoutClass} -top-[15px]`}></div>
              <div className={`${cutoutClass} -bottom-[15px]`}></div>
              {/* ĐƯỜNG KẺ ĐỨT (DASHED LINE) */}
              <div className="absolute left-[370px] top-5 bottom-5 border-l-2 border-dashed border-white/10 hidden md:block"></div>
              <div className="w-full md:max-h-[471px] md:w-[375px] p-8 flex flex-col justify-between relative z-20">
                <div>
                  <h2 className="text-2xl font-extrabold mb-6">
                    {event?.name}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[#2DC275]">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          height="18"
                          rx="2"
                          ry="2"
                          width="18"
                          x="3"
                          y="4"
                        ></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      <span className="font-bold text-sm">
                        {formatShowTime(event?.startTime, event?.endTime)}
                      </span>
                    </div>
                    {otherShowCount > 0 && (
                      <button
                        onClick={scrollToShows}
                        className="ml-8 text-xs px-2 py-[2px] border border-white bg-transparent text-white hover:bg-white/10 w-fit"
                      >
                        +{otherShowCount} ngày khác
                      </button>
                    )}
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-[#2DC275] mt-1 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <div>
                        <p className="font-bold text-[#2DC275] text-sm">
                          {event?.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <p className="!italic text-slate-100 text-sm">
                        {event?.address}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="px-2 py-1 rounded bg-[#46ec13]/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                      {event?.category === null
                        ? "Chưa phân loại"
                        : event?.category?.status === "INACTIVE"
                          ? "Danh mục đã ngừng hoạt động"
                          : event?.category?.name}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-2 border-t border-white/10">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-bold">Giá từ</span>
                    <span className="text-2xl font-extrabold text-[#2DC275]">
                      {event?.minPrice?.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  {renderBuyButton()}
                </div>
              </div>

              <div className="flex-1 relative min-h-[300px] max-h-[471px]">
                <img
                  alt={event?.name || "Banner"}
                  className="w-full h-full object-cover"
                  src={event?.banner?.url}
                />
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <section className="lg:col-span-3 space-y-8">
                <div className="bg-[#1E1E21] rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-[#2D2D32] px-6 py-4">
                    <h2 className="text-lg font-bold text-[#2DC275]">
                      Giới thiệu
                    </h2>
                  </div>
                  <div className="p-6 md:p-10 space-y-6 relative">
                    <div
                      ref={contentRef}
                      style={{
                        maxHeight: isExpanded
                          ? `${contentRef.current?.scrollHeight}px`
                          : "250px",
                      }}
                      className="ck-content space-y-4 text-gray-300 leading-relaxed text-sm md:text-base transition-all duration-500 ease-in-out overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html: event.descriptionHtml,
                      }}
                    ></div>
                    {!isExpanded && (
                      <div className="absolute bottom-16 left-0 w-full h-24 bg-gradient-to-t from-[#1E1E21] to-transparent z-10"></div>
                    )}

                    {/* Nút Xem thêm / Thu gọn */}
                    <div className="mt-6 flex justify-center relative z-20">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-8 py-2.5 text-[#2DC275] font-bold text-sm transition-all flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <>
                            Thu gọn{" "}
                            <svg
                              className="w-4 h-4 rotate-180"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            Xem thêm{" "}
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  ref={showSectionRef}
                  className="bg-[#1E1E21] rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">
                      Thông tin suất diễn và vé
                    </h2>
                  </div>

                  {shows.map((show) => {
                    return (
                      <ShowItem
                        key={show.id}
                        show={show}
                        handleBuy={handleBuy}
                        eventStatus={event?.status}
                      />
                    );
                  })}
                </div>

                {/* Bản đồ địa điểm */}
                {(event?.address || event?.location) && (
                  <div className="bg-[#1E1E21] rounded-2xl overflow-hidden shadow-xl">
                    <div className="bg-[#2D2D32] px-6 py-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#2DC275] text-[20px]">
                        map
                      </span>
                      <h2 className="text-lg font-bold text-[#2DC275]">
                        Bản đồ địa điểm
                      </h2>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-300 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#2DC275] text-[18px]">
                          location_on
                        </span>
                        <span>
                          <strong>{event?.location}</strong>
                          {event?.address && ` - ${event?.address}`}
                        </span>
                      </p>
                      <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-md border border-white/10">
                        <iframe
                          title="Google Map Location"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            (event?.location || "") + " " + (event?.address || "")
                          )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          allowFullScreen
                          loading="lazy"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
            <section
              className="mt-10 bg-[#1E1E21] rounded-2xl overflow-hidden shadow-xl"
              data-purpose="organizer-section"
            >
              <div className="bg-[#2D2D32]/50 px-6 py-3">
                <h2 className="text-sm font-bold text-[#2DC275] uppercase tracking-wider">
                  Ban tổ chức
                </h2>
              </div>

              <div className="p-6 flex items-center gap-6">
                <div className="flex gap-8">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      alt="Logo Ban tổ chức"
                      className="w-full h-full object-contain p-2"
                      src={event?.organizerLogo?.url}
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-extrabold text-white">
                      {event?.organizerName}
                    </h3>
                    <p className="text-sm md:text-base text-[#9CA3AF]">
                      {event?.organizerInfo}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sự kiện liên quan */}
            {event?.category && (relatedEvents.length > 0 || isRelatedLoading) && (
              <section className="mt-12 bg-[#1E1E21] rounded-2xl overflow-hidden shadow-xl p-6">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Sự kiện liên quan: <span className="text-[#2DC275]">{event?.category?.name}</span>
                  </h2>
                  <Link
                    to={`/search?categoryIds=${event?.category?.id}`}
                    className="text-[#2DC275] hover:text-[#22A05E] font-bold text-sm flex items-center gap-1 transition-colors"
                  >
                    Xem thêm
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>

                {isRelatedLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <EventCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedEvents.map((item) => (
                      <EventCard
                        key={item.id}
                        event={item}
                        user={user}
                        openLogin={openLogin}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <footer className="mt-20 py-10 border-t border-white/10 text-center text-[#9CA3AF] text-sm">
            <p>
              © 2026 Bản quyền thuộc về {event?.organizerName || "Ban tổ chức"} & Event Hunting.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
export default EventInfor;
