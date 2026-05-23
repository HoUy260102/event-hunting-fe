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
import { useAuth } from "../../hooks/useAuth";
import { useHeader } from "../../hooks/useHeader";
import VoucherDetailModal from "../../components/modals/VoucherDetailModal";
import TableSkeleton from "../../components/common/TableSkeleton";
import { formatDateVN } from "../../utils/format";
import VoucherListModal from "../../components/modals/VoucherListModal";
function VoucherList() {
  const { setTitle } = useHeader();
  const { user } = useAuth();
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [isVoucherDetailModalOpen, setIsVoucherDetailModalOpen] =
    useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  const can = useCan();
  const fetchVouchers = async (pageNo = 1, keyword = "", status = "ALL") => {
    try {
      setIsLoadingVouchers(true);
      const endpoint =
        user?.role === "ORGANIZER" ? "/vouchers/me" : "/vouchers/search";
      const result = await axiosClient.get(endpoint, {
        params: {
          page: pageNo,
          size: 5,
          keyword: keyword,
          status: status,
        },
      });
      setVouchers(result?.data?.content);
      setTotalElements(result?.data?.totalElements || 0);
      setTotalPages(result?.data?.totalPages || 0);
      setCurrentPage(result?.data?.number + 1 || 1);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error.message);
    } finally {
      setIsLoadingVouchers(false);
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
    setTitle("Quản lý khuyến mãi");
  }, []);

  useEffect(() => {
    const page = searchParams.get("page") || 1;
    const keyword = searchParams.get("keyword") || "";
    const status = searchParams.get("status") || "ALL";
    fetchVouchers(page, keyword, status);
  }, [searchParams]);

  useEffect(() => {
    setFilters({
      keyword: searchParams.get("keyword") || "",
      status: searchParams.get("status") || "ALL",
      page: parseInt(searchParams.get("page")) || 1,
    });
  }, [searchParams]);

  const handleOpenVoucherDetailModal = (item) => {
    setSelectedVoucher(item);
    setIsVoucherDetailModalOpen(true);
  };

  const handleCloseVoucherDetailModal = () => {
    setIsVoucherDetailModalOpen(false);
    setSelectedVoucher(null);
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      DRAFT: {
        label: "Draft",
        badge:
          "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700",
        dot: "bg-gray-400",
      },
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

  const menuActions = (voucher) => {
    const actions = [];
    if (can("VOUCHER:VIEW")) {
      actions.push({
        label: "Xem chi tiết",
        icon: <VisibilityIcon fontSize="small" />,
        onClick: (item) => {
          handleOpenVoucherDetailModal(item);
        },
      });
    }
    if (can("VOUCHER:UPDATE")) {
      actions.push({
        label: "Sửa",
        icon: <EditIcon fontSize="small" />,
        onClick: (item) => {
          navigate(`/admin/update-voucher/${item.id}`);
        },
      });
    }
    if (voucher.deletedAt === null) {
      if (can("VOUCHER:DELETE")) {
        actions.push({
          label: "Xóa",
          icon: <DeleteIcon fontSize="small" />,
          color: "error.main",
          onClick: (item) => {
            setConfirmModal({
              isOpen: true,
              title: "Xác nhận xóa voucher",
              message: "Bạn có chắc sẽ xóa voucher có id: " + item.id,
              onConfirm: async () => {
                try {
                  await axiosClient.patch(`/vouchers/${item.id}/soft-delete`);
                  const keyword = searchParams.get("keyword") || "";
                  const status = searchParams.get("status") || "ALL";
                  let page = parseInt(searchParams.get("page")) || 1;
                  if (vouchers.length === 1 && page > 1) {
                    page -= 1;
                    const params = new URLSearchParams(searchParams);
                    params.set("page", page.toString());
                    setSearchParams(params);
                    setFilters((prev) => ({ ...prev, page: page }));
                  }
                  fetchVouchers(page, keyword, status);
                  closeConfirmModal();
                } catch (error) {
                  console.log("Xóa thất bại: ", error.message);
                }
              },
            });
          },
        });
      }
    } else {
      if (can("VOUCHER:RESTORE")) {
        actions.push({
          label: "Khôi phục",
          icon: <RestoreIcon fontSize="small" />,
          onClick: (item) => {
            setConfirmModal({
              isOpen: true,
              title: "Xác nhận khôi phục voucher",
              message: "Bạn có chắc sẽ khôi phục voucher có id: " + item.id,
              onConfirm: async () => {
                try {
                  await axiosClient.patch(`/vouchers/${item.id}/restore`);
                  const keyword = searchParams.get("keyword") || "";
                  const status = searchParams.get("status") || "ALL";
                  let page = parseInt(searchParams.get("page")) || 1;
                  if (vouchers.length === 1 && page > 1) {
                    page -= 1;
                    const params = new URLSearchParams(searchParams);
                    params.set("page", page.toString());
                    setSearchParams(params);
                    setFilters((prev) => ({ ...prev, page: page }));
                  }
                  fetchVouchers(page, keyword, status);
                  closeConfirmModal();
                } catch (error) {
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
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl min-[480px]:text-3xl font-extrabold text-[#111b0d] dark:text-white tracking-tight">
          Danh sách khuyến mãi
        </h2>
        {can("VOUCHER:CREATE") && (
          <button
            onClick={() => {
              navigate("/admin/add-voucher");
            }}
            className="whitespace-nowrap md:px-5 md:py-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#46ec13] px-5 py-2.5 text-sm font-bold text-black shadow-sm hover:bg-[#3ad60f] focus:outline-none focus:ring-2 focus:ring-[#46ec13] focus:ring-offset-2 dark:focus:ring-offset-[#142210] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>{" "}
            Thêm mới khuyến mãi
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] p-4 mb-6">
        <div className="flex md:flex-wrap flex-col md:flex-row gap-4">
          <div className="relative flex-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-symbols-outlined text-[#6b7280] dark:text-[#a1aebf]">
                search
              </span>
            </div>
            <input
              className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 pl-10 pr-3 text-sm placeholder:text-[#6b7280] dark:placeholder:text-[#a1aebf] focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white"
              placeholder="Nhập id, code, show id..."
              value={filters.keyword}
              type="text"
              onChange={(e) => {
                handleFilterChange("keyword", e.target.value);
              }}
            />
          </div>
          <div className="flex gap-4 relative flex-1">
            <select
              value={filters.status || "ALL"}
              onChange={(e) => {
                handleFilterChange("status", e.target.value);
              }}
              className="block w-full md:w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Nháp</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="DELETED">Đã xóa</option>
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
                  Tên
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Code
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Số lượng
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Ngày bắt đầu
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Ngày kết thúc
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Loại khuyến mãi
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Giá trị khuyến mãi
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Giá trị đơn hàng tối thiểu
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Giá trị khuyến mãi tối đa
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Phạm vi
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
                  Mã show
                </th>
                <th className="relative px-6 py-3" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a4225] bg-white dark:bg-[#1c2e18]">
              {isLoadingVouchers ? (
                <TableSkeleton rows={5} columns={13}></TableSkeleton>
              ) : (
                vouchers?.map((voucher) => {
                  return (
                    <tr
                      key={voucher?.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="font-[500] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2 font-medium"
                          title={voucher?.id}
                        >
                          {voucher?.id}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={voucher?.name}>
                          {voucher?.name}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={voucher?.code}>
                          {voucher?.code}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={voucher?.quantity}>
                          {voucher?.quantity}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2"
                          title={voucher?.startTime}
                        >
                          {formatDateVN(voucher?.startTime)}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={voucher?.endTime}>
                          {formatDateVN(voucher?.endTime)}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2"
                          title={voucher?.discountType}
                        >
                          {voucher?.discountType}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2"
                          title={voucher?.discountValue}
                        >
                          {voucher?.discountValue}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2"
                          title={voucher?.minOrderValue}
                        >
                          {voucher?.minOrderValue}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2"
                          title={voucher?.maxDiscountValue}
                        >
                          {voucher?.maxDiscountValue}
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={voucher?.scope}>
                          {voucher?.scope}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(voucher?.status)}
                      </td>
                      <td className="font-[400] px-6 py-4 text-sm text-black dark:text-[#a1aebf]">
                        <div className="line-clamp-2" title={voucher?.showId}>
                          {voucher?.showId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionMenu
                          actions={menuActions(voucher)}
                          data={voucher}
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
      <VoucherDetailModal
        isOpen={isVoucherDetailModalOpen}
        onClose={handleCloseVoucherDetailModal}
        data={selectedVoucher}
      ></VoucherDetailModal>
    </>
  );
}
export default VoucherList;
