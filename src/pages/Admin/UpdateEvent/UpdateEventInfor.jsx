import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TextEditor from "../../../components/common/TextEditor";
import axiosClient from "../../../api/axiosClient";
import { extractFileIdsFromContent } from "../../../utils/editorContent";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../../../components/common/Modal";
import z from "zod";
import { useParams } from "react-router-dom";
import StatusBadge from "../../../components/common/StatusBadge";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { useAuth } from "../../../hooks/useAuth";


const eventSchema = z.object({
  posterId: z.string().min(1, "Vui lòng upload ảnh poster"),
  status: z.string().optional(),
  bannerId: z.string().min(1, "Vui lòng upload ảnh banner"),
  organizerLogoId: z.string().min(1, "Vui lòng upload ảnh logo ban tổ chức"),
  name: z
    .string()
    .min(5, "Tên sự kiện phải có ít nhất 5 ký tự")
    .max(100, "Tối đa 100 ký tự"),
  location: z.string().min(1, "Vui lòng nhập tên địa điểm"),
  address: z.string().nullable().optional(),
  userId: z.string().min(1, "Vui lòng nhập id người sở hữu"),
  provinceId: z.string().min(1, "Vui lòng chọn Tỉnh/Thành"),
  categoryId: z.string().min(1, "Vui lòng chọn thể loại"),
  descriptionHtml: z.string().optional(),
  descriptionText: z.string().optional(),
  mediaIds: z.array(z.string()).default([]),
  organizerName: z.string().min(1, "Vui lòng nhập tên ban tổ chức"),
  organizerInfo: z.string().min(10, "Thông tin ban tổ chức quá ngắn").max(500),
});

function UpdateEventInfor() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [initialData, setInitialData] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState({
    poster: "",
    banner: "",
    organizerLogo: "",
  });
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    clearErrors,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      posterId: "",
      bannerId: "",
      organizerLogoId: "",
      name: "",
      location: "",
      address: "",
      provinceId: "",
      categoryId: "",
      descriptionHtml: "",
      descriptionText: "",
      mediaIds: [],
      organizerName: "",
      organizerInfo: "",
      status: "DRAFT",
      shows: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provinceRes, categoryRes, eventRes] = await Promise.all([
          axiosClient.get("/provinces"),
          axiosClient.get("/categories"),
          axiosClient.get(`/events/${id}`),
        ]);
        const formattedData = {
          ...eventRes.data,
          posterId: eventRes.data?.poster?.id || "",
          bannerId: eventRes.data?.banner?.id || "",
          organizerLogoId: eventRes.data?.organizerLogo?.id || "",
          provinceId: eventRes.data?.province?.id || "",
          categoryId: eventRes.data?.category?.id || "",
        };
        setProvinces(provinceRes.data);
        setCategories(categoryRes.data);
        setInitialData(formattedData);
        reset(formattedData);
        setImages({
          poster: eventRes.data?.poster?.url,
          banner: eventRes.data?.banner?.url,
          organizerLogo: eventRes.data?.organizerLogo?.url,
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, reset]);

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "IMAGE");
    let fileFolder = "";
    switch (type) {
      case "banner":
        fileFolder = "EVENT_BANNER";
        break;
      case "poster":
        fileFolder = "EVENT_POSTER";
        break;
      case "organizerLogo":
        fileFolder = "ORGANIZER_LOGO";
        break;
    }
    formData.append("folder", fileFolder);
    try {
      const response = await axiosClient.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const fileData = response.data;
      console.log(fileData);
      console.log("Upload thành công, ID file là:", fileData.id);
      setImages((prev) => ({
        ...prev,
        [type]: fileData?.url,
      }));
      setValue(type + "Id", fileData?.id, { shouldValidate: true });
      setImages((prev) => ({
        ...prev,
        [type]: fileData?.url,
      }));
    } catch (error) {
      console.error("Lỗi upload rồi ơi:", error);
      alert("Lỗi:", error.message);
    } finally {
      e.target.value = "";
    }
  };
  const watchName = watch("name", "");
  const watchOrganizerName = watch("organizerName", "");
  const watchOrganizerInfo = watch("organizerInfo", "");
  const watchLocation = watch("location", "");
  const watchAddress = watch("address", "");
  const onSubmit = async (data) => {
    try {
      const eventRes = await axiosClient.put(`/events/${id}`, data);
      const formattedData = {
        ...eventRes.data,
        posterId: eventRes.data?.poster?.id || "",
        bannerId: eventRes.data?.banner?.id || "",
        organizerLogoId: eventRes.data?.organizerLogo?.id || "",
        provinceId: eventRes.data?.province?.id || "",
        categoryId: eventRes.data?.category?.id || "",
      };
      setInitialData(formattedData);
      reset(formattedData);
      setModal({
        isOpen: true,
        title: "Cập nhật sự kiện",
        message: "Thông tin sự kiện đã được cập nhật!",
        type: "success",
      });
    } catch (error) {
      if (
        error.code === "VALIDATION_ERROR" ||
        error.code === "EVENT_VALIDATION_ERROR"
      ) {
        const serverErrors = error.details;
        Object.entries(serverErrors).forEach(([field, message]) => {
          setError(field, {
            type: "server",
            message: message,
          });
        });
        setModal({
          isOpen: true,
          title: "Cập nhật sự kiện",
          message: "Cập nhật sự kiện thất bại: " + error.message,
          type: "error",
        });
        return;
      }
      setModal({
        isOpen: true,
        title: "Lỗi",
        message: error.message || "Không thể cập nhật sự kiện",
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy mọi thay đổi không?")) {
      reset(initialData);
      setImages({
        poster: initialData?.poster?.url,
        banner: initialData?.banner?.url,
        organizerLogo: initialData?.organizerLogo?.url,
      });
    }
  };

  const STATUS_CONFIG = {
    DRAFT: {
      label: "Nháp",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
    PENDING: {
      label: "Chờ duyệt",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      dot: "bg-yellow-500",
    },
    APPROVED: {
      label: "Đã duyệt",
      color: "bg-green-100 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    PUBLISHED: {
      label: "Đã công khai",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "bg-orange-100 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
    },
    REJECTED: {
      label: "Bị từ chối",
      color: "bg-red-100 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  };

  const [confirmModal, setComfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [nextStatus, setNextStatus] = useState(null);

  const requestChangeStatus = (newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    setComfirmModal({
      isOpen: true,
      title: "Xác nhận thay đổi",
      message: `Bạn có chắc chắn muốn chuyển trạng thái sự kiện này sang "${newStatus}" không?`,
    });
    setNextStatus(newStatus);
  };

  const handleConfirmStatus = async () => {
    setComfirmModal({
      isOpen: false,
      title: "",
      message: "",
    });
    try {
      await axiosClient.patch(`/events/${id}/status`, {
        status: nextStatus,
      });
      setValue("status", nextStatus, { shouldValidate: true });
      setInitialData((prev) => ({
        ...prev,
        status: nextStatus,
      }));
      setModal({
        isOpen: true,
        title: "Cập nhật sự kiện",
        message: "Thay đổi trạng thái thành công.",
        type: "success",
      });
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Cập nhật sự kiện",
        message: "Thay đổi trạng thái thất bại: " + error.message,
        type: "error",
      });
    } finally {
      setNextStatus(null);
    }
  };
  const userId = watch("userId");
  const [owner, setOwner] = useState(null);
  useEffect(() => {
    if (!userId) {
      setOwner(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axiosClient.get(`/users/${userId}`);
        setOwner(res.data);
        clearErrors("userId");
      } catch (err) {
        console.log(err.message);
        setError("userId", { message: "User không hợp lệ" });
        setOwner(null);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [userId]);

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
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() =>
          setComfirmModal({ isOpen: false, title: "", message: "" })
        }
        onConfirm={handleConfirmStatus}
      />
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {/* Tên sự kiện */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-900">
              <span className="text-red-500 mr-1"></span>Trạng thái sự kiện:
            </label>
            <div className="relative mt-2">
              <StatusBadge
                status={getValues("status")}
                options={STATUS_CONFIG}
                onStatusChange={(newStatus) =>
                  requestChangeStatus(newStatus, getValues("status"))
                }
              ></StatusBadge>
            </div>
          </div>
        </section>
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <label className="block text-sm font-semibold text-slate-900">
              <span className="text-red-500 mr-1">*</span>Upload hình ảnh
            </label>
            {(errors.posterId || errors.bannerId) && (
              <span className="text-red-500 text-xs italic font-medium">
                Bạn chưa chọn đủ ảnh Poster/Banner
              </span>
            )}
            <a className="text-xs text-emerald-500 hover:underline" href="#">
              Xem vị trí hiển thị các ảnh
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[400px]">
            <div className="md:col-span-4 lg:col-span-3">
              <label className="md:h-full h-[250px] relative overflow-hidden border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "poster")}
                />

                {images?.poster ? (
                  <>
                    <img
                      src={images.poster}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Poster"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        Thay đổi ảnh
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-emerald-500 text-4xl mb-4 group-hover:scale-110 transition-transform">
                      cloud_upload
                    </span>
                    <p className="text-sm font-medium text-slate-700">
                      Ảnh Poster
                    </p>
                    <p className="text-xs text-slate-400 mt-1">(720x958)</p>
                  </div>
                )}
              </label>
            </div>

            <div className="md:col-span-8 lg:col-span-9">
              <label className="md:h-full h-[250px] relative overflow-hidden border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  id="file-banner"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "banner")}
                />

                {images?.banner ? (
                  <>
                    <img
                      src={images.banner}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Banner"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        Thay đổi ảnh nền
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-emerald-500 text-4xl mb-4 group-hover:scale-110 transition-transform">
                      cloud_upload
                    </span>
                    <p className="text-sm font-medium mb-1 text-slate-700">
                      Thêm ảnh nền sự kiện
                    </p>
                    <p className="text-xs text-slate-400">(1280x720)</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {/* Tên sự kiện */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-900">
              <span className="text-red-500 mr-1">*</span>Tên sự kiện
            </label>
            <div className="relative">
              <input
                {...register("name")}
                className={`w-full border rounded-lg px-4 py-3 outline-none transition-all pr-16 text-sm
                ${
                  errors.name
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-slate-200 bg-transparent focus:ring-emerald-500 focus:border-emerald-500"
                } 
                focus:ring-2`}
                maxLength="100"
                placeholder="Tên sự kiện"
                type="text"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {watchName.length} / 100
              </span>
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Địa chỉ sự kiện */}
          <div>
            <label className="block text-sm font-semibold mb-4 text-slate-900">
              <span className="text-red-500 mr-1">*</span>Địa chỉ sự kiện
            </label>

            {/* Form địa điểm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  Tên địa điểm
                </label>
                <div className="relative">
                  <input
                    {...register("location")}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 outline-none transition-all pr-16 text-sm
                      ${
                        errors.location
                          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                          : "border-slate-200 bg-transparent focus:ring-emerald-500 focus:border-emerald-500"
                      } `}
                    maxLength="80"
                    placeholder="Tên địa điểm"
                    type="text"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {watchLocation.length} / 80
                  </span>
                </div>
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  Địa chỉ
                </label>
                <div className="relative">
                  <input
                    {...register("address")}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 outline-none transition-all pr-16 text-sm
                      ${
                        errors.address
                          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                          : "border-slate-200 bg-transparent focus:ring-emerald-500 focus:border-emerald-500"
                      } `}
                    maxLength="255"
                    placeholder="Nhập địa chỉ"
                    type="text"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {watchAddress?.length} / 255
                  </span>
                </div>
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  Tỉnh / Thành
                </label>
                <div className="relative">
                  <select
                    {...register("provinceId")}
                    className={`w-full bg-white border  rounded-lg px-4 py-3 focus:ring-2 outline-none appearance-none cursor-pointer text-sm text-slate-700
                      ${
                        errors.provinceId
                          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                          : "border-slate-200 bg-transparent focus:ring-emerald-500 focus:border-emerald-500"
                      } 
                      `}
                  >
                    <option value="">Vui lòng chọn</option>
                    {provinces.map((provin) => (
                      <option key={provin.id} value={provin?.id}>
                        {provin?.name}
                      </option>
                    ))}
                  </select>
                  {/* Icon mũi tên cho select */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-sm">
                      expand_more
                    </span>
                  </div>
                </div>
                {errors.provinceId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.provinceId.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold mb-4 text-slate-900">
            <span className="text-red-500 mr-1">*</span>Thể loại sự kiện
          </label>

          <div className="relative">
            <select
              {...register("categoryId")}
              className={`w-full bg-transparent border rounded-lg px-4 py-3 focus:ring-2 outline-none appearance-none cursor-pointer text-sm text-slate-700
                ${
                  errors.categoryId
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-slate-200 bg-transparent focus:ring-emerald-500 focus:border-emerald-500"
                } 
                `}
              onChange={(e) => console.log("Thể loại đã chọn:", e.target.value)}
            >
              <option value="">Vui lòng chọn</option>
              {categories.map((cate) => (
                <option key={cate.id} value={cate?.id}>
                  {cate?.name}
                </option>
              ))}
            </select>

            {/* Icon mũi tên hướng xuống để người dùng nhận diện */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-xl">
                expand_more
              </span>
            </div>
          </div>
          {errors.categoryId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </section>
        {/* SECTION: Chứa thông tin sự kiện */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold mb-4 text-slate-900">
            <span className="text-red-500 mr-1">*</span>Thông tin sự kiện
          </label>

          <Controller
            name="descriptionHtml"
            control={control}
            render={({ field }) => (
              <TextEditor
                value={field.value || ""}
                onChange={(data) => {
                  field.onChange(data.html);
                  const mediaIds = extractFileIdsFromContent(data.html);
                  setValue("descriptionText", data.text);
                  setValue("mediaIds", mediaIds);
                }}
                placeholder="Hãy cho khách hàng biết sự kiện của bạn có gì hấp dẫn..."
              />
            )}
          />
          {errors.descriptionHtml && (
            <p className="text-red-500 text-xs mt-1">
              {errors.descriptionHtml.message}
            </p>
          )}

          <p className="mt-2 text-[11px] text-slate-400">
            Mẹo: Cung cấp đầy đủ lịch trình và các diễn giả sẽ giúp tăng tỷ lệ
            mua vé.
          </p>
        </section>

        {currentUser?.role === "ADMIN" ? (
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-900">
                <span className="text-red-500 mr-1">*</span>Id sở hữu
              </label>
              <div className="relative">
                <input
                  {...register("userId")}
                  className={`w-full border rounded-lg px-4 py-3 outline-none transition-all pr-16 text-sm
                ${
                  errors.userId
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-slate-200 bg-transparent focus:ring-emerald-500 focus:border-emerald-500"
                } 
                focus:ring-2`}
                  maxLength="100"
                  placeholder="Nhập id của người sở hữu sự kiện"
                  type="text"
                />
              </div>
              {owner && (
                <p className="mt-3 text-sm text-slate-600 italic">
                  {owner?.name} - {owner?.email}
                </p>
              )}
              {errors?.userId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors?.userId?.message}
                </p>
              )}
            </div>
          </section>
        ) : (
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-sm font-semibold mb-2 text-slate-900">Người sở hữu</label>
            <p className="text-sm text-slate-600">{currentUser?.name} - {currentUser?.email}</p>
          </section>
        )}


        {/* SECTION: THÔNG TIN BAN TỔ CHỨC */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-[200px] shrink-0">
              <label className="h-[200px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:border-emerald-500 transition-colors relative overflow-hidden">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "organizerLogo")}
                />

                {images?.organizerLogo ? (
                  <>
                    {/* Hiển thị ảnh sau khi upload */}
                    <img
                      src={images.organizerLogo}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Logo Ban Tổ Chức"
                    />
                    {/* Lớp phủ (overlay) hiện lên khi hover để báo hiệu có thể đổi ảnh */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <span className="text-white text-[10px] font-medium bg-black/20 px-2 py-1 rounded-full">
                        Thay đổi Logo
                      </span>
                    </div>
                  </>
                ) : (
                  /* Trạng thái chưa có ảnh */
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-emerald-500 text-3xl mb-2 group-hover:scale-110 transition-transform">
                      add_a_photo
                    </span>
                    <p className="text-xs font-semibold text-slate-700">
                      Logo Ban tổ chức
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      (Kích thước: 275x275)
                    </p>
                  </div>
                )}
              </label>
              {errors.organizerLogoId && (
                <p className="text-red-500 text-[10px] mt-2 text-center">
                  {errors.organizerLogoId.message}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-6">
              {/* Nhập Tên Ban Tổ Chức */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-900">
                  <span className="text-red-500 mr-1">*</span>Tên ban tổ chức
                </label>
                <div className="relative">
                  <input
                    {...register("organizerName")}
                    className={`w-full bg-white border rounded-lg px-4 py-3 focus:ring-2 outline-none transition-all pr-16 text-sm text-slate-700
                      ${
                        errors.organizerName
                          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                          : "border-slate-200 bg-transparent focus:ring-emerald-500 focus:border-emerald-500"
                      }`}
                    maxLength="80"
                    placeholder="Ví dụ: Công ty Giải trí ABC"
                    type="text"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
                    {watchOrganizerName.length} / 80
                  </span>
                  {errors.organizerName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.organizerName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Nhập Thông Tin Chi Tiết */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-900">
                  <span className="text-red-500 mr-1">*</span>Thông tin ban tổ
                  chức
                </label>
                <div className="relative">
                  <textarea
                    {...register("organizerInfo")}
                    className={`w-full bg-white border rounded-lg px-4 py-3 focus:ring-2 outline-none transition-all text-sm text-slate-700 min-h-[110px] resize-none
                      ${
                        errors.organizerLogoId
                          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                          : "border-slate-200 bg-transparent focus:ring-emerald-500 focus:border-emerald-500"
                      }`}
                    maxLength="500"
                    placeholder="Giới thiệu ngắn gọn về ban tổ chức sự kiện..."
                    rows="4"
                  ></textarea>
                  <span className="absolute right-4 bottom-3 text-[10px] font-medium text-slate-400">
                    {watchOrganizerInfo.length} / 500
                  </span>
                </div>
                {errors.organizerInfo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.organizerInfo.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
        <div className="flex justify-end items-center pt-8 border-t border-slate-200">
          <div className="flex gap-4">
            {/* Nút Hủy (Tùy chọn) */}
            <button
              type="button"
              onClick={() => {
                handleCancel();
              }}
              className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 active:scale-95"
            >
              Hủy bỏ
            </button>

            {/* Nút Lưu Chính */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)} // Nhớ tạo hàm onSubmit nhé
              className={`
        relative flex items-center justify-center gap-2 px-8 py-2.5 
        bg-emerald-500 hover:bg-emerald-600 text-white 
        rounded-lg font-bold text-sm shadow-lg shadow-emerald-200 
        transition-all duration-200 active:scale-95
        disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
      `}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    save
                  </span>
                  <span>Cập nhật sự kiện</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
export default UpdateEventInfor;
