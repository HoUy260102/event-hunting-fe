import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Modal from "../../components/common/Modal";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên chủ đề phải có ít nhất 1 ký tự")
    .nonempty("Tên chủ đề là bắt buộc"),

  description: z.string().trim().optional().or(z.literal("")),

  status: z.string().nonempty("Vui lòng chọn trạng thái hoạt động"),
});

function UpdateCategory() {
  const { id } = useParams();
  const [category, setCategory] = useState();
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
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    console.log(data);
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await axiosClient.put(`/categories/${id}`, data);
      reset({
        name: response?.data?.name || "",
        description: response?.data?.description || "",
        status: response?.data?.status || "ACTIVE",
      });
      setCategory(response.data);
      setModal({
        isOpen: true,
        title: "Cập nhật chủ đề",
        message: "Cập nhật chủ đề thành công",
        type: "success",
      });
      console.log(response.data);
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Cập nhật chủ đề",
        message: "Cập nhật chủ đề thất bại: " + error.message,
        type: "error",
      });
      console.error("Cập nhật chủ đề thất bại:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes] = await Promise.all([
          axiosClient.get(`/categories/${id}`),
        ]);
        setCategory(categoryRes.data);
        const categoryData = categoryRes.data;
        reset({
          name: categoryData?.name || "",
          description: categoryData?.description || "",
          status: categoryData?.status || "",
        });
      } catch (error) {
        console.error("Lấy dữ liệu thất bại:", error.message);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, reset]);

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
            Cập nhật chủ đề
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Cập nhật chủ đề vào hệ thống.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-[#1a2c15] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 lg:p-10"
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Thông tin chủ đề
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Tên:
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

                {/* Mô tả */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Mô tả:
                  </label>
                  <input
                    {...register("description")}
                    type="text"
                    className={`w-full h-12 px-6 rounded-full bg-slate-50 dark:bg-white/5 border-transparent focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    placeholder="Nhập địa chỉ email..."
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs ml-4">
                      {errors.description.message}
                    </span>
                  )}
                </div>

                {/* Trạng thái */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                    Trạng thái:
                  </label>
                  <div className="relative">
                    <select
                      {...register("status")}
                      className="focus:shadow-xl w-full h-12 px-6 pr-12 rounded-full 
               bg-slate-50 dark:bg-white/5 
               border border-transparent 
               focus:bg-white dark:focus:bg-black/20 
               text-slate-900 dark:text-white 
               appearance-none cursor-pointer outline-none transition-all"
                    >
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
              onClick={() => {
                if (category) {
                  reset({
                    name: category?.name || "",
                    description: category?.description || "",
                    status: category?.status || "ACTIVE",
                  });
                }
              }}
              className="w-full md:w-auto px-8 h-12 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={` ${isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""} w-full md:w-auto px-8 h-12 rounded-full bg-[#46ec13] text-slate-900 font-bold hover:brightness-110 flex items-center justify-center gap-2 transition-all`}
            >
              <span className="material-symbols-outlined">check</span>
              Update Category
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
export default UpdateCategory;
