import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Modal from "../../components/common/Modal";

function RoleAssignment() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [nextId, setNextId] = useState();
  const [hasMore, setHasNext] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const fetchPermission = async (keyword, nextId, size = 5) => {
    try {
      const response = await axiosClient.get("/permissions", {
        params: {
          keyword: keyword.trim(),
          nextId: nextId,
          size: size,
        },
      });
      setPermissions(response.data?.content);
      setNextId(response.data?.nextId);
      setHasNext(response.data?.hasNext);
    } catch (error) {
      console.error("Lỗi lấy danh sách role:", error.message);
    }
  };

  const handleOnsearch = () => {
    setNextId(null);
    fetchPermission(keyword, null, 5);
  };

  useEffect(() => {
    fetchPermission(keyword, nextId, 5);
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosClient.get("/roles/select");
        setRoles(response.data);
        if (response.data?.length >= 1) {
          setSelectedRole(response.data[0].id);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách role:", error.message);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (!selectedRole) {
      setSelectedPermissions([]);
      return;
    }

    const fetchRolePermissions = async () => {
      try {
        const response = await axiosClient.get(
          `/roles/${selectedRole}/permissions`,
        );
        const currentPerms = response.data?.map((p) => p.id) || [];
        setOriginalPermissions(currentPerms)
        setSelectedPermissions(currentPerms);
      } catch (error) {
        if (error.code === "PERMISSION_NOT_FOUND") {
          setSelectedPermissions([]);
        }
        console.error("Lỗi lấy quyền của role:", error);
      }
    };
    fetchRolePermissions();
  }, [selectedRole]);

  const handleCheckboxChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const isAllSelected = permissions.length > 0 && permissions.every((per) => selectedPermissions.includes(per.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Bỏ chọn tất cả các quyền đang hiển thị
      const visibleIds = permissions.map((p) => p.id);
      setSelectedPermissions((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Chọn tất cả các quyền đang hiển thị
      const visibleIds = permissions.map((p) => p.id);
      setSelectedPermissions((prev) => {
        const newSelection = [...prev];
        visibleIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const fetchMorePermissions = async () => {
    if (isLoading) return;
    if (!hasMore || !nextId) return;
    try {
      setIsLoading(true);
      const response = await axiosClient.get("/permissions", {
        params: { keyword: keyword, nextId: nextId, size: 5 },
      });

      setPermissions((prev) => [...prev, ...(response.data?.content || [])]);
      setNextId(response.data?.nextId);
      setHasNext(response.data?.hasNext);
    } catch (error) {
      console.error("Lỗi tải thêm quyền:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      fetchMorePermissions();
    }
  };

  const handleSavePermissions = async () => {
    try {
      await axiosClient.put(`/roles/${selectedRole}/permissions`, selectedPermissions);
      setOriginalPermissions(selectedPermissions)
      setModal({
        isOpen: true,
        title: "Cập nhật quyền cho role",
        message: "Cập nhật thành công",
        type: "success",
      });
    } catch (error) {
      console.error("Lỗi cập nhật quyền:", error);
      setModal({
        isOpen: true,
        title: "Cập nhật quyền cho role",
        message: "Cập nhật thất bại",
        type: "error",
      });
    }
  };

  return (
    <>
      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
          type={modal.type}
        />
      )}
      <main className="flex-1 p-6 lg:p-10 max-w-[1000px] mx-auto w-full">
        {/* Tiêu đề */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Phân quyền hệ thống{" "}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Thiết lập các chức năng mà vai trò này được phép thực hiện trong hệ
            thống.
          </p>
        </div>
        <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] p-4 mb-6">
          <div className="flex gap-15 w-full">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Chọn vai trò cần chỉnh sửa:
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    filter_list
                  </span>
                </div>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-[#e5e7eb] dark:border-[#2a4225] bg-[#f6f8f6]/50 dark:bg-[#142210]/50 py-2.5 px-3 text-sm  focus:outline-none focus:ring-1 dark:text-white transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    -- Chọn vai trò --
                  </option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {" "}
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Tìm kiếm
              </label>
              <div className="flex gap-2 items-center w-full">
                {" "}
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                      search
                    </span>
                  </div>
                  <input
                    className="block w-full rounded-xl border border-[#e5e7eb] dark:border-[#2a4225] bg-white dark:bg-[#142210]/50 py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                    placeholder="Nhập từ khóa..."
                    value={keyword}
                    type="text"
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleOnsearch}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all active:scale-95 whitespace-nowrap shadow-md shadow-emerald-400/10 hover:shadow-emerald-400/20 cursor-pointer"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1c2e18] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a4225] overflow-hidden">
          <div
            className="overflow-x-auto overflow-y-auto max-h-[300px]"
            onScroll={handleScroll}
          >
            <table className="min-w-full divide-y divide-[#e5e7eb] dark:divide-[#2a4225]">
              <thead className="bg-gray-50 dark:bg-black/20 w-full sticky top-0 z-20">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                    scope="col"
                  >
                    Module
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
                    Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-bold text-[#6b7280] dark:text-[#a1aebf] uppercase tracking-wider"
                    scope="col"
                  >
                    <div className="flex items-center gap-2">
                      <span>Chọn</span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer bg-white dark:bg-[#142210]"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        disabled={!selectedRole || permissions.length === 0}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a4225] bg-white dark:bg-[#1c2e18]">
                {permissions?.map((per) => {
                  return (
                    <tr
                      key={per?.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="font-[500] px-6 py-4 whitespace-nowrap text-sm text-black dark:text-[#a1aebf]">
                        {per?.module}
                      </td>

                      <td className="font-[400] px-6 py-4 whitespace-nowrap text-sm text-black dark:text-[#a1aebf]">
                        {per?.code}
                      </td>
                      <td className="font-[400] px-6 py-4 whitespace-nowrap text-sm text-black dark:text-[#a1aebf]">
                        {per?.name}
                      </td>
                      <td className="px-6 py-4">
                        {" "}
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          checked={selectedPermissions.includes(per.id)}
                          onChange={() => handleCheckboxChange(per.id)}
                          disabled={!selectedRole}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {hasMore && (
              <div className="p-4 text-center text-sm text-slate-500">
                Đang tải thêm...
              </div>
            )}
          </div>
          <div className="flex gap-5 justify-end mt-5 py-2.5 px-2.5">
            <div className="flex gap-3">
              <button onClick={() => {
                setSelectedPermissions(originalPermissions);
              }} className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl text-sm transition-all active:scale-95 whitespace-nowrap">
                Hủy bỏ
              </button>

              <button onClick={handleSavePermissions} className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all active:scale-95 whitespace-nowrap shadow-md shadow-emerald-400/10 hover:shadow-emerald-400/20 cursor-pointer">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
export default RoleAssignment;
