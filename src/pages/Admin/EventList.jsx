import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Pagination from "../../components/common/Pagination";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ActionMenu from "../../components/common/ActionMenu";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RestoreIcon from "@mui/icons-material/Restore";
import CancelIcon from "@mui/icons-material/Cancel";
import UserDetailModal from "../../components/modals/UserDetailModal";
import axiosClient from "../../api/axiosClient";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { useCan } from "../../hooks/useCan";
import CategoryDetailModal from "../../components/modals/CategoryDetailModal";
import EventOverviewModal from "./EventOverview";
import { useHeader } from "../../hooks/useHeader";
import TableSkeleton from "../../components/common/TableSkeleton";
import RejectEventModal from "../../components/modals/RejectEventModal";
import RejectionReasonModal from "../../components/modals/RejectionReasonModal";
import { formatDateVN } from "../../utils/format";
function EventList() {
  const { setTitle } = useHeader();
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [events, setEvents] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
  });
  const [rejectReasonModal, setRejectReasonModal] = useState({
    isOpen: false,
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  const closeRejectModal = () =>
    setRejectModal((prev) => ({ ...prev, isOpen: false }));
  const closeRejectReasonModal = () =>
    setRejectReasonModal((prev) => ({ ...prev, isOpen: false }));
  const can = useCan();
  const fetchEvents = async (
    pageNo = 1,
    keyword = "",
    status = "ALL",
    categoryId = "",
    provinceId = "",
  ) => {
    try {
      setIsLoadingEvents(true);
      const result = await axiosClient.get("/events/search", {
        params: {
          page: pageNo,
          size: 5,
          keyword: keyword,
          status: status,
          categoryId: categoryId,
          provinceId: provinceId,
        },
      });
      setEvents(result?.data?.content || []);
      setTotalElements(result?.data?.totalElements || 0);
      setTotalPages(result?.data?.totalPages || 0);
      setCurrentPage(result?.data?.number + 1 || 1);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error.message);
    } finally {
      setIsLoadingEvents(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provinceRes, categoryRes] = await Promise.all([
          axiosClient.get("/provinces"),
          axiosClient.get("/categories"),
        ]);
        setProvinces(provinceRes.data);
        setCategories(categoryRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    };
    fetchData();
    setTitle("Quản lý sự kiện");
  }, []);
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    status: searchParams.get("status") || "",
    categoryId: searchParams.get("categoryId") || "",
    provinceId: searchParams.get("provinceId") || "",
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

  useEffect(() => {
    const page = searchParams.get("page") || 1;
    const keyword = searchParams.get("keyword") || "";
    const status = searchParams.get("status") || "ALL";
    const categoryId = searchParams.get("categoryId") || "";
    const provinceId = searchParams.get("provinceId") || "";
    fetchEvents(page, keyword, status, categoryId, provinceId);
  }, [searchParams]);

  useEffect(() => {
    setFilters({
      keyword: searchParams.get("keyword") || "",
      status: searchParams.get("status") || "ALL",
      categoryId: searchParams.get("categoryId") || "",
      provinceId: searchParams.get("provinceId") || "",
      page: parseInt(searchParams.get("page")) || 1,
    });
  }, [searchParams]);

  const renderStatusBadge = (status) => {
    const statusMap = {
      DRAFT: {
        label: "Bản nháp",
        badge:
          "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
        dot: "bg-slate-400",
      },
      PENDING: {
        label: "Chờ duyệt",
        badge:
          "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
        dot: "bg-yellow-500",
      },
      APPROVED: {
        label: "Đã duyệt",
        badge:
          "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
        dot: "bg-green-500",
      },
      PUBLISHED: {
        label: "Đã công khai",
        badge:
          "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        dot: "bg-emerald-500",
      },
      REJECTED: {
        label: "Bị từ chối",
        badge:
          "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        dot: "bg-red-500",
      },
      CANCELLED: {
        label: "Đã hủy",
        badge:
          "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
        dot: "bg-orange-500",
      },
      UPCOMING: {
        label: "Sắp diễn ra",
        badge:
          "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        dot: "bg-blue-500",
      },
      HAPPENING: {
        label: "Đang diễn ra",
        badge:
          "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
        dot: "bg-indigo-500",
      },
      FINISHED: {
        label: "Kết thúc",
        badge:
          "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
        dot: "bg-gray-400",
      },
    };
    const config = statusMap[status] || statusMap.DRAFT;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border border-transparent ${config.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
        {config.label}
      </span>
    );
  };

  const menuActions = (event) => {
    const actions = [];
    if (can()) {
      actions.push({
        label: "Xem chi tiết",
        icon: <VisibilityIcon fontSize="small" />,
        onClick: (item) => {
          navigate(`/admin/event/${item?.id}/overview`);
        },
      });
    }
    if (can()) {
      actions.push({
        label: "Sửa",
        icon: <EditIcon fontSize="small" />,
        onClick: (item) => {
          navigate(`/admin/update-event/${item.id}`);
        },
      });
    }
    if (can() && event?.status === "PENDING") {
      actions.push({
        label: "Duyệt",
        icon: <CheckCircleIcon fontSize="small" />,
        onClick: (item) => {
          setConfirmModal({
            isOpen: true,
            title: "Xác nhận duyệt sự kiện này",
            message: "Bạn có chắc sẽ xác nhận duyệt sự kiện có id: " + item.id,
            onConfirm: async () => {
              try {
                await axiosClient.patch(`/events/${item.id}/approve`);
                closeConfirmModal();
                window.location.reload();
              } catch (error) {
                console.log("Duyệt thất bại: ", error.message);
              }
            },
          });
        },
      });
    }
    if (can() && event?.status === "PENDING") {
      actions.push({
        label: "Từ chối",
        color: "error.main",
        icon: <CancelIcon fontSize="small" />,
        onClick: (item) => {
          setRejectModal({
            isOpen: true,
            onConfirm: async (reason) => {
              try {
                await axiosClient.patch(`/events/${item.id}/reject`, {
                  rejectionReason: reason,
                });
                closeRejectModal();
                window.location.reload();
              } catch (error) {
                console.log("Từ chối thất bại: ", error.message);
              }
            },
          });
        },
      });
    }
    if (can() && event?.status === "REJECTED") {
      actions.push({
        label: "Xem lý do bị từ chối",
        icon: <InfoOutlinedIcon fontSize="small" />,
        onClick: (item) => {
          setRejectReasonModal({
            isOpen: true,
            reason: item?.rejectionReason,
          });
        },
      });
    }
    // if (event.deletedAt === null) {
    //   if (can()) {
    //     actions.push({
    //       label: "Xóa",
    //       icon: <DeleteIcon fontSize="small" />,
    //       color: "error.main",
    //       onClick: (item) => {
    //         setConfirmModal({
    //           isOpen: true,
    //           title: "Xác nhận xóa chủ đề",
    //           message: "Bạn có chắc sẽ xóa chủ đề có id: " + item.id,
    //           onConfirm: async () => {
    //             try {
    //               await axiosClient.patch(`/categories/${item.id}/soft-delete`);
    //               const keyword = searchParams.get("keyword") || "";
    //               const status = searchParams.get("status") || "ALL";
    //               let page = parseInt(searchParams.get("page")) || 1;
    //               if (categories.length === 1 && page > 1) {
    //                 page -= 1;
    //                 const params = new URLSearchParams(searchParams);
    //                 params.set("page", page.toString());
    //                 setSearchParams(params);
    //                 setFilters((prev) => ({ ...prev, page: page }));
    //               }
    //               fetchCategories(page, keyword, status);
    //               closeConfirmModal();
    //             } catch (error) {
    //               console.log("Xóa thất bại: ", error.message);
    //             }
    //           },
    //         });
    //       },
    //     });
    //   }
    // } else {
    //   if (can()) {
    //     actions.push({
    //       label: "Khôi phục",
    //       icon: <RestoreIcon fontSize="small" />,
    //       onClick: (item) => {
    //         setConfirmModal({
    //           isOpen: true,
    //           title: "Xác nhận khôi phục chủ đề",
    //           message: "Bạn có chắc sẽ khôi phục chủ đề có id: " + item.id,
    //           onConfirm: async () => {
    //             try {
    //               await axiosClient.patch(`/categories/${item.id}/restore`);
    //               const keyword = searchParams.get("keyword") || "";
    //               const status = searchParams.get("status") || "ALL";
    //               let page = parseInt(searchParams.get("page")) || 1;
    //               if (categories.length === 1 && page > 1) {
    //                 page -= 1;
    //                 const params = new URLSearchParams(searchParams);
    //                 params.set("page", page.toString());
    //                 setSearchParams(params);
    //                 setFilters((prev) => ({ ...prev, page: page }));
    //               }
    //               fetchCategories(page, keyword, status);
    //               closeConfirmModal();
    //             } catch (error) {
    //               console.log("Khôi phục thất bại: ", error.message);
    //             }
    //           },
    //         });
    //       },
    //     });
    //   }
    // }
    return actions;
  };

  return (
    <>
      <RejectionReasonModal
        isOpen={rejectReasonModal.isOpen}
        onClose={closeRejectReasonModal}
        reason={rejectReasonModal?.reason}
      ></RejectionReasonModal>
      <RejectEventModal
        isOpen={rejectModal.isOpen}
        onClose={closeRejectModal}
        onConfirm={rejectModal?.onConfirm}
      ></RejectEventModal>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        title={confirmModal.title}
        onClose={closeConfirmModal}
        onConfirm={confirmModal?.onConfirm}
      ></ConfirmModal>
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl min-[480px]:text-3xl font-extrabold text-[#111b0d] dark:text-white tracking-tight">
            Danh sách sự kiện
          </h2>
          <p className="mt-1 text-sm text-[#6b7280] dark:text-[#a1aebf]"></p>
        </div>
        <button
          onClick={() => {
            navigate("/admin/add-event");
          }}
          className="whitespace-nowrap md:px-5 md:py-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#46ec13] px-5 py-2.5 text-sm font-bold text-black shadow-sm hover:bg-[#3ad60f] focus:outline-none focus:ring-2 focus:ring-[#46ec13] focus:ring-offset-2 dark:focus:ring-offset-[#142210] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>{" "}
          Thêm mới sự kiện
        </button>
      </div>
      <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] p-5 mb-6">
        <div className="flex flex-col gap-3">
          {/* HÀNG 1: Tìm kiếm chính và Thể loại */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-[20px] text-[#6b7280] dark:text-[#a1aebf]">
                    search
                  </span>
                </div>
                <input
                  className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 pl-10 pr-3 text-sm placeholder:text-[#6b7280] dark:placeholder:text-[#a1aebf] focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none"
                  placeholder="Nhập tên sự kiện hoặc địa điểm..."
                  value={filters.keyword}
                  type="text"
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <select
                value={filters.categoryId || ""}
                onChange={(e) =>
                  handleFilterChange("categoryId", e.target.value)
                }
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer"
              >
                <option value="">Tất cả thể loại</option>
                {categories.map((cate) => (
                  <option key={cate?.id} value={cate?.id}>
                    {cate?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <select
                value={filters.provinceId || ""}
                onChange={(e) =>
                  handleFilterChange("provinceId", e.target.value)
                }
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer"
              >
                <option value="">Toàn quốc</option>
                {provinces.map((provin) => (
                  <option key={provin?.id} value={provin?.id}>
                    {provin?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <select
                value={filters.status || "ALL"}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="REJECTED">Từ chối</option>
                <option value="PUBLISHED">Công khai</option>
                <option value="UPCOMING">Sắp diễn ra</option>
                <option value="HAPPENING">Đang diễn ra</option>
                <option value="FINISHED">Kết thúc</option>
              </select>
            </div>

            <div className="md:col-span-1 flex gap-2">
              <button
                onClick={() => {
                  setFilters({
                    keyword: "",
                    status: "ALL",
                    categoryId: "",
                    provinceId: "",
                    page: 1,
                  });
                  setSearchParams({});
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-[#2a4225] dark:hover:bg-[#36532f] text-gray-700 dark:text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all outline-none"
              >
                Xóa
              </button>
              <button
                onClick={applyFilters}
                className="whitespace-nowrap flex-[2] flex items-center justify-center gap-2 bg-[#46ec13] hover:bg-[#3ad60f] text-black font-bold py-2.5 px-4 rounded-lg text-sm transition-all active:scale-[0.98] shadow-md shadow-[#46ec13]/20"
              >
                <span className="material-symbols-outlined text-[18px]">
                  search
                </span>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e5e7eb] dark:divide-[#2a4225]">
            <thead className="bg-gray-50 dark:bg-black/20 w-full">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Id
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Tên sự kiện
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Thể loại
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Thành phố
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Địa điểm
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Tên ban tổ chức
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Trạng thái
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Ngày xét duyệt
                </th>
                <th className="relative px-6 py-3" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a4225] bg-white dark:bg-[#1c2e18]">
              {isLoadingEvents ? (
                <TableSkeleton rows={5} columns={7} />
              ) : (
                events?.map((event) => {
                  return (
                    <tr
                      key={event?.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="font-[500] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2 font-medium"
                          title={event?.id}
                        >
                          {event?.id}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={event?.name}>
                          {event?.name}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2"
                          title={event?.category?.name}
                        >
                          {event?.category?.name}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="max-w-[250px] line-clamp-2"
                          title={event?.province?.name}
                        >
                          {event?.province?.name}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="max-w-[250px] line-clamp-2"
                          title={event?.location}
                        >
                          {event?.location}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="max-w-[250px] line-clamp-2"
                          title={event?.organizerName}
                        >
                          {event?.organizerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(event?.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDateVN(event?.reviewedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionMenu actions={menuActions(event)} data={event} />
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
    </>
  );
}
export default EventList;
