import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Modal from "../../components/common/Modal";

const schema = z.object({
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
  fileId: z.string().optional(),
  roleId: z.string().min(1, "Vui lòng chọn vai trò"),
  status: z.string().min(1, "Vui lòng chọn trạng thái"),
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
});

function UpdateUser() {
  const { id } = useParams();
  const [user, setUser] = useState();
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const [roles, setRoles] = useState([]);
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await axiosClient.put(`/users/${id}`, data);
      const updatedUser = response?.data; // Vì response là ApiResponse, dữ liệu thực tế nằm ở .data!
      reset({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        address: updatedUser?.address || "",
        roleId: updatedUser?.role?.id ? String(updatedUser?.role?.id) : "",
        fileId: updatedUser?.avatar?.id ? String(updatedUser?.avatar?.id) : "",
        phone: updatedUser?.phone || "",
        status: updatedUser?.status || "",
        dob: updatedUser?.dob ? updatedUser?.dob.split("T")[0] : "",
      });
      setUser(updatedUser);
      setPreviewImage(updatedUser?.avatar?.url);
      setModal({
        isOpen: true,
        title: "Cập nhật tài khoản",
        message: "Cập nhật tài khoản thành công",
        type: "success",
      });
      console.log(response);
    } catch (error) {
      console.error("Cập nhật user thất bại:", error);
      
      // Vì axiosClient interceptor đã trả về error.response?.data trực tiếp trong Promise.reject,
      // nên chúng ta đọc trực tiếp từ `error.details` và `error.message`!
      if (error && error.details) {
        const fieldErrors = error.details;
        Object.keys(fieldErrors).forEach((field) => {
          setError(field, {
            type: "server",
            message: fieldErrors[field],
          });
        });
        
        setModal({
          isOpen: true,
          title: "Cập nhật tài khoản",
          message: "Vui lòng kiểm tra lại các thông tin lỗi được hiển thị trên form.",
          type: "error",
        });
      } else {
        // Lỗi chung khác
        setModal({
          isOpen: true,
          title: "Cập nhật tài khoản",
          message: error?.message || "Cập nhật tài khoản thất bại!",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, userRes] = await Promise.all([
          axiosClient.get("/roles/select"),
          axiosClient.get(`/users/${id}`),
        ]);
        setRoles(rolesRes.data); // Vì axiosClient.interceptors.response chỉ bóc tách 1 lớp response.data từ Axios, data thực tế nằm ở .data!
        const userData = userRes.data; // Vì axiosClient.interceptors.response chỉ bóc tách 1 lớp response.data từ Axios, data thực tế nằm ở .data!
        setUser(userData);
        setPreviewImage(userData?.avatar?.url);
        reset({
          name: userData?.name || "",
          email: userData?.email || "",
          address: userData?.address || "",
          roleId: userData?.role?.id ? String(userData.role?.id) : "",
          status: userData?.status,
          phone: userData?.phone || "",
          dob: userData?.dob ? userData.dob.split("T")[0] : "",
          fileId: userData?.avatar?.id ? String(userData?.avatar?.id) : "",
        });
      } catch (error) {
        console.error("Lấy dữ liệu thất bại:", error.message || error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, reset]);

  const handleImageChange = async (e) => {
    if (isLoading) return;
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "IMAGE");
      formData.append("folder", "USER_AVATAR");

      try {
        setIsLoading(true);
        const response = await axiosClient.post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const fileData = response.data; // Vì response là ApiResponse, dữ liệu thực tế nằm ở .data!
        console.log(fileData);
        console.log("Upload thành công, ID file là:", fileData.id);
        setPreviewImage(fileData?.url);
        setValue("fileId", fileData.id, { shouldValidate: true });
      } catch (error) {
        console.error("Lỗi upload rồi ơi:", error);
        alert("Lỗi:", error.message || error);
      } finally {
        setIsLoading(false);
        e.target.value = "";
      }
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
      <main className="flex-1 p-6 lg:p-10 max-w-[1000px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header giống hệt ảnh mẫu */}
        <div className="bg-white dark:bg-[#1a2c15] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Cập nhật tài khoản
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

              {/* Avatar upload */}
              <div className="flex flex-col gap-2 items-center md:items-start mb-4">
                <label className="text-[13px] font-bold text-slate-600 ml-1">
                  Ảnh đại diện
                </label>
                <div className="relative group">
                  <div
                    className={`w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-md bg-slate-100 flex items-center justify-center transition-all ${
                      isLoading ? "animate-pulse brightness-75" : ""
                    }`}
                  >
                    <img
                      src={
                        previewImage ||
                        user?.avatar?.url ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-white ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined text-white text-sm select-none">
                      photo_camera
                    </span>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isLoading}
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
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
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${
                        errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
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
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${
                        errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
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
                    Email <span className="text-slate-400 font-normal">(Không thể thay đổi)</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("email")}
                      disabled
                      className="w-full h-11 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed outline-none text-sm"
                      placeholder="Nhập địa chỉ email..."
                    />
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Địa chỉ
                  </label>
                  <div className="relative">
                    <input
                      {...register("address")}
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${
                        errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
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
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm hover:border-slate-300 ${
                        errors.dob ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
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
                      defaultValue={user?.role?.id}
                      {...register("roleId")}
                      className={`w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm appearance-none cursor-pointer hover:border-slate-300 ${
                        errors.roleId ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                      }`}
                    >
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

                {/* Trạng thái */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Trạng thái tài khoản <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      defaultValue={user?.status}
                      {...register("status")}
                      className={`w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm appearance-none cursor-pointer hover:border-slate-300 ${
                        errors.status ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                      }`}
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="ACTIVE">Hoạt động (Active)</option>
                      <option value="INACTIVE">Không hoạt động (Inactive)</option>
                      <option value="BLOCKED">Bị khóa (Blocked)</option>
                      <option value="DELETED">Đã xóa (Deleted)</option>
                      <option value="UNVERIFIED">Chưa xác thực (Unverified)</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">
                      keyboard_arrow_down
                    </span>
                  </div>
                  {errors.status && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.status.message}
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
              onClick={() => {
                if (user) {
                  reset({
                    name: user.name || "",
                    email: user.email || "",
                    address: user.address || "",
                    roleId: user.role?.id ? String(user.role.id) : "",
                    status: user?.status,
                    phone: user.phone || "",
                    dob: user.dob ? user.dob.split("T")[0] : "",
                    fileId: user.avatar?.id ? String(user.avatar.id) : "",
                  });
                  setPreviewImage(user.avatar?.url || null);
                }
              }}
              className="w-full md:w-auto px-6 h-11 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95 outline-none"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full md:w-auto px-6 h-11 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 outline-none ${
                isLoading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">check</span>
              Cập nhật tài khoản
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default UpdateUser;
