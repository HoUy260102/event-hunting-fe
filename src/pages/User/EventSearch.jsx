import { useCallback, useEffect, useRef, useState } from "react";
import EventFilterBar from "../../components/EventSearch/User/EventFilterBar";
import axiosClient from "../../api/axiosClient";
import { useSearchParams } from "react-router-dom";
import EventCard from "../../components/EventSearch/User/EventCard";
import EventCardSkeleton from "../../components/EventSearch/User/EventCardSkeleton";
import SearchEmpty from "../../components/common/SearchEmpty";

function EventSearch() {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextId, setNextId] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const getFiltersFromURL = useCallback(() => {
    return {
      keyword: searchParams.get("keyword") || "",
      startTime: searchParams.get("startTime") || null,
      endTime: searchParams.get("endTime") || null,
      minPrice: searchParams.get("minPrice") || "0",
      provinceId: searchParams.get("provinceId") || "",
      categoryIds: searchParams.getAll("categoryIds") || [],
      nextId: null,
    };
  }, [searchParams]);
  const [filters, setFilters] = useState(getFiltersFromURL());
  const [events, setEvents] = useState([]);
 
  useEffect(() => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value === null || value === undefined || value === "") return;
      if (key === "minPrice" && (value === "0" || value === 0)) return;
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else {
        params.set(key, value);
      }
    });
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [filters]);

  useEffect(() => {
    const newFilters = getFiltersFromURL();
    setFilters((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newFilters)) {
        return newFilters;
      }
      return prev;
    });
  }, [searchParams, getFiltersFromURL]);

  const lastRequestId = useRef(0);
  const fetchEvents = async (isLoadMore = false) => {
    const currentId = ++lastRequestId.current;
    if (isLoadMore) setIsLoadingMore(true);
    else setIsLoading(true);
    const currentParams = Object.fromEntries(searchParams.entries());
    const categories = searchParams.getAll("categoryIds");
    const queryPayload = {
      ...currentParams,
      categoryIds: categories.length > 0 ? categories : undefined,
      size: currentParams.size || 8,
      nextId: hasNext ? nextId : undefined,
    };
    try {
      const response = await axiosClient.get("/events/public/search", {
        params: queryPayload,
      });
      if (currentId !== lastRequestId.current) {
        return;
      }
      const newData = response?.data?.content || [];
      const newNextId = response?.data?.nextId;
      if (hasNext) {
        setEvents((prev) => [...prev, ...newData]);
      } else {
        setEvents(newData);
      }
      setNextId(newNextId);
      setHasNext(response?.data?.hasNext);
    } catch (error) {
      console.error("Lỗi khi fetch sự kiện:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchParams]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      nextId: null,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provinceRes, categoryRes] = await Promise.all([
          axiosClient.get("/provinces"),
          axiosClient.get("/categories"),
        ]);
        setLocations(provinceRes.data);
        setCategories(categoryRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    };
    fetchData();
  }, []);

  const handleResetFilters = () => {
    const defaultFilters = {
      keyword: "",
      startTime: null,
      endTime: null,
      minPrice: "0",
      provinceId: "",
      categoryIds: [],
      nextId: null,
    };
    setFilters(defaultFilters);
    setNextId(null);
    setHasNext(false);
    if (searchParams.toString() === "") {
      fetchEvents(false);
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <main className="px-4">
        <EventFilterBar
          locations={locations}
          categories={categories}
          handleFilterChange={handleFilterChange}
          filters={filters}
          handleResetFilters={handleResetFilters}
        ></EventFilterBar>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))
          ) : events.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="col-span-full">
              <SearchEmpty
                title="Không tìm thấy sự kiện nào"
                description="Thử tìm từ khóa khác hoặc đổi danh mục xem sao nhé!"
              />
            </div>
          )}
        </div>
        {hasNext && (
          <div className="flex justify-center mt-12 mb-10">
            <button
              disabled={isLoadingMore}
              onClick={() => fetchEvents(true)}
              className="flex items-center gap-2 px-6 py-2 bg-white border border-green-500 text-green-500 font-bold rounded-full hover:bg-green-50 disabled:opacity-50"
            >
              {isLoadingMore && (
                <svg
                  className="animate-spin h-5 w-5 text-green-500"
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
              )}
              {isLoadingMore ? "Đang tải..." : "Xem thêm sự kiện"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
export default EventSearch;
