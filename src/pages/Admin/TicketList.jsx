import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { formatDateVN } from "../../utils/format";
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
            background-color: #F4F7F6;
            color: #1a1c1e;
            font-family: 'Inter', sans-serif;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
        </style>

        {/* Main Content Canvas */}
        <main className="pt-5 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
          {/* Hero Section */}
          <section className="mb-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between items-center gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1a1c1e] font-['Manrope'] leading-tight">
                  {show?.eventName}
                </h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#444748] text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      calendar_today
                    </span>
                    <span>
                      {formatDateVN(show?.startTime)} -{" "}
                      {formatDateVN(show?.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      location_on
                    </span>
                    <span>{show?.eventLocation}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpenScanModal(true);
                }}
                className="whitespace-nowrap w-full md:w-auto flex items-center justify-center gap-3 bg-[#16a34a] text-[#ffffff] px-8 py-4 rounded-xl font-bold font-['Manrope'] shadow-lg shadow-[#16a34a]/20 active:scale-95 transition-transform hover:brightness-110"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  document_scanner
                </span>
                <span>MỞ CAMERA QUÉT QR</span>
              </button>
            </div>
          </section>

          {/* Stats Overview */}
          <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-sm">
              <p className="text-xs text-[#444748] uppercase tracking-widest mb-1">
                Tổng vé
              </p>
              <p className="text-2xl font-bold font-['Manrope'] text-[#1a1c1e]">
                {show?.totalTickets}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-sm">
              <p className="text-xs text-[#444748] uppercase tracking-widest mb-1">
                Đã vào
              </p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold font-['Manrope'] text-[#16a34a]">
                  {show?.checkedInCount}
                </p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-sm">
              <p className="text-xs text-[#444748] uppercase tracking-widest mb-1">
                Chưa vào
              </p>
              <p className="text-2xl font-bold font-['Manrope'] text-[#ba1a1a]">
                {show?.remainingCount}
              </p>
            </div>
          </section>

          <section className="bg-[#F4F7F6]/80 backdrop-blur-xl py-4 mb-6">
            {/* Container chính dùng Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Ô tìm kiếm chiếm 7 cột trên màn hình lớn (lg) */}
              <div className="relative w-full lg:col-span-6 group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#444748] group-focus-within:text-[#16a34a] transition-colors">
                  search
                </span>
                <input
                  value={filters.keyword}
                  className="w-full bg-white border border-[#c4c7c7]/50 rounded-xl pl-12 pr-4 py-3.5 text-sm text-[#1a1c1e] placeholder:text-[#444748] focus:ring-2 focus:ring-[#16a34a]/20 focus:border-[#16a34a] transition-all outline-none"
                  placeholder="Tìm kiếm id vé hoặc mã đơn hàng..."
                  type="text"
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                />
              </div>

              {/* Các nút bấm chiếm 5 cột còn lại trên màn hình lớn (lg) */}
              <div className="lg:col-span-6 grid grid-cols-5 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "ALL")}
                  className={`${filters.status === "ALL" ? "bg-[#16a34a] text-white" : "bg-white text-[#444748]"} col-span-1 px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border border-[#c4c7c7]/30 shadow-sm transition-all`}
                >
                  Tất cả
                </button>

                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "UNUSED")}
                  className={`${filters.status === "UNUSED" ? "bg-[#16a34a] text-white" : "bg-white text-[#444748]"} col-span-1 px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border border-[#c4c7c7]/30 transition-colors`}
                >
                  Chưa vào
                </button>

                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "USED")}
                  className={`${filters.status === "USED" ? "bg-[#16a34a] text-white" : "bg-white text-[#444748]"} col-span-1 px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border border-[#c4c7c7]/30 transition-colors`}
                >
                  Đã vào
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetFilter();
                  }}
                  className="col-span-1 bg-slate-100 hover:bg-slate-200 text-slate-500 px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shadow-sm active:scale-95 transition-all"
                >
                  Xóa
                </button>

                <button
                  type="button"
                  onClick={applyFilters}
                  className="col-span-1 bg-[#16a34a] hover:bg-green-700 text-white px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shadow-sm active:scale-95 transition-all"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </section>

          {/* Ticket Table */}
          <div className="bg-white rounded-3xl overflow-hidden border border-[#c4c7c7]/20 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f1f1]/50 border-b border-[#c4c7c7]/20">
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#444748] uppercase tracking-widest font-['Inter']">
                      Id
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#444748] uppercase tracking-widest font-['Inter']">
                      Khách hàng
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#444748] uppercase tracking-widest font-['Inter']">
                      Mã đơn hàng
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#444748] uppercase tracking-widest font-['Inter']">
                      Hạng vé / Ghế
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#444748] uppercase tracking-widest font-['Inter']">
                      Trạng thái
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#444748] uppercase tracking-widest font-['Inter'] text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c7c7]/10">
                  {isLoading ? (
                    <TableSkeleton columns={6} rows={5}></TableSkeleton>
                  ) : (
                    tickets?.map((ticket) => (
                      <tr
                        key={ticket?.id}
                        className="hover:bg-[#f8f9fa] transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <span className="font-mono text-sm text-[#444748]">
                            {ticket?.id}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-[#1a1c1e] font-semibold text-sm">
                                {ticket?.customerName}
                              </p>
                              <p className="text-[#444748] text-xs">
                                {ticket?.customerEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-sm text-[#444748]">
                            #{ticket?.reservationId}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="whitespace-nowrap">
                            <p className="text-[#1a1c1e] text-sm font-medium">
                              {ticket?.section}
                            </p>
                            <p className="text-[#444748] text-xs uppercase tracking-tighter">
                              {ticket?.seatLabel}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {/* Logic đổi màu Badge theo trạng thái */}
                          {ticket?.status === "UNUSED" ? (
                            <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/20">
                              Chưa vào cửa
                            </span>
                          ) : (
                            <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20">
                              Đã vào cửa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          {ticket?.status === "UNUSED" ? (
                            <button
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
                              className="bg-[#16a34a]/10 whitespace-nowrap hover:bg-[#16a34a] text-[#16a34a] hover:text-[#ffffff] px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                            >
                              CHECK-IN
                            </button>
                          ) : (
                            <div className="text-[#444748] text-xs font-medium italic">
                              Vào lúc {formatDateVN(ticket?.checkInAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  {/* <tr className="hover:bg-[#f8f9fa] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[#1a1c1e] font-semibold text-sm">
                          Nguyễn Thành Trung
                        </p>
                        <p className="text-[#444748] text-xs">
                          trung.nt@example.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm text-[#444748]">
                      #TBX-99210-24
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-[#1a1c1e] text-sm font-medium">
                        VIP 1
                      </p>
                      <p className="text-[#444748] text-xs uppercase tracking-tighter">
                        Khu A - Hàng 2 - Ghế 15
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/20">
                      Chưa vào cửa
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="bg-[#16a34a]/10 whitespace-nowrap hover:bg-[#16a34a] text-[#16a34a] hover:text-[#ffffff] px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95">
                      CHECK-IN
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-[#f8f9fa] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[#1a1c1e] font-semibold text-sm">
                          Lê Minh Hạnh
                        </p>
                        <p className="text-[#444748] text-xs">
                          hanhle@example.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm text-[#444748]">
                      #TBX-99208-24
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-[#1a1c1e] text-sm font-medium">
                        Standard
                      </p>
                      <p className="text-[#444748] text-xs uppercase tracking-tighter">
                        Khu C - Hàng 10 - Ghế 42
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20">
                      Đã vào cửa
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="text-[#444748] text-xs font-medium italic">
                      Vào lúc 18:42
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-[#f8f9fa] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[#1a1c1e] font-semibold text-sm">
                          Phạm Quốc Anh
                        </p>
                        <p className="text-[#444748] text-xs">
                          anh.pq@example.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm text-[#444748]">
                      #TBX-99195-24
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-[#1a1c1e] text-sm font-medium">
                        Platinum
                      </p>
                      <p className="text-[#444748] text-xs uppercase tracking-tighter">
                        Khu B - Hàng 5 - Ghế 08
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/20">
                      Chưa vào cửa
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="bg-[#16a34a]/10 hover:bg-[#16a34a] text-[#16a34a] hover:text-[#ffffff] px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95">
                      CHECK-IN
                    </button>
                  </td>
                </tr> */}
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
        </main>
      </div>
    </>
  );
};

export default TicketList;
