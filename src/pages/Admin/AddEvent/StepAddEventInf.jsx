import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import TextEditor from "../../../components/common/TextEditor";
import axiosClient from "../../../api/axiosClient";
import { extractFileIdsFromContent } from "../../../utils/editorContent";
function StepAddEventInf({ provinces, categories }) {
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [images, setImages] = useState(() => {
    return {
      poster: getValues("poster") || null,
      banner: getValues("banner") || null,
      organizerLogo: getValues("organizerLogo") || null,
    };
  });

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
      setValue(type, fileData?.url, { shouldValidate: true });
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
  return (
    <>
      <div class="max-w-7xl mx-auto space-y-8">
        <section class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <label class="block text-sm font-semibold text-slate-900">
              <span class="text-red-500 mr-1">*</span>Upload hình ảnh
            </label>
            {(errors.posterId || errors.bannerId) && (
              <span className="text-red-500 text-xs italic font-medium">
                Bạn chưa chọn đủ ảnh Poster/Banner
              </span>
            )}
            <a class="text-xs text-emerald-500 hover:underline" href="#">
              Xem vị trí hiển thị các ảnh
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[400px]">
            <div class="md:col-span-4 lg:col-span-3">
              <label className="md:h-full h-[250px] relative overflow-hidden border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "poster")}
                />

                {images.poster ? (
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

                {images.banner ? (
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
                      <option value={provin?.id}>{provin?.name}</option>
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
                <option value={cate?.id}>{cate?.name}</option>
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

                {images.organizerLogo ? (
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
      </div>
    </>
  );
}
export default StepAddEventInf;
