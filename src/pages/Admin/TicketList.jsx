import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { formatDateVN, formatShowTime } from "../../utils/format";
import Pagination from "../../components/common/Pagination";
import QrScanModal from "../../components/modals/QrScanModal";
import { useHeader } from "../../hooks/useHeader";
import TableSkeleton from "../../components/common/TableSkeleton";
import { toast, ToastContainer } from "react-toastify";
import ConfirmModal from "../../components/modals/ConfirmModal";

const TicketList = () => {
  const { showId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [show, setShow] = useState();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpenScanModal, setIsOpenScanModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

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

  const handleCheckInTicketById = async (id) => {
    try {
      const res = await axiosClient.post(`/tickets/${id}/check-in`, {
        checkInMethod: "TICKET_CODE",
        showId: showId,
      });
      handleUpdateTicket(res?.data);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      toastSuccess("Quét mã vé thành công.");
    } catch (error) {
      console.log(error.message);
      toastError(error.message);
    }
  };

  const handleUpdateTicket = (updatedTicket) => {
    const index = tickets.findIndex((t) => t.id === updatedTicket.id);
    if (index !== -1) {
      tickets[index] = updatedTicket;
      setTickets([...tickets]);
    }
    setShow((prev) => ({
      ...prev,
      checkedInCount: prev.checkedInCount + 1,
      remainingCount: Math.max(0, prev.remainingCount - 1),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const showRes = await axiosClient.get(`/shows/${showId}/registry`);
        setShow(showRes.data);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchData();
  }, [showId]);

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    status: searchParams.get("status") || "",
    page: parseInt(searchParams.get("page")) || 1,
  });

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePagination = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params.set(key, filters[key]);
    });
    setSearchParams(params);
  };

  const resetFilter = () => {
    const defaultValue = {
      pageNo: 1,
      keyword: "",
      status: "ALL",
    };
    setFilters(defaultValue);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("status", "ALL");
    setSearchParams(params);
  };

  useEffect(() => {
    let ignore = false;
    const fetchTickets = async (pageNo = 1, keyword = "", status = "ALL") => {
      try {
        setIsLoading(true);
        const result = await axiosClient.get("/tickets/search", {
          params: {
            page: pageNo,
            size: 5,
            keyword: keyword,
            status: status,
            showId: showId,
          },
        });
        if (ignore) return;
        setTickets(result?.data?.content);
        setTotalElements(result?.data?.totalElements || 0);
        setTotalPages(result?.data?.totalPages || 0);
        setCurrentPage(result?.data?.number + 1 || 1);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    const page = searchParams.get("page") || 1;
    const keyword = searchParams.get("keyword") || "";
    const status = searchParams.get("status") || "ALL";
    fetchTickets(page, keyword, status);
    return () => {
      ignore = true;
    };
  }, [searchParams]);

  useEffect(() => {
    setFilters({
      keyword: searchParams.get("keyword") || "",
      status: searchParams.get("status") || "ALL",
      page: parseInt(searchParams.get("page")) || 1,
    });
  }, [searchParams]);

  const { setTitle } = useHeader();
  useEffect(() => {
    setTitle("Danh sách Đăng ký & Soát vé");
  }, []);

  return (
    <>
      <ToastContainer />
      <QrScanModal
        isOpen={isOpenScanModal}
        onClose={() => {
          setIsOpenScanModal(false);
        }}
        showId={showId}
        handleUpdateTicket={handleUpdateTicket}
      ></QrScanModal>
      <ConfirmModal
        isOpen={confirmModal?.isOpen}
        title={confirmModal?.title}
        message={confirmModal?.message}
        onConfirm={confirmModal?.onConfirm}
        onClose={() => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
      ></ConfirmModal>
      <div className="antialiased selection:bg-[#16a34a] selection:text-[#ffffff]">
        <style>
          {`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          body {
            background-color: #F8FAFC;
            color: #0f172a;
            font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .btn-refresh:hover .refresh-icon {
            transform: rotate(360deg);
          }
          .refresh-icon {
            display: inline-block;
            transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `}
        </style>

        {/* Main Content Canvas */}
        <div className="pb-20 max-w-7xl mx-auto space-y-6">
          
          {/* Event Header Banner - Premium Glassmorphism với Gradient sang trọng */}
          <section className="bg-gradient-to-br from-white via-slate-50/30 to-white backdrop-blur-xl border border-white/60 shadow-[0_10px_35px_rgba(0,0,0,0.02)] rounded-3xl p-6 md:p-8 hover:shadow-[0_20px_50px_rgba(16,185,129,0.04)] transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 text-xs font-black rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  Đang diễn ra
                </div>
                <h3 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800 break-words leading-tight">
                  {show?.eventName}
                </h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-slate-500 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                      calendar_today
                    </span>
                    <span>
                      {formatShowTime(show?.startTime, show?.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                      location_on
                    </span>
                    <span className="break-words">{show?.eventLocation}</span>
                  </div>
                </div>
              </div>

              {/* Nút Scan QR Premium */}
              <button
                type="button"
                onClick={() => {
                  setIsOpenScanModal(true);
                }}
                className="whitespace-nowrap w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] rounded-2xl text-sm font-extrabold active:scale-95 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-base font-bold">
                  qr_code_scanner
                </span>
                MỞ CAMERA QUÉT QR
              </button>
            </div>
          </section>

          {/* Stats Overview - Premium Cohesive Stat Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Card 1: Tổng Vé */}
            <div className="min-w-0 p-5 rounded-2xl bg-white border border-slate-100 border-l-4 border-l-blue-500 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-slate-400 uppercase font-extrabold tracking-wider truncate">
                  Tổng vé
                </p>
                <p className="text-xl md:text-2xl font-extrabold text-blue-600 truncate mt-1">
                  {show?.totalTickets?.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0">
                <span className="material-symbols-outlined text-lg font-bold">confirmation_number</span>
              </div>
            </div>

            {/* Card 2: Đã Vào */}
            <div className="min-w-0 p-5 rounded-2xl bg-white border border-slate-100 border-l-4 border-l-emerald-500 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-slate-400 uppercase font-extrabold tracking-wider truncate">
                  Đã vào
                </p>
                <p className="text-xl md:text-2xl font-extrabold text-emerald-600 truncate mt-1">
                  {show?.checkedInCount?.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
                <span className="material-symbols-outlined text-lg font-bold">check_circle</span>
              </div>
            </div>

            {/* Card 3: Chưa Vào */}
            <div className="min-w-0 p-5 rounded-2xl bg-white border border-slate-100 border-l-4 border-l-rose-500 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-slate-400 uppercase font-extrabold tracking-wider truncate">
                  Chưa vào
                </p>
                <p className="text-xl md:text-2xl font-extrabold text-rose-600 truncate mt-1">
                  {show?.remainingCount?.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner shrink-0">
                <span className="material-symbols-outlined text-lg font-bold">pending</span>
              </div>
            </div>
          </section>

          {/* Search & Filter section - Segmented pill controls & outline buttons */}
          <section className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm">
            {/* Ô tìm kiếm chiếm rộng rãi, có highlight focus */}
            <div className="relative w-full lg:flex-1 lg:max-w-xl group shrink-0">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors text-base font-bold">
                search
              </span>
              <input
                value={filters.keyword}
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                placeholder="Tìm kiếm ID vé hoặc mã đơn hàng..."
                type="text"
                onChange={(e) =>
                  handleFilterChange("keyword", e.target.value)
                }
              />
            </div>

            {/* Các nút lọc tinh chỉnh Apple-grade Segmented Control */}
            <div className="flex flex-wrap md:flex-nowrap gap-3 w-full lg:w-auto items-center justify-end">
              {/* Segmented controls cho bộ lọc trạng thái */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 shrink-0">
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "ALL")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 shrink-0 ${
                    filters.status === "ALL" 
                      ? "bg-white text-slate-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "UNUSED")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 shrink-0 ${
                    filters.status === "UNUSED" 
                      ? "bg-white text-rose-600 shadow-sm" 
                      : "text-slate-500 hover:text-rose-600"
                  }`}
                >
                  Chưa vào
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "USED")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 shrink-0 ${
                    filters.status === "USED" 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-slate-500 hover:text-emerald-600"
                  }`}
                >
                  Đã vào
                </button>
              </div>

              {/* Actions Button */}
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={resetFilter}
                  className="btn-refresh px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black active:scale-95 transition-all flex items-center gap-1 border border-slate-200/40"
                >
                  <span className="refresh-icon material-symbols-outlined text-sm font-bold">restart_alt</span>
                  Làm mới
                </button>

                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-[0_4px_10px_rgba(16,185,129,0.15)] active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-bold">search</span>
                  Tìm kiếm
                </button>
              </div>
            </div>
          </section>

          {/* Ticket Table Premium Canvas */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)]">
            <div className="overflow-x-auto pb-1 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="whitespace-nowrap px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-['Plus Jakarta Sans']">
                      ID Vé
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-['Plus Jakarta Sans']">
                      Khách hàng
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-['Plus Jakarta Sans']">
                      Mã đơn hàng
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-['Plus Jakarta Sans']">
                      Hạng vé / Ghế
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-['Plus Jakarta Sans']">
                      Trạng thái
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-['Plus Jakarta Sans'] text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <TableSkeleton columns={6} rows={5}></TableSkeleton>
                  ) : (
                    tickets?.map((ticket) => (
                      <tr
                        key={ticket?.id}
                        className="hover:bg-slate-50/30 transition-colors group"
                      >
                        {/* ID Vé với định dạng Monospace sang trọng */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-500 font-medium bg-slate-100/50 border border-slate-200/20 px-2 py-0.5 rounded">
                            {ticket?.id}
                          </span>
                        </td>
                        
                        {/* Khách hàng */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-slate-800 font-bold text-sm">
                                {ticket?.customerName}
                              </p>
                              <p className="text-slate-400 text-xs font-semibold">
                                {ticket?.customerEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Mã đơn hàng */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-500 font-bold" title={ticket?.reservationCode || ticket?.reservationId}>
                            #{ticket?.reservationCode || ticket?.reservationId}
                          </span>
                        </td>

                        {/* Hạng vé / Ghế */}
                        <td className="px-6 py-4.5">
                          <div className="whitespace-nowrap">
                            <p className="text-slate-800 text-sm font-black">
                              {ticket?.section}
                            </p>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mt-0.5">
                              {ticket?.seatLabel || "-"}
                            </p>
                          </div>
                        </td>

                        {/* Trạng thái - Pill Badge */}
                        <td className="px-6 py-4.5">
                          {ticket?.status === "UNUSED" ? (
                            <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/10 text-rose-600">
                              Chưa vào cửa
                            </span>
                          ) : (
                            <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/10 text-emerald-600">
                              Đã vào cửa
                            </span>
                          )}
                        </td>

                        {/* Thao tác Check-in */}
                        <td className="px-6 py-4.5 text-right whitespace-nowrap">
                          {ticket?.status === "UNUSED" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: "Xác thực vé tham dự",
                                  message: `Bạn đang thực hiện check-in cho vé ${ticket?.id}. Vui lòng xác nhận?`,
                                  onConfirm: () => {
                                    handleCheckInTicketById(ticket?.id);
                                  },
                                });
                              }}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-[0_4px_12px_rgba(16,185,129,0.25)] text-white px-5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 uppercase tracking-wider shrink-0"
                            >
                              Check-in
                            </button>
                          ) : (
                            <div className="flex flex-col items-end gap-1 shrink-0 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100/50">
                                <span className="material-symbols-outlined text-[10px] font-extrabold">check</span>
                                Hoàn tất
                              </span>
                              <span className="text-slate-400 text-[10px] font-semibold italic">
                                Vào lúc {formatDateVN(ticket?.checkInAt)}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            totalElements={totalElements}
            pageSize={5}
            currentPage={currentPage}
            totalPage={totalPages}
            handlePagination={handlePagination}
          ></Pagination>
        </div>
      </div>
    </>
  );
};

export default TicketList;
