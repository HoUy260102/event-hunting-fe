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
function UserList() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([
    {
      id: "USR-2024-001",
      name: "Nguyễn Văn Admin",
      email: "admin.test@gmail.com",
      phone: "0987.654.321",
      address: "123 Đường Lê Lợi, TP. Huế",
      role: "ADMIN",
      avatar:
        "https://ui-avatars.com/api/?name=Admin&background=46ec13&color=111b0d",
      firstName: "Admin",
      lastName: "Nguyễn Văn",
      language: "Tiếng Việt (VN)",
      bio: "Đây là tài khoản quản trị viên dùng để kiểm tra giao diện Modal chi tiết người dùng.",
      department: "Quản trị hệ thống",
      reportsTo: "CEO Office",
      createdAt: "20/01/2024 08:30",
      updatedAt: "22/01/2026 10:30",
      createdBy: "SYS-AUTO",
      updatedBy: "SYS-AUTO",
      deletedAt: null,
    },
  ]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
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
    if (can()) {
      actions.push({
        label: "Xem chi tiết",
        icon: <VisibilityIcon fontSize="small" />,
        onClick: (item) => handleOpenUserDetailModal(item),
      });
    }
    if (can()) {
      actions.push({
        label: "Sửa",
        icon: <EditIcon fontSize="small" />,
        onClick: (item) => {
          navigate(`/admin/update-user/${item.id}`);
        },
      });
    }
    if (user.deletedAt === null) {
      if (can()) {
        actions.push({
          label: "Xóa",
          icon: <DeleteIcon fontSize="small" />,
          color: "error.main", // Màu đỏ cho nút xóa
          onClick: (item) => {
            setConfirmModal({
              isOpen: true,
              title: "Xác nhận xóa tài khoản",
              message: "Bạn có chắc sẽ xóa tài khoản có id: " + item.id,
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
                } catch (error) {
                  console.log("Xóa thất bại: ", error.message);
                }
              },
            });
          },
        });
      }
    } else {
      if (can()) {
        actions.push({
          label: "Khôi phục",
          icon: <RestoreIcon fontSize="small" />,
          onClick: (item) => {
            setConfirmModal({
              isOpen: true,
              title: "Xác nhận khôi phục tài khoản",
              message: "Bạn có chắc sẽ khôi phục tài khoản có id: " + item.id,
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
        <div>
          <h2 className="text-2xl min-[480px]:text-3xl font-extrabold text-[#111b0d] dark:text-white tracking-tight">
            Quản lý tài khoản
          </h2>
          <p className="mt-1 text-sm text-[#6b7280] dark:text-[#a1aebf]"></p>
        </div>
        <button
          onClick={() => {
            navigate("/admin/add-user");
          }}
          className="whitespace-nowrap md:px-5 md:py-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#46ec13] px-5 py-2.5 text-sm font-bold text-black shadow-sm hover:bg-[#3ad60f] focus:outline-none focus:ring-2 focus:ring-[#46ec13] focus:ring-offset-2 dark:focus:ring-offset-[#142210] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>{" "}
          Thêm mới tài khoản
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
            <div className="relative w-full md:w-full">
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
                className="pl-10 block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white"
              >
                <option value="">All Roles</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filters.status || "all"}
              onChange={(e) => {
                handleFilterChange("status", e.target.value);
              }}
              className="block w-full md:w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm focus:border-[#46ec13] focus:ring-[#46ec13] dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Hoạt động</option>
              <option value="deleted">Đã xóa</option>
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
                {/* <th
                  className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                  scope="col"
                >
                  Last Login
                </th> */}
                <th className="relative px-6 py-3" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a4225] bg-white dark:bg-[#1c2e18]">
              {users?.map((user) => {
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
                      {user?.deletedAt === null ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-300 border border-transparent dark:border-green-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>{" "}
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-300 border border-transparent dark:border-red-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>{" "}
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu actions={menuActions(user)} data={user} />
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
      <UserDetailModal
        isOpen={isUserDetailModalOpen}
        onClose={handleCloseUserDetailModal}
        userData={selectedUser}
      ></UserDetailModal>
    </>
  );
}
export default UserList;
