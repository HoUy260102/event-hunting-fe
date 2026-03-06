import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useParams } from "react-router-dom";
import ShowItem from "../../components/EventInfor/ShowItem";
const formatShowTime = (startStr, endStr) => {
  const start = dayjs(startStr).locale("vi");
  const end = dayjs(endStr).locale("vi");
  if (start.isSame(end, "day")) {
    return `${start.format("HH:mm")} - ${end.format("HH:mm")}, ${start.format("DD/MM/YYYY")}`;
  }
  return `${start.format("HH:mm, DD/MM")} - ${end.format("HH:mm, DD/MM/YYYY")}`;
};

function EventInfor() {
  const cutoutClass =
    "absolute left-[355px] w-[30px] h-[30px] bg-[#121212] rounded-full z-10 hidden md:block";
  const [isExpanded, setIsExpanded] = useState(false);
  const [event, setEvent] = useState(false);
  const [shows, setShows] = useState([]);
  const contentRef = useRef(null);
  const { id } = useParams();
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRes = await axiosClient.get(`/events/${id}/info`);
        setEvent(eventRes.data);
        setShows(eventRes.data?.shows);
        console.log("Data xịn nè:", eventRes.data);
      } catch (error) {
        console.error(error.message);
      }
    };
    if (id) {
      fetchEvent();
    }
  }, [id]);
  return (
    <>
      <div className="w-full min-h-screen bg-[#121212] text-white antialiased">
        <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 mx-auto max-w-9xl w-full">
          <div className="space-y-10">
            <section className="relative bg-[#1E1E21] flex flex-col md:flex-row rounded-[1.5rem] overflow-hidden shadow-2xl">
              {/* PHẦN RĂNG CƯA (CUTOUT) */}
              <div className={`${cutoutClass} -top-[15px]`}></div>
              <div className={`${cutoutClass} -bottom-[15px]`}></div>

              {/* ĐƯỜNG KẺ ĐỨT (DASHED LINE) */}
              <div className="absolute left-[380px] top-5 bottom-5 border-l-2 border-dashed border-white/10 hidden md:block"></div>
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
                        stroke-width="2"
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
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-[#2DC275] mt-1 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
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
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-bold">Giá từ</span>
                    <span className="text-2xl font-extrabold text-[#2DC275]">
                      {event?.minPrice?.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <button className="w-full py-3 bg-[#2DC275] text-black font-bold rounded-lg hover:bg-[#22A05E] transition-colors shadow-lg shadow-[#2DC275]/20">
                    Mua vé ngay
                  </button>
                </div>
              </div>

              <div className="flex-1 relative min-h-[300px] max-h-[471px]">
                <img
                  alt="Hoàng Dũng"
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
                      className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base transition-all duration-500 ease-in-out overflow-hidden"
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

                <div className="bg-[#1E1E21] rounded-2xl overflow-hidden">
                  <div className="px-6 py-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Thông tin suất diễn và vé</h2>
                  </div>

                  {shows.map((show) => {
                    return (
                      <ShowItem
                        key={show.id}
                        show={show}
                        formatShowTime={formatShowTime}
                      />
                    );
                  })}
                </div>
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
          </div>

          <footer className="mt-20 py-10 border-t border-white/10 text-center text-[#9CA3AF] text-sm">
            <p>
              © 2026 Ticketbox Co. Ltd. Bản quyền thuộc về Hoàng Dũng & Lirico
              Entertainment.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
export default EventInfor;
