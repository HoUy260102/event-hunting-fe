import React, { useState } from "react";
import EventFilterModal from "./EventFilterModal";
import DateRangeFilter from "./DateRangeFilter";
import { formatDate } from "../../../utils/format";
const EventFilterBar = ({
  locations,
  categories,
  handleFilterChange,
  filters,
  handleResetFilters,
}) => {
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [isOpenDateRangeFilter, setIsOpenDateRangeFilter] = useState(false);
  const handleOnCloseFilter = () => {
    setIsOpenFilter((pre) => !pre);
  };
  const handleOnCloseDateRangeFilter = () => {
    setIsOpenDateRangeFilter((pre) => !pre);
  };
  const removeCategory = (id) => {
    const newCats = filters?.categoryIds.filter((catId) => catId !== id);
    handleFilterChange("categoryIds", newCats);
  };
  const removeLocation = () => {
    handleFilterChange("provinceId", "");
  };
  const removePrice = () => {
    handleFilterChange("minPrice", "0");
  };
  return (
    <>
      <EventFilterModal
        isOpen={isOpenFilter}
        onClose={handleOnCloseFilter}
        locations={locations}
        categories={categories}
        handleFilterChange={handleFilterChange}
        filters={filters}
      ></EventFilterModal>
      <DateRangeFilter
        isOpen={isOpenDateRangeFilter}
        onClose={handleOnCloseDateRangeFilter}
        handleFilterChange={handleFilterChange}
      ></DateRangeFilter>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-5 px-3">
        <span className="hidden md:block text-green-500 text-md font-extralight">
          Kết quả tìm kiếm:
        </span>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => {
              setIsOpenDateRangeFilter((pre) => !pre);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-slate-800 dark:bg-white/10 rounded-full text-white text-sm font-bold hover:bg-slate-700 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              calendar_today
            </span>
            {filters?.startTime || filters?.endTime ? (
              <>
                {filters?.startTime ? formatDate(filters.startTime) : "..."}
                {" - "}
                {filters?.endTime ? formatDate(filters.endTime) : "..."}
              </>
            ) : (
              "Tất cả các ngày"
            )}
            <span className="material-symbols-outlined text-[20px]">
              expand_more
            </span>
          </button>
          <button
            onClick={() => {
              setIsOpenFilter((pre) => !pre);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">
              filter_alt
            </span>
            Bộ lọc
            <span className="material-symbols-outlined text-[20px]">
              expand_more
            </span>
          </button>
          <button
            onClick={handleResetFilters}
            className="bg-green-500 hover:bg-green-600 flex items-center gap-1 px-3 py-1 text-white text-sm font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              restart_alt
            </span>
            Xóa tất cả
          </button>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Tỉnh thành / Thành phố */}
            {filters?.provinceId && (
              (() => {
                const location = locations.find((l) => l.id === filters.provinceId);
                if (!location) return null;
                return (
                  <div
                    key="location-badge"
                    className="flex items-center gap-2 px-3 py-1 bg-green-500 border border-green-500 rounded-full text-xs font-bold text-white"
                  >
                    <span>{location.name}</span>
                    <button
                      onClick={removeLocation}
                      className="flex items-center justify-center rounded-full p-0.5 transition-colors"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "14px", fontWeight: "bold" }}
                      >
                        close
                      </span>
                    </button>
                  </div>
                );
              })()
            )}

            {/* Mức giá */}
            {Number(filters?.minPrice) > 0 && (
              <div
                key="price-badge"
                className="flex items-center gap-2 px-3 py-1 bg-green-500 border border-green-500 rounded-full text-xs font-bold text-white"
              >
                <span>
                  Từ {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(Number(filters.minPrice))}
                </span>
                <button
                  onClick={removePrice}
                  className="flex items-center justify-center rounded-full p-0.5 transition-colors"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px", fontWeight: "bold" }}
                  >
                    close
                  </span>
                </button>
              </div>
            )}

            {/* Thể loại */}
            {filters?.categoryIds?.map((id) => {
              const category = categories.find((c) => c.id === id);
              if (!category) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500 border border-green-500 rounded-full text-xs font-bold text-white"
                >
                  <span>{category.name}</span>
                  <button
                    onClick={() => removeCategory(id)}
                    className="flex items-center justify-center rounded-full p-0.5 transition-colors"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                    >
                      close
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventFilterBar;
