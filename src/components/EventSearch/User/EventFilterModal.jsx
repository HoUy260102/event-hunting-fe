import React, { useEffect, useState } from "react";
const EventFilterModal = ({
  isOpen,
  onClose,
  locations,
  categories,
  handleFilterChange,
  filters,
}) => {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState();
  const [minPrice, setMinPrice] = useState(0);
  locations = [
    {
      id: "",
      name: "Toàn quốc",
    },
    ...locations,
  ];
  const toggleCategory = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleReset = () => {
    setSelectedLocation("");
    setSelectedCategories([]);
    setMinPrice(0);
  };

  const handleApplyFilter = () => {
    handleFilterChange("provinceId", selectedLocation);
    handleFilterChange("minPrice", minPrice);
    handleFilterChange("categoryIds", selectedCategories);
    onClose();
  };

  useEffect(() => {
    setSelectedCategories(filters?.categoryIds || []);
    setSelectedLocation(filters?.provinceId || "");
    setMinPrice(filters?.minPrice || 0);
  }, [filters]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="absolute inset-0 bg-[#142210]/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-[650px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">
              tune
            </span>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight">
              Bộ lọc
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
              close
            </span>
          </button>
        </header>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 max-h-[70vh]">
          {/* Vị trí Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-sm text-slate-500">
                location_on
              </span>
              <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-wider">
                Vị trí
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {locations?.map((loc) => (
                <label
                  key={loc?.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 group ${selectedLocation === loc?.id ? "border-green-500/50 ring-1 ring-green-500/50" : "border-slate-100 dark:border-slate-800"}`}
                >
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {loc?.name}
                  </span>
                  <input
                    type="radio"
                    name="location"
                    checked={selectedLocation === loc?.id}
                    onChange={() => setSelectedLocation(loc?.id)}
                    className="w-5 h-5 text-green-500 border-slate-300 focus:ring-green-500 focus:ring-offset-0 bg-white dark:bg-slate-700"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Giá tiền Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-sm text-slate-500">
                payments
              </span>
              <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-wider">
                Giá tối thiểu
              </h3>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">
                  Nhập mức giá bạn muốn:
                </span>
                <span className="text-green-600 font-bold bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-lg text-sm">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(minPrice)}
                </span>
              </div>

              <div className="relative flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={minPrice === 0 ? "" : minPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setMinPrice(0);
                      } else {
                        setMinPrice(Number(val));
                      }
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    paid
                  </span>
                </div>

                {/* Nút reset nhanh về 0đ */}
                <button
                  onClick={() => setMinPrice(0)}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase"
                >
                  Xóa giá
                </button>
              </div>
              <p className="mt-2 text-[10px] text-slate-400 italic text-right">
                * Hệ thống sẽ tìm các sự kiện có giá vé từ mức này trở lên.
              </p>
            </div>
          </section>

          {/* Thể loại Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-sm text-slate-500">
                category
              </span>
              <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-wider">
                Thể loại
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cate) => {
                const isActive = selectedCategories.includes(cate?.id);
                return (
                  <button
                    key={cate?.id}
                    onClick={() => toggleCategory(cate?.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                      isActive
                        ? "bg-green-500 text-white shadow-sm shadow-[#46ec13]/30"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#46ec13] hover:text-green-500"
                    }`}
                  >
                    {cate?.name}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <footer className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
          <button
            onClick={handleReset}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              restart_alt
            </span>
            Thiết lập lại
          </button>
          <button
            onClick={() => {
              handleApplyFilter();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-green-500 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-[#46ec13]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm">done</span>
            Áp dụng
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EventFilterModal;
