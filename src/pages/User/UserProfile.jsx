import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../hooks/useAuth";
import ProfileSidebar from "./ProfileSidebar";

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

function UserProfile() {
  const { user, refreshUser } = useAuth();
  const id = user?.id;
  const [userInfo, setUserInfo] = useState();
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await axiosClient.put(`users/profile`, data);
      reset({
        name: response?.data?.name || "",
        email: response?.data?.email || "",
        address: response?.data?.address || "",
        fileId: response?.data?.avatar?.id
          ? String(response.data?.avatar?.id)
          : "",
        phone: response?.data?.phone || "",
        dob: response?.data?.dob ? response?.data?.dob.split("T")[0] : "",
      });
      setUserInfo(response.data);
      setPreviewImage(response?.data?.avatar?.url);
      setModal({
        isOpen: true,
        title: "Cập nhật tài khoản",
        message: "Cập nhật tài khoản thành công",
        type: "success",
      });
      await refreshUser();
      console.log(response.data);
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Cập nhật tài khoản",
        message: "Cập nhật tài khoản thất bại: " + error.message,
        type: "error",
      });
      console.error("Tạo user thất bại:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userRes] = await Promise.all([
          axiosClient.get(`/users/${id}`),
        ]);
        const userData = userRes.data;
        if (ignore) return;
        setUserInfo(userData);
        setPreviewImage(userData?.avatar?.url);
        reset({
          name: userData?.name || "",
          email: userData?.email || "",
          address: userData?.address || "",
          phone: userData?.phone || "",
          dob: userData?.dob ? userData.dob.split("T")[0] : "",
          fileId: userData?.avatar?.id ? String(userData?.avatar?.id) : "",
        });
      } catch (error) {
        console.error("Lấy dữ liệu thất bại:", error.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
    return () => { ignore = true; };
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
        const fileData = response.data;
        console.log(fileData);
        console.log("Upload thành công, ID file là:", fileData.id);
        setPreviewImage(fileData?.url);
        setValue("fileId", fileData.id, { shouldValidate: true });
      } catch (error) {
        console.error("Lỗi upload rồi ơi:", error);
        alert("Lỗi:", error.message);
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

      <div className="w-full px-2 py-4 lg:px-6 lg:py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <ProfileSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Tiêu đề */}
          <div className="mb-8 border-b border-[#474848]/20 pb-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Thông tin tài khoản
            </h3>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-[#131313] rounded-[2rem] shadow-sm border border-slate-800 p-6 lg:p-10"
          >
            <div className="flex flex-col gap-8">
              {/* Section 1: Thông tin cá nhân */}
              <div className="flex flex-col gap-5">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
                  Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Avatar Upload */}
                  <div className="flex flex-col gap-2 md:col-span-2 w-fit mb-3">
                    <label className="text-sm font-semibold text-white ml-3">
                      Ảnh đại diện:
                    </label>
                    <div className="relative group">
                      <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-200 ${isLoading ? 'animate-pulse' : ''}`}>
                        <img
                          src={
                            previewImage ||
                            userInfo?.avatar?.url ||
                            "https://via.placeholder.com/150"
                          }
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <label
                        htmlFor="avatar-upload"
                        className={`${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''} absolute bottom-0 right-0 bg-[#46ec13] p-2 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-900`}
                      >
                        <span className="material-symbols-outlined text-slate-900 text-sm">
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

                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white ml-3">
                      Họ và tên:
                    </label>
                    <input
                      {...register("name")}
                      className={`w-full h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.name ? "border-red-500 ring-1 ring-red-500" : ""}`}
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
                    <label className="text-sm font-semibold text-white ml-3">
                      Số điện thoại:
                    </label>
                    <input
                      {...register("phone")}
                      className={`w-full h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.phone ? "border-red-500 ring-1 ring-red-500" : ""}`}
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
                    <label className="text-sm font-semibold text-white ml-3">
                      Email:
                    </label>
                    <input
                      {...register("email")}
                      disabled
                      className={`w-full h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
                      placeholder="Nhập địa chỉ email..."
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs ml-4">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold text-white ml-3">
                      Địa chỉ:
                    </label>
                    <input
                      {...register("address")}
                      className={`w-full h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.address ? "border-red-500 ring-1 ring-red-500" : ""}`}
                      placeholder="Nhập địa chỉ ..."
                    />
                    {errors.address && (
                      <span className="text-red-500 text-xs ml-4">
                        {errors.address.message}
                      </span>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white ml-3">
                      Ngày sinh:
                    </label>
                    <input
                      {...register("dob")}
                      className={`w-full h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.dob ? "border-red-500 ring-1 ring-red-500" : ""}`}
                      type="date"
                    />
                    {errors.dob && (
                      <span className="text-red-500 text-xs ml-4">
                        {errors.dob.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse md:flex-row justify-end items-center gap-4 mt-12 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (userInfo) {
                    reset({
                      name: userInfo?.name || "",
                      email: userInfo?.email || "",
                      address: userInfo?.address || "",
                      phone: userInfo?.phone || "",
                      dob: userInfo?.dob ? userInfo?.dob.split("T")[0] : "",
                      fileId: userInfo?.avatar?.id ? String(userInfo?.avatar.id) : "",
                    });
                    setPreviewImage(userInfo?.avatar?.url || null);
                  }
                }}
                className="w-full md:w-auto px-8 h-12 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={` ${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:brightness-110'} w-full md:w-auto px-8 h-12 rounded-xl text-slate-900 font-bold flex items-center justify-center gap-2 transition-all`}
              >
                <span className="material-symbols-outlined">check</span>
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
