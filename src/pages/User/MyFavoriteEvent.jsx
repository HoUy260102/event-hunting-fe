import { useCallback, useEffect, useState } from "react";
import EventFilterBar from "../../components/EventSearch/User/EventFilterBar";
import axiosClient from "../../api/axiosClient";
import EventCard from "../../components/EventSearch/User/EventCard";
import EventCardSkeleton from "../../components/EventSearch/User/EventCardSkeleton";
import SearchEmpty from "../../components/common/SearchEmpty";
import { useAuth } from "../../hooks/useAuth";

function MyfavoriteEvent() {
  const { user, openLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextId, setNextId] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [events, setEvents] = useState([]);

  const fetchEvents = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = {
          size: 8,
          nextId: isLoadMore ? nextId : null,
        };

        const response = await axiosClient.get("/events/my-favorites", {
          params,
        });

        const { content, nextId: newNextId, hasNext: newHasNext } = response.data;
        if (isLoadMore) {
          setEvents((prev) => [...prev, ...content]); 
        } else {
          setEvents(content); 
        }

        setNextId(newNextId);
        setHasNext(newHasNext);
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [nextId],
  ); 

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <main className="px-4">
        <div className="mb-5">
          <h3 className="border-b border-[#474848]/20 py-5 font-headline text-white text-2xl font-extrabold tracking-tight text-on-surface">
            Sự kiện yêu thích
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))
          ) : events?.length > 0 ? (
            events?.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                user={user}
                openLogin={openLogin}
              />
            ))
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
export default MyfavoriteEvent;
