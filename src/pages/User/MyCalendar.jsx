import React, { useEffect, useState } from "react";
import ProfileSidebar from "./ProfileSidebar";
import axiosClient from "../../api/axiosClient";
import LoadingPage from "../LoadingPage";
import { formatDateVN, separateDateTime } from "../../utils/format";
import { useNavigate } from "react-router-dom";

const MyCalendar = () => {
  useEffect(() => {
    document.title = "Lịch sự kiện của tôi | Event Hunting";
    return () => {
      document.title = "Event Hunting";
    };
  }, []);

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"
  const [loading, setLoading] = useState(false);
  
  // Storing the original unified tickets
  const [allTickets, setAllTickets] = useState([]);
  // Storing the grouped distinct event schedules
  const [groupedEvents, setGroupedEvents] = useState([]);
  
  // Month State for the Calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());
  
  // Selected event group for the details modal popover
  const [selectedEventGroup, setSelectedEventGroup] = useState(null);

  // Sync the year in the popover picker whenever the calendar month shifts
  useEffect(() => {
    setPickerYear(currentMonth.getFullYear());
  }, [currentMonth]);

  // Fetching tickets within the active calendar month using time overlapping
  useEffect(() => {
    let ignore = false;
    const fetchAllTicketsData = async () => {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        // Start of the calendar month (00:00:00)
        const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
        // End of the calendar month (23:59:59)
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        // Convert local Date object to YYYY-MM-DDTHH:mm:ss format
        const toLocalISOString = (d) => {
          const pad = (n) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };

        const res = await axiosClient.get(`/tickets/my-tickets`, {
          params: {
            pageNumber: 1,
            size: 100,
            startTime: toLocalISOString(startOfMonth),
            endTime: toLocalISOString(endOfMonth),
          },
        });

        if (!ignore) {
          const list = res?.data?.content || [];
          setAllTickets(list);
          
          // Apply custom distinct event-grouping logic
          const grouped = groupTicketsByDistinctEvent(list);
          setGroupedEvents(grouped);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sự kiện:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchAllTicketsData();
    return () => {
      ignore = true;
    };
  }, [currentMonth]);

  // Safe timezone date conversions (local date matching)
  const getLocalDateStr = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseShowTimeLocalDateStr = (timeStr) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return getLocalDateStr(date);
  };

  // Distinct Event-Grouping Helper Function
  const groupTicketsByDistinctEvent = (ticketsList) => {
    const groups = {};
    ticketsList.forEach((ticket) => {
      if (!ticket?.showStartTime) return;
      // Local timezone safe date key
      const dateKey = parseShowTimeLocalDateStr(ticket.showStartTime);
      // Create a unique key combining Event Name & the Date
      const eventKey = `${ticket.eventName || "event"}_${dateKey}`;
      
      if (!groups[eventKey]) {
        groups[eventKey] = {
          id: ticket.id,
          eventName: ticket.eventName,
          eventLocation: ticket.eventLocation,
          showStartTime: ticket.showStartTime,
          showEndTime: ticket.showEndTime,
          reservationId: ticket.reservationId,
          tickets: [],
        };
      }
      groups[eventKey].tickets.push(ticket);
    });
    
    return Object.values(groups);
  };

  // --- CALENDAR GENERATOR CALCULATIONS ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDayIndex = new Date(year, month, 1).getDay();
    // In JS: Sunday is 0, Monday is 1... Saturday is 6.
    // We want Monday (T2) to be index 0, so CN (Sunday) becomes index 6.
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const daysInMonth = getDaysInMonth(year, month);
    const calendarGrid = [];

    // 1. Fill leading empty cells from the previous month
    for (let i = 0; i < startOffset; i++) {
      calendarGrid.push({ isCurrentMonth: false, day: null, date: null });
    }

    // 2. Fill active days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      calendarGrid.push({
        isCurrentMonth: true,
        day,
        date: cellDate,
      });
    }

    return calendarGrid;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Filter grouped events for a specific cell date
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = getLocalDateStr(date);
    return groupedEvents.filter((event) => {
      const eventDateStr = parseShowTimeLocalDateStr(event.showStartTime);
      return eventDateStr === dateStr;
    });
  };

  // Get distinct upcoming agenda list
  const getUpcomingEvents = () => {
    const now = new Date();
    return groupedEvents
      .filter((event) => new Date(event.showStartTime) >= now)
      .sort((a, b) => new Date(a.showStartTime) - new Date(b.showStartTime));
  };

  const renderCalendarSkeleton = () => {
    return (
      <div className="animate-pulse">
        {/* Navigation Bar Skeleton */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-[#131313] p-4 rounded-3xl border border-slate-800 gap-4">
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-slate-800"></div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-slate-800"></div>
            <div className="w-24 h-10 rounded-xl bg-white/5 border border-slate-800"></div>
          </div>
          <div className="w-48 h-10 rounded-2xl bg-white/5 border border-slate-800"></div>
        </div>

        {/* Weekday headers Skeleton */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName, idx) => (
            <div
              key={idx}
              className={`text-xs font-bold py-2 uppercase tracking-widest ${
                idx >= 5 ? "text-red-400/40" : "text-[#acabab]/40"
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Grid Days Skeleton */}
        <div className="grid grid-cols-7 gap-2 bg-[#131313]/40 p-2 rounded-3xl border border-slate-800 min-h-[500px]">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div
              key={idx}
              className="min-h-[100px] md:min-h-[120px] p-2 flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#131313]"
            >
              <div className="w-6 h-6 rounded-full bg-white/5"></div>
              {idx % 5 === 0 && (
                <div className="w-full h-5 rounded-lg bg-green-500/10 border border-green-500/10"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListSkeleton = () => {
    return (
      <div className="animate-pulse space-y-4">
        {/* Title skeleton */}
        <div className="w-48 h-6 bg-white/5 rounded-lg mb-6 border border-slate-800"></div>

        {/* List items skeleton */}
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="w-full flex flex-col md:flex-row bg-[#131313] rounded-3xl border border-slate-800"
          >
            {/* Left banner skeleton */}
            <div className="w-full md:w-40 shrink-0 bg-white/5 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800 space-y-2">
              <div className="w-12 h-8 bg-white/5 rounded-lg"></div>
              <div className="w-16 h-4 bg-white/5 rounded-md"></div>
              <div className="w-10 h-3 bg-white/5 rounded-sm"></div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3 min-w-0 flex-1">
                <div className="w-2/3 h-6 bg-white/5 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="w-1/2 h-4 bg-white/5 rounded-md"></div>
                  <div className="w-1/3 h-4 bg-white/5 rounded-md"></div>
                </div>
                <div className="w-32 h-6 bg-green-500/5 rounded-full border border-green-500/10"></div>
              </div>
              <div className="w-full md:w-36 h-12 bg-white/5 rounded-2xl border border-slate-800"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="w-full px-2 py-4 lg:px-6 lg:py-6 flex flex-col lg:flex-row gap-6 bg-[#0A0A0A] min-h-screen text-[#e7e5e5]">
        {/* Profile Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <ProfileSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header Title & Segment Toggle Controller */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#474848]/20 pb-5">
            <h3 className="font-headline text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400 text-3xl">calendar_month</span>
              Lịch trình của tôi
            </h3>

            {/* Segment Toggle */}
            <div className="inline-flex bg-[#131313] p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  viewMode === "calendar"
                    ? "bg-[#1DB954] text-black shadow-md"
                    : "text-[#acabab] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-lg">calendar_view_month</span>
                Dạng Lịch
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-[#1DB954] text-black shadow-md"
                    : "text-[#acabab] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                Dạng Danh Sách
              </button>
            </div>
          </div>

          {loading ? (
            viewMode === "calendar" ? renderCalendarSkeleton() : renderListSkeleton()
          ) : (
            <>
              {/* --- VIEW MODE 1: DẠNG LỊCH (MONTH GRID) --- */}
              {viewMode === "calendar" && (
                <div className="animate-in fade-in duration-300">
                  {/* Calendar Navigation bar */}
                  <div className="flex items-center justify-between mb-6 bg-[#131313] p-4 rounded-3xl border border-slate-800 shadow-md">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevMonth}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 hover:text-[#1DB954] border border-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 hover:text-[#1DB954] border border-slate-800 transition-colors"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                      <button
                        onClick={handleCurrentMonth}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-slate-800 transition-all text-[#acabab] hover:text-white ml-2"
                      >
                        Tháng này
                      </button>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-slate-800 hover:border-slate-700 text-white font-headline font-black tracking-wide uppercase text-sm md:text-base transition-all group"
                      >
                        <span>Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}</span>
                        <span className="material-symbols-outlined text-xl text-[#1DB954] transition-transform group-hover:translate-y-0.5">
                          arrow_drop_down
                        </span>
                      </button>

                      {isDatePickerOpen && (
                        <>
                          {/* Invisible Backdrop to close on click outside */}
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setIsDatePickerOpen(false)}
                          ></div>

                          {/* Dropdown Popover Card */}
                          <div className="absolute right-0 mt-2 w-72 bg-[#181818] border border-slate-800 rounded-3xl p-4 shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Year Selector header */}
                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                              <button
                                type="button"
                                onClick={() => setPickerYear(pickerYear - 1)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                              </button>
                              <span className="font-headline font-black text-white tracking-wider text-sm md:text-base">
                                Năm {pickerYear}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPickerYear(pickerYear + 1)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                              </button>
                            </div>

                            {/* 12 Months Grid */}
                            <div className="grid grid-cols-3 gap-2">
                              {Array.from({ length: 12 }, (_, mIdx) => {
                                const isSelected =
                                  currentMonth.getMonth() === mIdx &&
                                  currentMonth.getFullYear() === pickerYear;
                                return (
                                  <button
                                    key={mIdx}
                                    type="button"
                                    onClick={() => {
                                      setCurrentMonth(new Date(pickerYear, mIdx, 1));
                                      setIsDatePickerOpen(false);
                                    }}
                                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                      isSelected
                                        ? "bg-[#1DB954] text-black shadow-md font-black"
                                        : "bg-white/5 hover:bg-white/10 text-[#acabab] hover:text-white"
                                    }`}
                                  >
                                    Tháng {mIdx + 1}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Calendar Weekday headers row */}
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName, idx) => (
                      <div
                        key={dayName}
                        className={`text-xs font-bold py-2 uppercase tracking-widest ${
                          idx >= 5 ? "text-red-400" : "text-[#acabab]"
                        }`}
                      >
                        {dayName}
                      </div>
                    ))}
                  </div>

                  {/* Calendar monthly Days Grid */}
                  <div className="grid grid-cols-7 gap-2 bg-[#131313]/40 p-2 rounded-3xl border border-slate-800 shadow-2xl min-h-[500px]">
                    {generateCalendarDays().map((cell, index) => {
                      const dayEvents = getEventsForDate(cell.date);
                      const isToday =
                        cell.date &&
                        cell.date.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={index}
                          className={`min-h-[100px] md:min-h-[120px] p-2 flex flex-col justify-between rounded-2xl border transition-all duration-200 ${
                            cell.isCurrentMonth
                              ? isToday
                                ? "bg-[#131313] border-green-500/50 shadow-lg shadow-green-500/5"
                                : "bg-[#131313] border-slate-800 hover:border-slate-700 hover:bg-[#181818]"
                              : "bg-transparent border-transparent select-none pointer-events-none opacity-20"
                          }`}
                        >
                          {/* Day number */}
                          {cell.day && (
                            <div className="flex justify-between items-center mb-1">
                              <span
                                className={`text-xs md:text-sm font-extrabold rounded-full w-6 h-6 flex items-center justify-center ${
                                  isToday
                                    ? "bg-[#1DB954] text-black font-black"
                                    : "text-[#acabab]"
                                }`}
                              >
                                {cell.day}
                              </span>
                              {dayEvents.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                              )}
                            </div>
                          )}

                          {/* Event list for the day cell */}
                          <div className="flex-1 flex flex-col gap-1 justify-end overflow-hidden">
                            {cell.isCurrentMonth &&
                              dayEvents.slice(0, 2).map((eventGroup, eIdx) => (
                                <button
                                  key={eIdx}
                                  onClick={() => setSelectedEventGroup(eventGroup)}
                                  className="w-full text-left p-1 md:p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-[#e7e5e5] hover:bg-green-500/20 transition-all text-[10px] md:text-xs font-semibold truncate block"
                                  title={eventGroup.eventName}
                                >
                                  {eventGroup.eventName}
                                </button>
                              ))}
                            {dayEvents.length > 2 && (
                              <button
                                onClick={() => setSelectedEventGroup(dayEvents[0])}
                                className="w-full text-center text-[9px] text-[#1DB954] font-bold hover:underline"
                              >
                                +{dayEvents.length - 2} sự kiện khác
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- VIEW MODE 2: DẠNG DANH SÁCH (CHRONOLOGICAL AGENDA TIMELINE) --- */}
              {viewMode === "list" && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-4">
                    <h4 className="text-lg font-headline font-bold text-white mb-6">
                      Sự kiện sắp diễn ra ({getUpcomingEvents().length})
                    </h4>
                  </div>

                  {getUpcomingEvents().length > 0 ? (
                    <div className="space-y-4">
                      {getUpcomingEvents().map((eventGroup) => {
                        const { year, month, day } = separateDateTime(eventGroup.showStartTime);
                        return (
                          <div
                            key={eventGroup.id}
                            className="w-full relative flex flex-col md:flex-row bg-[#131313] rounded-3xl overflow-hidden border border-slate-800 shadow-xl hover:border-slate-700 transition-all duration-300 group"
                          >
                            {/* Date Banner (Left Sidebar) */}
                            <div className="w-full md:w-40 shrink-0 bg-green-500/5 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800">
                              <span className="font-headline text-3xl md:text-4xl font-black text-[#e7e5e5] mb-1">
                                {day}
                              </span>
                              <span className="font-headline text-sm font-extrabold text-[#1DB954] uppercase tracking-widest mb-1">
                                {month}
                              </span>
                              <span className="font-headline text-xs font-medium text-slate-500">
                                {year}
                              </span>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="space-y-3 min-w-0">
                                {/* Title */}
                                <h3 className="font-headline text-lg md:text-xl font-bold text-white group-hover:text-[#1DB954] transition-colors leading-tight truncate">
                                  {eventGroup.eventName}
                                </h3>

                                {/* Agenda Details Grid */}
                                <div className="space-y-1 text-sm text-[#acabab]">
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">schedule</span>
                                    <span>
                                      {formatDateVN(eventGroup.showStartTime)} - {formatDateVN(eventGroup.showEndTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">location_on</span>
                                    <span className="truncate max-w-md">{eventGroup.eventLocation}</span>
                                  </div>
                                </div>

                                {/* Duplicate Ticket Count Tag (Functional Distinction) */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#1DB954]/10 border border-[#1DB954]/25 text-[#1DB954]">
                                  <span className="material-symbols-outlined text-xs">confirmation_number</span>
                                  Bạn có {eventGroup.tickets.length} vé cho sự kiện này
                                </div>
                              </div>

                              {/* View details */}
                              <button
                                onClick={() => setSelectedEventGroup(eventGroup)}
                                className="w-full md:w-auto shrink-0 bg-white/5 hover:bg-[#1DB954] hover:text-black border border-slate-800 hover:border-transparent text-white transition-all font-bold text-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-lg">visibility</span>
                                Chi tiết vé lịch
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-24 text-center text-[#acabab] bg-[#131313] rounded-3xl border border-slate-800 shadow-md">
                      <span className="material-symbols-outlined text-4xl mb-3 text-slate-600">calendar_today</span>
                      <p>Không có sự kiện nào sắp diễn ra của bạn.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- PREMIUM GLASSMORPHIC DETAIL POPOVER MODAL --- */}
      {selectedEventGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Glass Backdrop Blur */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedEventGroup(null)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-[#131313] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 z-10 animate-in zoom-in duration-200">
            {/* Header Close button */}
            <div className="flex justify-between items-start mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-green-500/10 border border-green-500/25 text-[#1DB954]">
                Lịch chi tiết sự kiện
              </span>
              <button
                onClick={() => setSelectedEventGroup(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Event Name */}
            <h3 className="font-headline text-xl md:text-2xl font-black text-white leading-tight mb-5">
              {selectedEventGroup.eventName}
            </h3>

            {/* General Info */}
            <div className="space-y-4 mb-6 border-b border-slate-800 pb-5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#1DB954] mt-0.5">schedule</span>
                <div>
                  <h4 className="text-xs text-slate-500 font-extrabold uppercase tracking-wide">Thời gian biểu diễn</h4>
                  <p className="text-sm font-semibold text-[#e7e5e5] mt-0.5">
                    {formatDateVN(selectedEventGroup.showStartTime)} - {formatDateVN(selectedEventGroup.showEndTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#1DB954] mt-0.5">location_on</span>
                <div>
                  <h4 className="text-xs text-slate-500 font-extrabold uppercase tracking-wide">Địa điểm tổ chức</h4>
                  <p className="text-sm font-semibold text-[#e7e5e5] mt-0.5 leading-relaxed">
                    {selectedEventGroup.eventLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* List of purchased tickets - Distinct Display */}
            <div>
              <h4 className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs">confirmation_number</span>
                Danh sách vé đã đặt ({selectedEventGroup.tickets.length} vé)
              </h4>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedEventGroup.tickets.map((t, idx) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-500">Mã đơn hàng: {t.reservationCode || t.reservationId}</p>
                      <p className="text-sm font-extrabold text-[#e7e5e5] mt-0.5 truncate">Vé #{idx + 1}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedEventGroup(null);
                          navigate(`/my-tickets/${t.id}`);
                        }}
                        className="bg-green-500/10 hover:bg-[#1DB954] text-[#1DB954] hover:text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">confirmation_number</span>
                        Xem vé
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEventGroup(null);
                          navigate(`/reservations/${t.reservationId}/summary`);
                        }}
                        className="bg-white/5 hover:bg-white/10 text-[#acabab] hover:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all"
                      >
                        Chi tiết đơn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEventGroup(null)}
                className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors"
              >
                Đóng lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyCalendar;
