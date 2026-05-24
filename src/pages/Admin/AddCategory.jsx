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
      console.log(response.data);
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Thêm chủ đề",
        message: "Tạo mới chủ đề thất bại: " + error.message,
        type: "error",
      });
      console.error("Tạo user thất bại:", error.message);
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
      <main className="flex-1 p-6 lg:p-10 max-w-[1000px] mx-auto w-full">
        {/* Tiêu đề */}
        <div className="bg-white/60 dark:bg-[#1c2e18]/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 dark:border-[#2a4225]/40 shadow-sm flex flex-col gap-1 mb-8">
          <h2 className="text-2xl font-extrabold text-[#111b0d] dark:text-white tracking-tight">
            Thêm mới chủ đề
          </h2>
          <p className="text-xs text-[#6b7280] dark:text-[#a1aebf] font-medium">
            Tạo chủ đề mới vào hệ thống giúp dễ dàng phân loại sự kiện.
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
                Thông tin của chủ đề
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Tên chủ đề:
                  </label>
                  <input
                    {...register("name")}
                    className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.name ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    placeholder="Nhập tên chủ đề..."
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Mô tả:
                  </label>
                  <input
                    {...register("description")}
                    type="text"
                    className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    placeholder="Nhập mô tả..."
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.description.message}
                    </span>
                  )}
                </div>
                {/* Trạng thái */}
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Trạng thái:
                  </label>
                  <div className="relative">
                    <select
                      {...register("status")}
                      className="focus:shadow-xl w-full h-12 px-6 pr-12 rounded-full 
           bg-slate-50 
           border border-transparent 
           focus:bg-slate-100  
           text-slate-900 
           appearance-none cursor-pointer outline-none transition-all"
                    >
                      <option value={""}>Chọn trạng thái</option>
                      <option value={"ACTIVE"}>Hoạt động</option>
                      <option value={"INACTIVE"}>Không hoạt động</option>
                    </select>
                  </div>
                  {errors.status && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.status.message}
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
              Hủy
            </button>
            <button
              type="submit"
              className="w-full md:w-auto px-8 h-12 rounded-full bg-[#46ec13] text-slate-900 font-bold hover:brightness-110 flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined">check</span>
              Tạo chủ đề
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
export default AddCategory;
