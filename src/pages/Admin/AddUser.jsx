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
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Thêm tài khoản",
        message: "Tạo tài khoản thất bại: " + error.message,
        type: "error",
      });
      console.error("Tạo user thất bại:", error.message);
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
      <main className="flex-1 p-6 lg:p-10 max-w-[1000px] mx-auto w-full">
        {/* Tiêu đề */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Thêm mới tài khoản
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Tạo tài khoản người dùng mới vào hệ thống.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-[#1a2c15] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 lg:p-10"
        >
          <div className="flex flex-col gap-8">
            {/* Section 1: Thông tin cá nhân */}
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Họ và tên:
                  </label>
                  <input
                    {...register("name")}
                    className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.name ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    placeholder="Nhập họ và tên..."
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Số điện thoại:
                  </label>
                  <input
                    {...register("phone")}
                    className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.phone ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    placeholder="Nhập số điện thoại..."
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.phone.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Email:
                  </label>
                  <input
                    {...register("email")}
                    className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    placeholder="Nhập địa chỉ email..."
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.email.message}
                    </span>
                  )}
                </div>
                {/* Địa chỉ */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Địa chỉ:
                  </label>
                  <input
                    {...register("address")}
                    className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.address ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    placeholder="Nhập địa chỉ..."
                  />
                  {errors.address && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.address.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Ngày sinh:
                  </label>
                  <input
                    {...register("dob")}
                    className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.dob ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    type="date"
                  />
                  {errors.dob && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.dob.message}
                    </span>
                  )}
                </div>
                {/* Role */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Role:
                  </label>
                  <div className="relative">
                    <select
                      {...register("roleId")}
                      className="focus:shadow-xl w-full h-12 px-6 pr-12 rounded-full 
           bg-slate-50 dark:bg-white/5 
           border border-transparent 
           focus:bg-white dark:focus:bg-black/20 
           text-slate-900 dark:text-white 
           appearance-none cursor-pointer outline-none transition-all"
                    >
                      <option value={""}>Chọn vai trò</option>
                      {roles?.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.roleId && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.roleId.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Bảo mật */}
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Bảo mật
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      {...register("password")}
                      className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.password ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPwd ? "visibility_off" : "visibility"}
                      </span>{" "}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      {...register("confirmPassword")}
                      className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.confirmPassword ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showConfirmPwd ? "visibility_off" : "visibility"}
                      </span>{" "}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse md:flex-row justify-end items-center gap-4 mt-12 pt-6 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full md:w-auto px-8 h-12 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full md:w-auto px-8 h-12 rounded-full bg-[#46ec13] text-slate-900 font-bold hover:brightness-110 flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined">check</span>
              Create User
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
export default AddUser;
