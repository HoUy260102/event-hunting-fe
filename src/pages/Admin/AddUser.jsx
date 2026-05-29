import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosClient from "../../api/axiosClient";
import Modal from "../../components/common/Modal";
import { useHeader } from "../../hooks/useHeader";

const schema = z
  .object({
    name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    phone: z
      .string()
      .regex(
        /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        "Số điện thoại không đúng định dạng VN",
      )
      .nonempty("Số điện thoại là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    address: z.preprocess((val) => {
      if (typeof val !== "string" || val.trim() === "") {
        return undefined;
      }
      return val.trim();
    }, z.string().min(1, "Nếu nhập thì phải có ít nhất 1 ký tự").optional()),
    dob: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z
        .string()
        .refine(
          (date) => {
            if (!date) return true;
            const selectedDate = new Date(date);
            const now = new Date();
            return selectedDate < now;
          },
          { message: "Ngày sinh không thể ở tương lai!" },
        )
        .optional(),
    ),
    password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
    roleId: z.string().min(1, "Vui lòng chọn vai trò"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmPassword.length > 0, {
    message: "Vui lòng nhập lại xác nhận mật khẩu",
    path: ["confirmPassword"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

function AddUser() {
  const { setTitle } = useHeader();
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [roles, setRoles] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      console.log("Dữ liệu submit:", data);
      const response = await axiosClient.post("/users", data);
      setModal({
        isOpen: true,
        title: "Thêm tài khoản",
        message: "Tạo tài khoản thành công",
        type: "success",
      });
      console.log(response.data);
      reset();
    } catch (error) {
      console.error("Tạo user thất bại:", error);

      // Nếu BE trả về lỗi validation có chi tiết cụ thể
      if (error.response?.data?.details) {
        const fieldErrors = error.response.data.details;
        Object.keys(fieldErrors).forEach((field) => {
          setError(field, {
            type: "server",
            message: fieldErrors[field],
          });
        });

        setModal({
          isOpen: true,
          title: "Thêm tài khoản",
          message: "Vui lòng kiểm tra lại các thông tin lỗi được hiển thị trên form.",
          type: "error",
        });
      } else {
        // Lỗi chung khác
        setModal({
          isOpen: true,
          title: "Thêm tài khoản",
          message: error.response?.data?.message || "Tạo tài khoản thất bại: " + error.message,
          type: "error",
        });
      }
    }
  };

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

  useEffect(() => {
    setTitle("Quản lý tài khoản");
  }, []);

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
      <main className="flex-1 p-6 lg:p-10 max-w-[1000px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header giống hệt ảnh mẫu */}
        <div className="bg-white dark:bg-[#1a2c15] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Thêm mới tài khoản
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý thông tin chi tiết, phân quyền và trạng thái hoạt động của tất cả người dùng trong hệ thống.
          </p>
        </div>

        {/* Form chính */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 lg:p-10 transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex flex-col gap-10">
            {/* Section 1: Thông tin cá nhân */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-emerald-500 text-2xl">
                  badge
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  Thông tin cá nhân
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("name")}
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                      placeholder="Nhập họ và tên..."
                    />
                  </div>
                  {errors.name && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("phone")}
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                      placeholder="Nhập số điện thoại..."
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.phone.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("email")}
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                      placeholder="Nhập địa chỉ email..."
                    />
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Địa chỉ */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Địa chỉ
                  </label>
                  <div className="relative">
                    <input
                      {...register("address")}
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                      placeholder="Nhập địa chỉ..."
                    />
                  </div>
                  {errors.address && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.address.message}
                    </span>
                  )}
                </div>

                {/* Ngày sinh */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Ngày sinh
                  </label>
                  <div className="relative">
                    <input
                      {...register("dob")}
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm hover:border-slate-300 ${errors.dob ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                      type="date"
                    />
                  </div>
                  {errors.dob && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.dob.message}
                    </span>
                  )}
                </div>

                {/* Role (Vai trò) */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("roleId")}
                      className={`w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm appearance-none cursor-pointer hover:border-slate-300 ${errors.roleId ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                    >
                      <option value="">Chọn vai trò</option>
                      {roles?.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
                      keyboard_arrow_down
                    </span>
                  </div>
                  {errors.roleId && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.roleId.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Bảo mật */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-emerald-500 text-2xl">
                  lock
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  Bảo mật tài khoản
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      {...register("password")}
                      className={`w-full h-11 pl-4 pr-11 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                      placeholder="Tối thiểu 6 ký tự..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] select-none">
                        {showPwd ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      {...register("confirmPassword")}
                      className={`w-full h-11 pl-4 pr-11 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                        }`}
                      placeholder="Nhập lại mật khẩu..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] select-none">
                        {showConfirmPwd ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse md:flex-row justify-end items-center gap-3 mt-12 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full md:w-auto px-6 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95 outline-none"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="w-full md:w-auto px-6 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 outline-none"
            >
              <span className="material-symbols-outlined text-lg">check</span>
              Tạo tài khoản
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default AddUser;
