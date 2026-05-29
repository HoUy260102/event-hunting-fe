import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosClient from "../../api/axiosClient";
import Modal from "../../components/common/Modal";
import { useHeader } from "../../hooks/useHeader";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên chủ đề phải có ít nhất 1 ký tự")
    .nonempty("Tên chủ đề là bắt buộc"),

  description: z.string().trim().optional().or(z.literal("")),

  status: z.string().nonempty("Vui lòng chọn trạng thái hoạt động"),
});

function AddCategory() {
  const { setTitle } = useHeader();
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
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
      const response = await axiosClient.post("/categories", data);
      setModal({
        isOpen: true,
        title: "Thêm chủ đề",
        message: "Tạo mới chủ đề thành công",
        type: "success",
      });
      console.log(response);
      reset();
    } catch (error) {
      console.error("Tạo chủ đề thất bại:", error);
      
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
          title: "Thêm chủ đề",
          message: "Vui lòng kiểm tra lại các thông tin lỗi được hiển thị trên form.",
          type: "error",
        });
      } else {
        // Lỗi chung khác
        setModal({
          isOpen: true,
          title: "Thêm chủ đề",
          message: error?.message || "Tạo mới chủ đề thất bại!",
          type: "error",
        });
      }
    }
  };

  useEffect(() => {
    setTitle("Quản lý chủ đề");
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
            Thêm mới chủ đề
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tạo chủ đề mới vào hệ thống giúp dễ dàng phân loại sự kiện.
          </p>
        </div>

        {/* Form chính */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 lg:p-10 transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex flex-col gap-10">
            {/* Section: Thông tin chủ đề */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-emerald-500 text-2xl">
                  category
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  Thông tin chủ đề
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên chủ đề */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Tên chủ đề <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("name")}
                      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 ${
                        errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                      }`}
                      placeholder="Nhập tên chủ đề..."
                    />
                  </div>
                  {errors.name && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Mô tả */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Mô tả
                  </label>
                  <div className="relative">
                    <textarea
                      {...register("description")}
                      rows="3"
                      className={`w-full p-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm placeholder:text-slate-400 hover:border-slate-300 resize-none ${
                        errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                      }`}
                      placeholder="Nhập mô tả cho chủ đề..."
                    />
                  </div>
                  {errors.description && (
                    <span className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.description.message}
                    </span>
                  )}
                </div>

                {/* Trạng thái */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 ml-1">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("status")}
                      className={`w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 transition-all duration-200 outline-none text-sm appearance-none cursor-pointer hover:border-slate-300 ${
                        errors.status ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                      }`}
                    >
                      <option value="">Chọn trạng thái</option>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Không hoạt động</option>
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
              Tạo chủ đề
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default AddCategory;
