import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProfileSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: "Cài đặt tài khoản",
      icon: "settings",
      subItems: [
        { label: "Thông tin tài khoản", path: "/user/profile" },
        { label: "Đổi mật khẩu", path: "/user/change-password" },
      ],
    },
    {
      title: "Đơn hàng của tôi",
      icon: "confirmation_number",
      path: "/my-tickets",
    },
    {
      title: "Lịch của tôi",
      icon: "calendar_month",
      path: "/my-calendar",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* User Info Header */}
      <div className="flex items-center gap-4 p-4 bg-[#131313] rounded-3xl border border-slate-800 shadow-sm">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#46ec13] p-0.5 bg-[#131313]">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img
              src={user?.avatarUrl || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Tài khoản của</span>
          <span className="text-base font-bold text-white truncate">
            {user?.name || user?.username || "Người dùng"}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-2 px-2">
        {menuItems.map((item, index) => (
          <div key={index} className="flex flex-col">
            {item.path ? (
              <Link
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${location.pathname === item.path
                  ? "bg-green-500/80 text-black font-bold shadow-lg shadow-green-500/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${location.pathname === item.path ? "text-black" : "text-slate-500 group-hover:text-white"}`}>
                  {item.icon}
                </span>
                <span className="text-[14.5px]">{item.title}</span>
              </Link>
            ) : (
              <div className="flex flex-col gap-1.5 mb-2">
                <div className="flex items-center gap-3.5 px-4 py-3 text-slate-400 select-none">
                  <span className="material-symbols-outlined text-[22px] text-slate-500">
                    {item.icon}
                  </span>
                  <span className="text-[14.5px] font-bold text-slate-300">{item.title}</span>
                </div>
                <div className="flex flex-col ml-[46px] gap-1">
                  {item.subItems.map((sub, subIndex) => (
                    <Link
                      key={subIndex}
                      to={sub.path}
                      className={`text-[14px] py-2 px-2 rounded-lg transition-all duration-200 ${location.pathname === sub.path
                        ? "text-[#46ec13] font-bold bg-[#46ec13]/5"
                        : "text-slate-500 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar;
