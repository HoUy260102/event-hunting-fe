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
import CategoryDetailModal from "../../components/modals/CategoryDetailModal";
import TableSkeleton from "../../components/common/TableSkeleton";
import Modal from "../../components/common/Modal";
function CategoryList() {
  const { setTitle } = useHeader();
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const [isCategoryDetailModalOpen, setIsCategoryDetailModalOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  const can = useCan();
  const fetchCategories = async (pageNo = 1, keyword = "", status = "ALL") => {
    try {
      setIsLoadingCategories(true);
      const result = await axiosClient.get("/categories/search", {
        params: {
          page: pageNo,
          size: 5,
          keyword: keyword,
          status: status,
        },
      });
      setCategories(result?.data?.content);
      setTotalElements(result?.data?.totalElements || 0);
      setTotalPages(result?.data?.totalPages || 0);
      setCurrentPage(result?.data?.number + 1 || 1);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error.message);
    } finally {
      setIsLoadingCategories(false);
    }
  };

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

  useEffect(() => {
    setTitle("Quản lý chủ đề");
  }, []);

  useEffect(() => {
    const page = searchParams.get("page") || 1;
    const keyword = searchParams.get("keyword") || "";
    const status = searchParams.get("status") || "ALL";
    fetchCategories(page, keyword, status);
  }, [searchParams]);

  useEffect(() => {
    setFilters({
      keyword: searchParams.get("keyword") || "",
      status: searchParams.get("status") || "ALL",
      page: parseInt(searchParams.get("page")) || 1,
    });
  }, [searchParams]);

  const handleOpenCategoryDetailModal = (item) => {
    setSelectedCategory(item);
    setIsCategoryDetailModalOpen(true);
  };

  const handleCloseUserDetailModal = () => {
    setIsCategoryDetailModalOpen(false);
    setSelectedCategory(null);
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: {
        label: "Active",
        badge:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        dot: "bg-green-500",
      },
      INACTIVE: {
        label: "Inactive",
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
        dot: "bg-amber-500",
      },
      DELETED: {
        label: "Deleted",
        badge:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
        dot: "bg-red-500",
      },
    };
    const config = statusMap[status] || statusMap.inactive;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border border-transparent ${config.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
        {config.label}
      </span>
    );
  };

  const menuActions = (category) => {
    const actions = [];
    if (can("CATEGORY:VIEW")) {
      actions.push({
        label: "Xem chi tiết",
        icon: <VisibilityIcon fontSize="small" />,
        onClick: (item) => {
          handleOpenCategoryDetailModal(item);
        },
      });
    }
    if (can("CATEGORY:UPDATE")) {
      actions.push({
        label: "Sửa",
        icon: <EditIcon fontSize="small" />,
        onClick: (item) => {
          navigate(`/admin/update-category/${item.id}`);
        },
      });
    }
    if (category.deletedAt === null) {
      if (can("CATEGORY:DELETE")) {
        actions.push({
          label: "Xóa",
          icon: <DeleteIcon fontSize="small" />,
          color: "error.main",
          onClick: (item) => {
            setConfirmModal({
              isOpen: true,
              title: "Xác nhận xóa chủ đề",
              message: `Bạn có chắc chắn muốn xóa chủ đề "${item.name}" không?`,
              onConfirm: async () => {
                try {
                  await axiosClient.patch(`/categories/${item.id}/soft-delete`);
                  const keyword = searchParams.get("keyword") || "";
                  const status = searchParams.get("status") || "ALL";
                  let page = parseInt(searchParams.get("page")) || 1;
                  if (categories.length === 1 && page > 1) {
                    page -= 1;
                    const params = new URLSearchParams(searchParams);
                    params.set("page", page.toString());
                    setSearchParams(params);
                    setFilters((prev) => ({ ...prev, page: page }));
                  }
                  fetchCategories(page, keyword, status);
                  closeConfirmModal();
                  setModal({
                    isOpen: true,
                    title: "Xóa chủ đề.",
                    message: "Xóa chủ đề thành công!",
                    type: "success",
                  });
                } catch (error) {
                  closeConfirmModal();
                  setModal({
                    isOpen: true,
                    title: "Xóa chủ đề.",
                    message: "Xóa chủ đề thất bại: " + error?.message,
                    type: "error",
                  });
                  console.log("Xóa thất bại: ", error.message);
                }
              },
            });
          },
        });
      }
    } else {
      if (can("CATEGORY:RESTORE")) {
        actions.push({
          label: "Khôi phục",
          icon: <RestoreIcon fontSize="small" />,
          onClick: (item) => {
            setConfirmModal({
              isOpen: true,
              title: "Xác nhận khôi phục chủ đề",
              message: `Bạn có chắc chắn muốn khôi phục chủ đề "${item.name}" không?`,
              onConfirm: async () => {
                try {
                  await axiosClient.patch(`/categories/${item.id}/restore`);
                  const keyword = searchParams.get("keyword") || "";
                  const status = searchParams.get("status") || "ALL";
                  let page = parseInt(searchParams.get("page")) || 1;
                  if (categories.length === 1 && page > 1) {
                    page -= 1;
                    const params = new URLSearchParams(searchParams);
                    params.set("page", page.toString());
                    setSearchParams(params);
                    setFilters((prev) => ({ ...prev, page: page }));
                  }
                  fetchCategories(page, keyword, status);
                  closeConfirmModal();
                  setModal({
                    isOpen: true,
                    title: "Khôi phục chủ đề.",
                    message: "Khôi phục chủ đề thành công!",
                    type: "success",
                  });
                } catch (error) {
                  closeConfirmModal();
                  setModal({
                    isOpen: true,
                    title: "Khôi phục chủ đề.",
                    message: "Khôi phục chủ đề thất bại: " + error?.message,
                    type: "error",
                  });
                  console.log("Khôi phục thất bại: ", error.message);
                }
              },
            });
          },
        });
      }
    }
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
      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
          type={modal.type}
        />
      )}
      <div className="bg-white/60 dark:bg-[#1c2e18]/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 dark:border-[#2a4225]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111b0d] dark:text-white tracking-tight">
            Danh sách chủ đề
          </h2>
          <p className="mt-1.5 text-xs text-[#6b7280] dark:text-[#a1aebf] font-medium max-w-2xl">
            Quản lý các danh mục, thể loại sự kiện giúp phân loại và tìm kiếm thông tin sự kiện khoa học và trực quan.
          </p>
        </div>
        {can("CATEGORY:CREATE") && (
          <button
            onClick={() => {
              navigate("/admin/add-category");
            }}
            className="whitespace-nowrap md:px-5 md:py-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-400/10 hover:shadow-emerald-400/20 px-5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-[#142210] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>{" "}
            Thêm mới chủ đề
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] p-5 mb-6">
        <div className="flex flex-col gap-4">
          {/* Dòng 1: Ô tìm kiếm chiếm trọn 1 dòng */}
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-symbols-outlined text-[20px] text-[#6b7280] dark:text-[#a1aebf]">
                search
              </span>
            </div>
            <input
              className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 pl-10 pr-3 text-sm placeholder:text-[#6b7280] dark:placeholder:text-[#a1aebf] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:text-white transition-all outline-none"
              placeholder="Nhập tên chủ đề hoặc mô tả..."
              value={filters.keyword}
              type="text"
              onChange={(e) => {
                handleFilterChange("keyword", e.target.value);
              }}
            />
          </div>

          {/* Dòng 2: Trạng thái, Làm mới, Tìm kiếm */}
          <div className="grid grid-cols-3 gap-4">
            <div className="w-full">
              <select
                value={filters.status || "ALL"}
                onChange={(e) => {
                  handleFilterChange("status", e.target.value);
                }}
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:text-white transition-all outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="DELETED">Đã xóa</option>
              </select>
            </div>
            <button
              onClick={() => {
                setFilters({
                  keyword: "",
                  status: "ALL",
                  page: 1,
                });
                setSearchParams({});
              }}
              className="group w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-[#2a4225] dark:hover:bg-[#36532f] text-gray-700 dark:text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all outline-none whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] mr-2 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg]">
                restart_alt
              </span>
              Làm mới
            </button>
            <button
              onClick={applyFilters}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all active:scale-95 whitespace-nowrap shadow-md shadow-emerald-400/10 hover:shadow-emerald-400/20 cursor-pointer"
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
                  Tên chủ đề
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Slug
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Mô tả
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
              {isLoadingCategories ? (
                <TableSkeleton rows={5} columns={5}></TableSkeleton>
              ) : (
                categories?.map((category) => {
                  return (
                    <tr
                      key={category?.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="font-[500] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2 font-medium"
                          title={category?.id}
                        >
                          {category?.id}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={category?.name}>
                          {category?.name}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={category?.slug}>
                          {category?.slug}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="max-w-[250px] line-clamp-2"
                          title={category?.description}
                        >
                          {category?.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(category?.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionMenu
                          actions={menuActions(category)}
                          data={category}
                        />
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
      <CategoryDetailModal
        isOpen={isCategoryDetailModalOpen}
        onClose={handleCloseUserDetailModal}
        data={selectedCategory}
      ></CategoryDetailModal>
    </>
  );
}
export default CategoryList;
