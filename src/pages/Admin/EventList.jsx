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
import CategoryDetailModal from "../../components/modals/CategoryDetailModal";
import EventOverviewModal from "./EventOverview";
function EventList() {
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  const can = useCan();
  const fetchCategories = async (
    pageNo = 1,
    keyword = "",
    status = "ALL",
    categoryId = "",
    provinceId = "",
  ) => {
    try {
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
      setEvents(result?.data?.content);
      setTotalElements(result?.data?.totalElements || 0);
      setTotalPages(result?.data?.totalPages || 0);
      setCurrentPage(result?.data?.number + 1 || 1);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error.message);
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
    fetchCategories(page, keyword, status, categoryId, provinceId);
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
            Quản lý sự kiện
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
      <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] p-4 mb-6">
        <div className="flex md:flex-wrap flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-symbols-outlined text-[#6b7280] dark:text-[#a1aebf]">
                search
              </span>
            </div>
            <input
              className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 pl-10 pr-3 text-sm placeholder:text-[#6b7280] dark:placeholder:text-[#a1aebf] focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white"
              placeholder="Search..."
              value={filters.keyword}
              type="text"
              onChange={(e) => {
                handleFilterChange("keyword", e.target.value);
              }}
            />
          </div>
          <div className="flex gap-4 relative flex-1">
            <select
              value={filters.categoryId || ""}
              onChange={(e) => {
                handleFilterChange("categoryId", e.target.value);
              }}
              className="block w-full md:w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white"
            >
              <option value="">Chọn thể loại</option>
              {categories.map((cate) => (
                <option key={cate?.id} value={cate?.id}>
                  {cate?.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex md:flex-wrap flex-col md:flex-row gap-4 mt-2">
          <div className="flex gap-4 relative flex-1">
            <select
              value={filters.provinceId || ""}
              onChange={(e) => {
                handleFilterChange("provinceId", e.target.value);
              }}
              className="block w-full md:w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white"
            >
              <option value="">Chọn tỉnh thành</option>
              {provinces.map((provin) => (
                <option key={provin?.id} value={provin?.id}>
                  {provin?.name}
                </option>
              ))}
            </select>
            <select
              value={filters.status || "ALL"}
              onChange={(e) => {
                handleFilterChange("status", e.target.value);
              }}
              className="block w-full md:w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Công khai</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="UPCOMING">Sắp diễn ra</option>
              <option value="HAPPENING">Đang diễn ra</option>
              <option value="FINISHED">Kết thúc</option>
            </select>
            <button
              onClick={applyFilters}
              className="inline-flex items-center gap-2 bg-[#46ec13] hover:bg-[#3ad60f] text-black font-bold py-2.5 px-6 rounded-lg text-sm transition-all active:scale-95 whitespace-nowrap shadow-sm shadow-[#46ec13]/20"
            >
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
                <th className="relative px-6 py-3" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a4225] bg-white dark:bg-[#1c2e18]">
              {events?.map((event) => {
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu
                        actions={menuActions(event)}
                        data={event}
                      />
                    </td>
                  </tr>
                );
              })}
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
