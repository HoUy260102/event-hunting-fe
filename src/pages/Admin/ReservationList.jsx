import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Pagination from "../../components/common/Pagination";
import ActionMenu from "../../components/common/ActionMenu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RestoreIcon from "@mui/icons-material/Restore";
import UserDetailModal from "../../components/modals/UserDetailModal";
import axiosClient from "../../api/axiosClient";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { useCan } from "../../hooks/useCan";
import { useHeader } from "../../hooks/useHeader";
import ReservationDetailModal from "../../components/modals/ReservationDetailModal";
import TableSkeleton from "../../components/common/TableSkeleton";
import { formatDateVN } from "../../utils/format";
import { useAuth } from "../../hooks/useAuth";

const renderStatusBadge = (status) => {
  const statusMap = {
    PENDING: {
      label: "Chờ thanh toán",
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
      dot: "bg-amber-500",
    },
    PAID: {
      label: "Đã thanh toán",
      badge:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      dot: "bg-green-500",
    },
    CANCELLED: {
      label: "Đã hủy",
      badge:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
      dot: "bg-red-500",
    },
    EXPIRED: {
      label: "Hết hạn",
      badge:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      dot: "bg-gray-400",
    },
    DELETED: {
      label: "Đã xóa",
      badge: "bg-black text-white dark:bg-white/10 dark:text-gray-400",
      dot: "bg-white",
    },
  };

  const config = statusMap[status?.toUpperCase()] || statusMap.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border border-transparent ${config.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

function ReservationList() {
  const { setTitle } = useHeader();
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [events, setEvents] = useState([]);
  const [shows, setShows] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [isReservationDetailModalOpen, setIsReservationDetailModalOpen] =
    useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  const can = useCan();
  const { user } = useAuth();

  const fetchReservations = async (
    pageNo = 1,
    keyword = "",
    status = "ALL",
    eventId,
    showId,
  ) => {
    try {
      setIsLoadingReservations(true);
      const endpoint = user?.role === "ORGANIZER" ? "/reservations/me" : "/reservations/search";
      const result = await axiosClient.get(endpoint, {
        params: {
          page: pageNo,
          size: 5,
          keyword: keyword,
          status: status,
          eventId: eventId,
          showId: showId,
        },
      });
      setReservations(result?.data?.content);
      setTotalElements(result?.data?.totalElements || 0);
      setTotalPages(result?.data?.totalPages || 0);
      setCurrentPage(result?.data?.number + 1 || 1);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error.message);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    status: searchParams.get("status") || "",
    page: parseInt(searchParams.get("page")) || 1,
    eventId: searchParams.get("eventId") || "",
    showId: searchParams.get("showId") || "",
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

  useEffect(() => {
    setTitle("Quản lý đặt chỗ");
  }, []);

  useEffect(() => {
    const page = searchParams.get("page") || 1;
    const keyword = searchParams.get("keyword") || "";
    const status = searchParams.get("status") || "ALL";
    const eventId = searchParams.get("eventId") || "";
    const showId = searchParams.get("showId") || "";
    fetchReservations(page, keyword, status, eventId, showId);
  }, [searchParams]);

  useEffect(() => {
    setFilters({
      keyword: searchParams.get("keyword") || "",
      status: searchParams.get("status") || "ALL",
      page: parseInt(searchParams.get("page")) || 1,
      eventId: searchParams.get("eventId") || "",
      showId: searchParams.get("showId") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    try {
      const fetchEventSelection = async () => {
        const endpoint =
          user?.role === "ORGANIZER"
            ? `/events/me/selection`
            : `/events/selection`;
        const eventRes = await axiosClient.get(endpoint);
        setEvents(eventRes?.data);
      };
      fetchEventSelection();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  useEffect(() => {
    const fetchShows = async () => {
      if (!filters.eventId) {
        setShows([]);
        return;
      }
      try {
        const response = await axiosClient.get(
          `/events/${filters.eventId}/shows/selection`,
        );
        handleFilterChange("showId", "");
        setShows(response.data);
      } catch (error) {
        console.error("Lỗi khi fetch show:", error);
        setShows([]);
      }
    };

    fetchShows();
  }, [filters.eventId]);

  const handleOpenReservationDetailModal = (item) => {
    setSelectedReservation(item.id);
    setIsReservationDetailModalOpen(true);
  };

  const handleCloseReservationDetailModal = () => {
    setIsReservationDetailModalOpen(false);
    setSelectedReservation(null);
  };

  const menuActions = (reservation) => {
    const actions = [];
    if (can("RESERVATION:VIEW")) {
      actions.push({
        label: "Xem chi tiết",
        icon: <VisibilityIcon fontSize="small" />,
        onClick: (item) => {
          handleOpenReservationDetailModal(item);
        },
      });
    }
    return actions;
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    params.set("status", "ALL");
    params.set("page", "1");

    setFilters({
      keyword: "",
      status: "ALL",
      eventId: "",
      showId: "",
      page: 1,
    });

    setShows([]);
    setSearchParams(params);
  };

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        title={confirmModal.title}
        onClose={closeConfirmModal}
        onConfirm={confirmModal?.onConfirm}
      ></ConfirmModal>
      <div className="bg-white/60 dark:bg-[#1c2e18]/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 dark:border-[#2a4225]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111b0d] dark:text-white tracking-tight">
            Danh sách đặt chỗ
          </h2>
          <p className="mt-1.5 text-xs text-[#6b7280] dark:text-[#a1aebf] font-medium max-w-2xl">
            Theo dõi, tra cứu và quản lý tất cả các đơn đặt vé, trạng thái thanh toán và thông tin vé của khách hàng.
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] p-5 mb-6">
        {/* CỤM 1: KHU VỰC FILTERS (GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search ID */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-symbols-outlined text-sm text-[#6b7280]">
                fingerprint
              </span>
            </div>
            <input
              type="text"
              placeholder="Mã đơn / ID đặt chỗ..."
              className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 pl-10 pr-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white outline-none"
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>

          {/* Dropdown Event */}
          <select
            value={filters.eventId || ""}
            onChange={(e) => {
              handleFilterChange("eventId", e.target.value);
            }}
            className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white outline-none"
          >
            <option value="">Tất cả sự kiện</option>
            {events?.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>

          {/* Dropdown Show */}
          <select
            value={filters.showId || ""}
            onChange={(e) => {
              handleFilterChange("showId", e.target.value);
            }}
            className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white outline-none"
          >
            <option value="">Tất cả suất diễn</option>
            {shows?.map((show) => (
              <option key={show.id} value={show.id}>
                {formatDateVN(show.startTime)} - {formatDateVN(show.endTime)}
              </option>
            ))}
          </select>

          {/* Dropdown Status */}
          <select
            value={filters.status || "ALL"}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý (Pending)</option>
            <option value="EXPIRED">Hết hạn (Expired)</option>
            <option value="CANCELLED">Đã hủy (Cancelled)</option>
            <option value="PAID">Đã xác nhận (Paid)</option>
          </select>
        </div>

        {/* ĐƯỜNG KẺ NGĂN CÁCH (Tùy chọn) */}
        <div className="h-px bg-[#e5e7eb] dark:bg-[#2a4225] my-5" />

        {/* CỤM 2: KHU VỰC ACTIONS (NÚT BẤM) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Bên trái: Chú thích hoặc đếm kết quả (nếu có) */}
          <p className="text-xs text-[#6b7280] dark:text-[#a1aebf]">
            * Nhập thông tin để lọc danh sách đặt chỗ.
          </p>

          {/* Bên phải: Cụm nút bấm */}
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-[#142210] border border-[#e5e7eb] dark:border-[#2a4225] dark:text-white text-gray-700 font-semibold py-2 px-5 rounded-lg text-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                restart_alt
              </span>
              Làm mới
            </button>

            <button
              onClick={applyFilters}
              className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-[#46ec13] hover:bg-[#3ad60f] text-black font-bold py-2 px-10 rounded-lg text-sm transition-all active:scale-95 shadow-sm shadow-[#46ec13]/20"
            >
              <span className="material-symbols-outlined text-[18px]">
                search
              </span>
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e5e7eb] dark:divide-[#2a4225]">
            <thead className="bg-gray-50 dark:bg-black/20 w-full">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider">
                  Thông tin khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider">
                  Sự kiện
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider">
                  Suất diễn
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a4225] bg-white dark:bg-[#1c2e18]">
              {isLoadingReservations ? (
                <TableSkeleton rows={5} columns={6} />
              ) : (
                reservations?.map((res) => {
                  return (
                    <tr
                      key={res?.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-[#a1aebf]">
                        <span title={res?.code || res?.id} className="font-mono">{res?.code || res?.id}</span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap font-mono text-xs text-gray-500">
                            ID: {res?.userId || "N/A"}
                          </span>
                          <span className="font-medium text-gray-700 dark:text-[#a1aebf]">
                            {res?.customerName}
                          </span>
                          <span className="text-[11px] text-gray-500 italic">
                            {res?.customerEmail}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap font-mono text-xs text-gray-500">
                            ID: {res?.eventId}
                          </span>
                          <span className="font-medium">
                            {res?.eventName || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap font-mono text-xs text-gray-500">
                            ID: {res?.showId}
                          </span>
                          <span className="font-medium">
                            {formatDateVN(res?.showStartTime) || "N/A"} -{" "}
                            {formatDateVN(res?.showEndTime) || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between gap-4 text-[11px] text-gray-500">
                            <span>Gốc:</span>
                            <span className="line-through">
                              {res?.totalAmount?.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 text-[11px] text-red-500 font-medium">
                            <span>Giảm:</span>
                            <span>
                              -{res?.discountAmount?.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 text-[13px] font-bold text-[#46ec13] mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <span>Tổng:</span>
                            <span>
                              {res?.finalAmount?.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(res?.status)}
                      </td>

                      <td className="px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <span className="font-mono">
                          {formatDateVN(res?.createdAt)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionMenu actions={menuActions(res)} data={res} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Phân trang */}
      <Pagination
        totalElements={totalElements}
        pageSize={5}
        currentPage={currentPage}
        totalPage={totalPages}
        handlePagination={handlePagination}
      ></Pagination>
      <ReservationDetailModal
        isOpen={isReservationDetailModalOpen}
        onClose={handleCloseReservationDetailModal}
        reservationId={selectedReservation}
      ></ReservationDetailModal>
    </>
  );
}
export default ReservationList;
