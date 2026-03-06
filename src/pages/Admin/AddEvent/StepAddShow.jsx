import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import TicketTypeModal from "../../../components/modals/TicketTypeModal";
function StepAddShow() {
  const {
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useFormContext();
  const [shows, setShows] = useState(() => {
    const savedShows = getValues("shows");
    return savedShows || [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeShowId, setActiveShowId] = useState(null);
  const [activeShowIndex, setActiveShowIndex] = useState(null);
  const [activeTicketTypeIndex, setActiveTicketTypeIndex] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const seatMapType = [
    {
      id: "NONE",
      label: "Không sơ đồ",
      desc: "Vé tự do, vé đứng...",
      icon: "layers_clear",
    },
    {
      id: "SECTION_ONLY",
      label: "Theo khu vực",
      desc: "Chia khu, không số ghế",
      icon: "grid_view",
    },
    {
      id: "SECTION_WITH_SEATS",
      label: "Sơ đồ ghế",
      desc: "Chọn chính xác vị trí ghế",
      icon: "event_seat",
    },
  ];

  useEffect(() => {
    setValue("shows", shows, { shouldValidate: true });
  }, [shows, setValue]);

  const updateShow = (showId, updatedData) => {
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id !== showId) return show;
        if (
          updatedData.seatMapType &&
          updatedData.seatMapType !== show.seatMapType
        ) {
          return {
            ...show,
            seatMapType: updatedData.seatMapType,
            seatMapSvg: "",
            sections: [],
            ticketTypes: show.ticketTypes.map((ticketType) => ({
              ...ticketType,
              sectionId: "",
            })),
          };
        }

        return { ...show, ...updatedData };
      }),
    );
  };

  const addShow = () => {
    const newShow = {
      id: crypto.randomUUID(),
      ticketTypes: [],
      seatMapType: "NONE",
      seatMapSvg: "",
    };
    const newShowsList = [...shows, newShow];
    setShows(newShowsList);
  };

  const removeShow = (showId) => {
    if (shows.length > 0) {
      setShows(shows.filter((s) => s.id !== showId));
    }
  };

  const handleAddShow = async () => {
    if (shows.length === 0) {
      addShow();
      return;
    }
    const isValid = await trigger("shows");
    if (isValid) {
      addShow();
    }
  };

  const handleOpenAddTicket = async (showId, index) => {
    await trigger(`shows.${index}`);
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id === showId) {
          return {
            ...show,
            ticketTypes: [
              ...show.ticketTypes,
              {
                id: crypto.randomUUID(),
                name: "",
                seatingType: "SEATED",
                totalQuantity: 0,
                ticketTiers: [],
              },
            ],
          };
        }
        return show;
      }),
    );
    setActiveShowId(showId);
    setEditingTicket(null);
  };

  const openEditTicket = (showId, ticketType, showIndex, ticketTypeIndex) => {
    setActiveShowIndex(showIndex);
    setActiveTicketTypeIndex(ticketTypeIndex);
    setActiveShowId(showId);
    setEditingTicket(ticketType);
    setIsModalOpen(true);
  };

  const handleSaveTicket = (ticketData) => {
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id === activeShowId) {
          if (editingTicket) {
            return {
              ...show,
              ticketTypes: show.ticketTypes.map((t) =>
                t.id === editingTicket.id ? { ...ticketData, id: t.id } : t,
              ),
            };
          } else {
            return {
              ...show,
              ticketTypes: [
                ...show.ticketTypes,
                { ...ticketData, id: crypto.randomUUID() },
              ],
            };
          }
        }
        return show;
      }),
    );
    setIsModalOpen(false);
  };

  const deleteTicket = (showId, ticketTypeId) => {
    setShows((prevShows) =>
      prevShows.map((show) => {
        if (show.id === showId) {
          return {
            ...show,
            ticketTypes: show.ticketTypes.filter((t) => t.id !== ticketTypeId),
          };
        }
        return show;
      }),
    );
  };

  const handleSvgUpload = (showId, file) => {
    if (!file || file.type !== "image/svg+xml") {
      alert("Vui lòng tải lên file định dạng .svg");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target.result;
      const sections = extractSectionsFromSvg(svgContent);
      updateShow(showId, {
        seatMapSvg: svgContent,
        sections: sections.map((s) => ({
          sectionId: s.id,
          sectionName: s.label,
        })),
      });
    };
    reader.readAsText(file);
  };

  const extractSectionsFromSvg = (svgContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const elements = doc.querySelectorAll('[id^="section-"]');

    return Array.from(elements).map((el) => {
      const rawId = el.id;
      const cleanLabel =
        el.getAttribute("data-name") || rawId.replace("section-", "");
      return {
        id: rawId,
        label: cleanLabel,
      };
    });
  };

  return (
    <>
      <TicketTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        editData={editingTicket}
        show={shows.find((s) => s.id === activeShowId)}
        showIndex={activeShowIndex}
        ticketTypeIndex={activeTicketTypeIndex}
      />
      <div class="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="pl-2 text-xl font-bold text-slate-800 flex items-center">
            Thời Gian
          </h2>
        </div>
        {/* Danh sách các suất diễn */}
        {shows?.map((show, index) => {
          const currentShowError = errors.shows?.[index];
          return (
            <div
              key={show.id}
              className={`bg-white rounded-xl p-6 mb-8 relative shadow-sm border-1 animate-in fade-in duration-300 ${
                currentShowError ? "border-red-500" : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 cursor-pointer group">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-colors text-lg">
                    expand_less
                  </span>
                  <span className="text-slate-800 font-bold text-lg">
                    Suất diễn {shows.length > 1 ? index + 1 : ""}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeShow(show.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    close
                  </span>
                </button>
              </div>

              {/* BỔ SUNG: Lựa chọn loại sơ đồ */}
              <div
                className={`mb-8 p-4  rounded-xl border-2 transition-all ${
                  currentShowError?.seatMapType
                    ? " border-red-300"
                    : " border-slate-100"
                }`}
              >
                <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">
                    map
                  </span>
                  Loại sơ đồ chỗ ngồi
                </label>
                <div className="flex flex-col md:flex-row gap-6">
                  {seatMapType.map((type) => (
                    <label
                      key={type.id}
                      className={`flex-1 flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        show.seatMapType === type.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-white bg-white hover:border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`seatMapType-${show.id}`}
                        className="mt-1 w-4 h-4 text-emerald-600"
                        checked={show.seatMapType === type.id}
                        onChange={() =>
                          updateShow(show.id, { seatMapType: type.id })
                        }
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-sm text-slate-900">
                          <span className="material-symbols-outlined text-sm">
                            {type.icon}
                          </span>
                          {type.label}
                        </div>
                        <p className="text-xs text-slate-500">{type.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {currentShowError?.seatMapType && (
                  <p className="text-red-500 text-sm mt-2">
                    {currentShowError.seatMapType.message}
                  </p>
                )}
              </div>

              {/* Hiển thị Upload SVG khi chọn SECTION_WITH_SEATS */}
              {(show.seatMapType === "SECTION_WITH_SEATS" ||
                show.seatMapType === "SECTION_ONLY") && (
                <div
                  className={`mb-8 bg-slate-50/50 p-4 rounded-xl border-2 border-dashed transition-all ${
                    currentShowError?.seatMapSvg
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Cột bên trái: Upload Input */}
                    <div className="flex-1 space-y-4">
                      <label className="block text-sm font-bold text-slate-800">
                        Tải lên sơ đồ SVG
                      </label>
                      <div className="relative h-32 w-full border-2 border-dashed border-emerald-200 rounded-lg bg-white flex flex-col items-center justify-center hover:bg-emerald-50 transition-colors cursor-pointer group">
                        <input
                          type="file"
                          accept=".svg"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleSvgUpload(show.id, file);
                              e.target.value = "";
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="material-symbols-outlined text-emerald-500 text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {show.seatMapSvg ? "cloud_done" : "upload_file"}
                        </span>
                        <p className="text-xs text-slate-500">
                          {show.seatMapSvg
                            ? "Click để thay đổi sơ đồ khác"
                            : "Chọn file sơ đồ .svg"}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">
                        * Lưu ý: File SVG nên được group theo các Section để hệ
                        thống nhận diện đúng ID.
                      </p>
                    </div>
                    {/* Cột bên phải: Preview SVG */}
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-800 mb-4">
                        Xem trước sơ đồ
                      </label>
                      <div className="min-h-[12rem] w-full bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                        {show.seatMapSvg ? (
                          <div
                            className="p-8 w-full flex items-center justify-center preview-svg-container"
                            dangerouslySetInnerHTML={{
                              __html: show.seatMapSvg,
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <span className="material-symbols-outlined text-slate-300 text-5xl">
                              image
                            </span>
                            <p className="text-xs text-slate-400 mt-2">
                              Chưa có sơ đồ để hiển thị
                            </p>
                          </div>
                        )}

                        {show.seatMapSvg && (
                          <button
                            onClick={() =>
                              updateShow(show.id, {
                                seatMapSvg: "",
                              })
                            }
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md flex items-center justify-center transition-transform hover:scale-110"
                          >
                            <span className="material-symbols-outlined text-sm">
                              close
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {currentShowError?.seatMapSvg?.message && (
                    <p className="text-red-500 text-sm">
                      {currentShowError.seatMapSvg.message}
                    </p>
                  )}
                </div>
              )}
              {/* Grid Input Thời gian */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Thời gian bắt đầu
                  </label>
                  <div className="relative">
                    <input
                      value={show.startTime || ""}
                      onChange={(e) =>
                        updateShow(show.id, {
                          startTime: e.target.value,
                        })
                      }
                      type="datetime-local"
                      className={`w-full bg-slate-50 border rounded-lg py-3 px-4 text-sm outline-none transition-all ${
                        currentShowError?.startTime
                          ? "border-red-500 focus:border-red-600"
                          : "border-slate-200  focus:border-emerald-500"
                      }`}
                      placeholder="Chọn ngày & giờ bắt đầu"
                    />
                    {currentShowError?.startTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {currentShowError.startTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Thời gian kết thúc
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={show.endTime || ""}
                      onChange={(e) =>
                        updateShow(show.id, {
                          endTime: e.target.value,
                        })
                      }
                      className={`w-full bg-slate-50 border rounded-lg py-3 px-4 text-sm outline-none transition-all ${
                        currentShowError?.endTime
                          ? "border-red-500  focus:border-red-600"
                          : "border-slate-200  focus:border-emerald-500"
                      }`}
                      placeholder="Chọn ngày & giờ kết thúc"
                    />
                    {currentShowError?.endTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {currentShowError.endTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Tối thiểu / đơn
                  </label>
                  <div className="relative">
                    <input
                      value={show.minOrder}
                      onChange={(e) =>
                        updateShow(show.id, {
                          minOrder: e.target.value,
                        })
                      }
                      type="number"
                      className={`w-full bg-slate-50 border rounded-lg py-3 px-4 text-sm outline-none transition-all ${
                        currentShowError?.minOrder
                          ? "border-red-500  focus:border-red-600"
                          : "border-slate-200 focus:border-emerald-500"
                      }`}
                    />
                    {currentShowError?.minOrder && (
                      <p className="text-red-500 text-sm mt-1">
                        {currentShowError.minOrder.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Tối đa / đơn
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={show.maxOrder}
                      onChange={(e) =>
                        updateShow(show.id, {
                          maxOrder: e.target.value,
                        })
                      }
                      className={`w-full bg-slate-50 border rounded-lg py-3 px-4 text-sm outline-none transition-all ${
                        currentShowError?.maxOrder
                          ? "border-red-500  focus:border-red-600"
                          : "border-slate-200  focus:border-emerald-500"
                      }`}
                    />
                    {currentShowError?.maxOrder && (
                      <p className="text-red-500 text-sm mt-1">
                        {currentShowError.maxOrder.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Loại vé section */}
              <div className="mb-4 flex items-center gap-1 border-t border-slate-100 pt-6">
                <span className="text-red-500 font-bold text-lg">*</span>
                <span className="text-slate-800 font-bold">Loại vé</span>
              </div>

              {/* Danh sách vé thuộc Show này */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  <span className="text-red-500 mr-1">*</span>Loại vé của suất
                  này
                </label>
                {show.ticketTypes.map((ticketType, ticketTypeIndex) => {
                  const hasTicketError =
                    errors.shows?.[index]?.ticketTypes?.[ticketTypeIndex];
                  return (
                    <div
                      key={ticketType.id}
                      className={`flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm transition-all group ${
                        hasTicketError
                          ? "border-red-500 bg-red-50"
                          : "border-slate-100 hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl">
                            confirmation_number
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {ticketType.name || "--"}
                          </p>
                          <p className="text-xs text-slate-500">
                            • SL: {ticketType.totalQuantity || "--"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          type="button"
                          onClick={() =>
                            openEditTicket(
                              show.id,
                              ticketType,
                              index,
                              ticketTypeIndex,
                            )
                          }
                          className="p-2 text-slate-400 hover:text-emerald-500"
                        >
                          <span className="material-symbols-outlined text-4xl">
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTicket(show.id, ticketType.id)}
                          className="p-2 text-slate-400 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-4xl">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Truy cập đúng vào message của ticketTypes trong mảng shows */}
                {currentShowError?.ticketTypes && (
                  <p className="text-red-500 text-sm mb-2">
                    {currentShowError.ticketTypes.message}
                  </p>
                )}

                {/* Nút thêm vé riêng cho từng section */}
                <button
                  type="button"
                  onClick={() => handleOpenAddTicket(show.id, index)}
                  className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center gap-2 text-emerald-500 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all mt-4"
                >
                  <span className="material-symbols-outlined text-4xl">
                    add_circle
                  </span>
                  Tạo loại vé mới
                </button>
              </div>
            </div>
          );
        })}
        {errors.shows?.root?.message && (
          <p className="text-red-500 text-center font-bold">
            {errors.shows.root.message}
          </p>
        )}
        {/* Nút tạo suất diễn dưới cùng */}
        <div className="w-full mt-6 border-t border-slate-200 flex items-center justify-center py-4">
          <button
            type="button"
            onClick={handleAddShow}
            className="flex items-center gap-2 text-emerald-500 cursor-pointer font-bold text-lg group"
          >
            <span className="material-symbols-outlined text-4xl">
              add_circle
            </span>
            <span>Tạo suất diễn</span>
          </button>
        </div>
      </div>
    </>
  );
}
export default StepAddShow;
