import React, { useState } from "react";
import { useHeader } from "../../../hooks/useHeader";
import { useAuth } from "../../../hooks/useAuth";
import ActionMenu from "../../common/ActionMenu";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import axiosClient from "../../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../modals/ConfirmModal";

const Header = () => {
  const { title } = useHeader();
  const { user, logout } = useAuth();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      logout();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      navigate("/login", { replace: true });
    }
  };

  const actions = [
    {
      label: "Chỉnh sửa thông tin",
      icon: <AccountCircle fontSize="small" />,
      onClick: () => {},
    },
    {
      label: "Đăng xuất",
      color: "red",
      icon: <LogoutIcon fontSize="small" />,
      onClick: () => {
        setConfirmModal({
          title: "Xác nhận đăng xuất",
          message: "Bạn chắc chắn muốn thoát khỏi ứng dụng!",
          isOpen: true,
          onConfirm: handleLogout,
        });
      },
    },
  ];

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal?.isOpen}
        title={confirmModal?.title}
        message={confirmModal?.message}
        onConfirm={confirmModal?.onConfirm}
        onClose={() => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
      ></ConfirmModal>
      <header className="h-16 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-charcoal">{title}</h2>
          <div className="h-4 w-[1px] bg-light-divider mx-2"></div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 rounded-full border border-gray-200 p-0.5 flex items-center justify-center bg-white shadow-sm cursor-pointer hover:border-primary transition-colors">
              <img
                src={user?.avatarUrl || "https://via.placeholder.com/40"} // Thêm ảnh tạm nếu ko có avatar
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-charcoal leading-none">
                {user?.name}
              </p>
              <p className="text-[10px] text-medium-gray mt-1">{user?.email}</p>
            </div>
          </div>
          <ActionMenu actions={actions} data={user}></ActionMenu>
        </div>
      </header>
    </>
  );
};

export default Header;
