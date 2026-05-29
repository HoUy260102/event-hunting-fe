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
import TableSkeleton from "../../components/common/TableSkeleton";
import Modal from "../../components/common/Modal";

const UserStatusBadge = ({ status }) => {
  const statusConfig = {
    ACTIVE: {
      label: "Hoạt động",
      class:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      dot: "bg-green-500",
    },
    INACTIVE: {
      label: "Không hoạt động",
      class:
        "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800",
      dot: "bg-gray-500",
    },
    BLOCKED: {
      label: "Bị khóa",
      class:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
      dot: "bg-orange-500",
    },
    DELETED: {
      label: "Đã xóa",
      class:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
      dot: "bg-red-500",
    },
    UNVERIFIED: {
      label: "Chưa xác thực",
      class:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      dot: "bg-blue-500",
    },
  };

  const config = statusConfig[status?.toUpperCase()] || statusConfig.UNVERIFIED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border border-transparent ${config.class}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

function UserList() {
  const { setTitle } = useHeader();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
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
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  const can = useCan();
  const fetchUsers = async (
    pageNo = 1,
    keyword = "",
    status = "all",
    roleId = "",
  ) => {
    try {
      setIsLoadingUsers(true);
      const result = await axiosClient.get("/users/search", {
        params: {
          page: pageNo,
          size: 5,
          keyword: keyword,
          status: status,
          roleId: roleId,
        },
      });
      setUsers(result?.data?.content);
      setTotalElements(result?.data?.totalElements || 0);
      setTotalPages(result?.data?.totalPages || 0);
      setCurrentPage(result?.data?.number + 1 || 1);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };
  const iconMap = {
    ADMIN: (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
        <span className="material-symbols-outlined text-[14px]">
          shield_person
        </span>{" "}
        admin
      </span>
    ),
    ORGANIZER: (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-200 dark:bg-green-900/30 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-300">
        <span className="material-symbols-outlined text-[14px]">groups</span>{" "}
        Organizer
      </span>
    ),
    USER: (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-bold text-[#6b7280] dark:text-[#a1aebf]">
        <span className="material-symbols-outlined text-[14px]">person</span>{" "}
        User
      </span>
    ),
  };

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    roleId: searchParams.get("roleId") || "",
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
    const page = searchParams.get("page") || 1;
    const keyword = searchParams.get("keyword") || "";
    const status = searchParams.get("status") || "all";
    const roleId = searchParams.get("roleId") || "";
    fetchUsers(page, keyword, status, roleId);
  }, [searchParams]);

  useEffect(() => {
    setFilters({
      keyword: searchParams.get("keyword") || "",
      roleId: searchParams.get("roleId") || "",
      status: searchParams.get("status") || "",
      page: parseInt(searchParams.get("page")) || 1,
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosClient.get("/roles/select");
        setRoles(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách role:", error.message);
      }
    };
    fetchRoles();
  }, []);

  const handleOpenUserDetailModal = (user) => {
    setSelectedUser(user);
    setIsUserDetailModalOpen(true);
  };

  const handleCloseUserDetailModal = () => {
    setIsUserDetailModalOpen(false);
    setSelectedUser(null);
  };

  const menuActions = (user) => {
    const actions = [];
    if (can("USER:VIEW")) {
      actions.push({
        label: "Xem chi tiết",
        icon: <VisibilityIcon fontSize="small" />,
        onClick: (item) => handleOpenUserDetailModal(item),
      });
    }
    if (can("USER:UPDATE")) {
      actions.push({
        label: "Sửa",
        icon: <EditIcon fontSize="small" />,
        onClick: (item) => {
          navigate(`/admin/update-user/${item.id}`);
        },
      });
    }
    if (user.deletedAt === null) {
      if (can("USER:DELETE")) {
        actions.push({
          label: "Xóa",
          icon: <DeleteIcon fontSize="small" />,
          color: "error.main", 
          onClick: (item) => {
            setConfirmModal({
              isOpen: true,
              title: "Xác nhận xóa tài khoản",
              message: `Bạn có chắc chắn muốn xóa tài khoản của "${item.name}" không?`,
              onConfirm: async () => {
                try {
                  await axiosClient.patch(`/users/${item.id}/soft-delete`);
                  const keyword = searchParams.get("keyword") || "";
                  const role = searchParams.get("roleId") || "";
                  const status = searchParams.get("status") || "all";
                  let page = parseInt(searchParams.get("page")) || 1;
                  if (users.length === 1 && page > 1) {
                    page -= 1;
                    const params = new URLSearchParams(searchParams);
                    params.set("page", page.toString());
                    setSearchParams(params);
                    setFilters((prev) => ({ ...prev, page: page }));
                  }
                  fetchUsers(page, keyword, status, role);
                  closeConfirmModal();
                  setModal({
                    isOpen: true,
                    title: "Thành công",
                    message: "Xóa tài khoản thành công",
                    type: "success",
                  });
                } catch (error) {
                  closeConfirmModal();
                  setModal({
                    isOpen: true,
                    title: "Xóa tài khoản.",
                    message: "Xóa tài khoản thất bại: " + error?.message,
                    type: "error",
                  });
                  console.log("Khôi phục thất bại: ", error.message);
                  console.log("Xóa thất bại: ", error.message);
                }
              },
            });
          },
        });
      }
    } else {
      if (can("USER:RESTORE")) {
        actions.push({
          label: "Khôi phục",
          icon: <RestoreIcon fontSize="small" />,
          onClick: (item) => {
            setConfirmModal({
              isOpen: true,
              title: "Xác nhận khôi phục tài khoản",
              message: `Bạn có chắc chắn muốn khôi phục tài khoản của "${item.name}" không?`,
              onConfirm: async () => {
                try {
                  await axiosClient.patch(`/users/${item.id}/restore`);
                  const keyword = searchParams.get("keyword") || "";
                  const role = searchParams.get("roleId") || "";
                  const status = searchParams.get("status") || "all";
                  let page = parseInt(searchParams.get("page")) || 1;
                  if (users.length === 1 && page > 1) {
                    page -= 1;
                    const params = new URLSearchParams(searchParams);
                    params.set("page", page.toString());
                    setSearchParams(params);
                    setFilters((prev) => ({ ...prev, page: page }));
                  }
                  fetchUsers(page, keyword, status, role);
                  closeConfirmModal();
                  setModal({
                    isOpen: true,
                    title: "Thành công",
                    message: "Khôi phục tài khoản thành công",
                    type: "success",
                  });
                } catch (error) {
                  closeConfirmModal();
                  setModal({
                    isOpen: true,
                    title: "Khôi phục tài khoản.",
                    message: "Khôi phục tài khoản thất bại: " + error?.message,
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
  useEffect(() => {
    setTitle("Quản lý tài khoản");
  }, []);
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
            Danh sách tài khoản
          </h2>
          <p className="mt-1.5 text-xs text-[#6b7280] dark:text-[#a1aebf] font-medium max-w-2xl">
            Quản lý thông tin chi tiết, phân quyền và trạng thái hoạt động của tất cả người dùng trong hệ thống.
          </p>
        </div>
        {can("USER:CREATE") && (
          <button
            onClick={() => {
              navigate("/admin/add-user");
            }}
            className="whitespace-nowrap md:px-5 md:py-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#46ec13] px-5 py-2.5 text-sm font-bold text-black shadow-sm hover:bg-[#3ad60f] focus:outline-none focus:ring-2 focus:ring-[#46ec13] focus:ring-offset-2 dark:focus:ring-offset-[#142210] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>{" "}
            Thêm mới tài khoản
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] p-5 mb-6">
        <div className="flex flex-col gap-4">
          {/* Dòng 1: Tìm kiếm, Làm mới, Nút Tìm kiếm */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="relative md:col-span-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-[20px] text-[#6b7280] dark:text-[#a1aebf]">
                  search
                </span>
              </div>
              <input
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 pl-10 pr-3 text-sm placeholder:text-[#6b7280] dark:placeholder:text-[#a1aebf] focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none"
                placeholder="Nhập tên, email hoặc SĐT..."
                value={filters.keyword}
                type="text"
                onChange={(e) => {
                  handleFilterChange("keyword", e.target.value);
                }}
              />
            </div>
            <div className="flex gap-2 md:col-span-6">
              <button
                onClick={() => {
                  setFilters({
                    keyword: "",
                    status: "all",
                    roleId: "",
                    page: 1,
                  });
                  setSearchParams({});
                }}
                className="flex flex-1 items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-[#2a4225] dark:hover:bg-[#36532f] text-gray-700 dark:text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all outline-none whitespace-nowrap shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">
                  restart_alt
                </span>
                Làm mới
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#46ec13] hover:bg-[#3ad60f] text-black font-bold py-2.5 px-6 rounded-lg text-sm transition-all active:scale-95 whitespace-nowrap shadow-sm shadow-[#46ec13]/20"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Dòng 2: Hai cái dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-[#6b7280] dark:text-[#a1aebf]">
                  filter_list
                </span>
              </div>
              <select
                value={filters.roleId}
                onChange={(e) => {
                  handleFilterChange("roleId", e.target.value);
                }}
                className="pl-10 block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer"
              >
                <option value="">Tất cả vai trò</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.status || "all"}
                onChange={(e) => {
                  handleFilterChange("status", e.target.value);
                }}
                className="block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-2 focus:ring-[#46ec13]/20 dark:text-white transition-all outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="blocked">Bị khóa</option>
                <option value="unverified">Chưa xác thực</option>
                <option value="deleted">Đã xóa</option>
              </select>
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
                  User
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Số điện thoại
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Địa chỉ
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Role
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
              {isLoadingUsers ? (
                <TableSkeleton rows={5} columns={7}></TableSkeleton>
              ) : (
                users?.map((user) => {
                  return (
                    <tr
                      key={user?.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="font-[500] px-6 py-4 whitespace-nowrap text-sm text-black dark:text-[#a1aebf]">
                        <div
                          className="line-clamp-2 font-medium"
                          title={user?.id}
                        >
                          {user?.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              alt="Jane Cooper"
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                user?.avatar?.url ||
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuBcw8KMoGbROEOgguVoH4b2SgTpWKpbP3raacQwODFSN_-DHBWY3L9v3QAQnZ_b7fOCn-WtmAiW1Ex_vLGXSs1SfdQTtg57pXVuIMD21wmaL-8vpYDCmNOtmj107fHj6UPor8y0rjwg8OGRCY0xF4xOvdY_yXhzVjU6qaPLtP6QUmblmNhdl23NWynXqWRL4zZVVb57gPdan6US-6ewZhfwdwSUoqFwGzN7i7e7xvNvVj5ApiZQRF3HSGdQM-KGvLBHkXjhugJEFXGw"
                              }
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-[#111b0d] dark:text-white">
                              {user?.name}
                            </div>
                            <div className="text-sm text-[#6b7280] dark:text-[#a1aebf]">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="font-[400] px-6 py-4 whitespace-nowrap text-sm text-black dark:text-[#a1aebf]">
                        {user?.phone}
                      </td>
                      <td className="font-[400] px-6 py-4 whitespace-nowrap text-sm text-black dark:text-[#a1aebf]">
                        {user?.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {iconMap[user?.role?.name]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UserStatusBadge status={user?.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionMenu actions={menuActions(user)} data={user} />
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
      <UserDetailModal
        isOpen={isUserDetailModalOpen}
        onClose={handleCloseUserDetailModal}
        userData={selectedUser}
      ></UserDetailModal>
    </>
  );
}
export default UserList;
