import React, { useEffect, useState } from "react";
import TicketCard from "../../components/common/TicketCard";
import axiosClient from "../../api/axiosClient";
import TicketSkeleton from "../../components/common/TicketSkeleton";
import PaginationV2 from "../../components/common/PaginationV2";
import ProfileSidebar from "./ProfileSidebar";

const MyTickets = () => {
  useEffect(() => {
    document.title = "Vé của tôi | Event Hunting";
    return () => {
      document.title = "Event Hunting";
    };
  }, []);

  // Dữ liệu mẫu
  const [isFinished, setIsFinished] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/tickets/my-tickets`, {
          params: {
            pageNumber: pageNumber,
            isFinished: isFinished,
            size: 4,
          },
        });
        if (!ignore) {
          setTickets(res?.data?.content || []);
          setTotalElements(res?.data?.totalElements || 0);
          setTotalPages(res?.data?.totalPages || 0);
        }
      } catch (error) {
        console.error("Lỗi khi lấy vé:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    }
  }, [isFinished, pageNumber]);

  const handleTabChange = (status) => {
    setIsFinished(status);
    setPageNumber(1);
  };

  const handlePagination = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 768px) {
        .ticket-notches::before,
        .ticket-notches::after {
            content: '';
            position: absolute;
            left: 25%;
            width: 32px;
            height: 32px;
            background-color: #0A0A0A; 
            border-radius: 50%;
            z-index: 10;
            transform: translateX(-50%);
        }
        .ticket-notches::before { top: -16px; }
        .ticket-notches::after { bottom: -16px; }
        .ticket-divider {
            position: absolute;
            left: 25%;
            top: 24px;
            bottom: 24px;
            width: 2px;
            background-image: linear-gradient(to bottom, #474848 50%, transparent 50%);
            background-size: 2px 12px;
            transform: translateX(-50%);
        }}
      `,
        }}
      />

      <div className="w-full px-2 py-4 lg:px-6 lg:py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <ProfileSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Section Header */}
          <div className="mb-5">
            <h3 className="border-b border-[#474848]/20 py-5 font-headline text-white text-2xl font-extrabold tracking-tight text-on-surface flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#2DC275] text-[28px] shrink-0">
                confirmation_number
              </span>
              Vé của tôi
            </h3>
          </div>
          <div className="flex justify-center items-center gap-8 mb-10">
            <button
              onClick={() => {
                handleTabChange(false);
              }}
              className={`pb-4 font-headline text-sm font-bold tracking-tight transition-all relative ${isFinished === false
                  ? "text-[#e7e5e5]"
                  : "text-[#acabab] hover:text-[#e7e5e5]"
                }`}
            >
              Sắp diễn ra
              {isFinished === false && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
              )}
            </button>

            <button
              onClick={() => {
                handleTabChange(true);
              }}
              className={`pb-4 font-headline text-sm font-bold tracking-tight transition-all relative ${isFinished
                  ? "text-[#e7e5e5]"
                  : "text-[#acabab] hover:text-[#e7e5e5]"
                }`}
            >
              Kết thúc
              {isFinished && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
              )}
            </button>
          </div>

          {/* Ticket Card Container */}
          <div className="space-y-8 flex flex-col items-center">
            {loading ? (
              <TicketSkeleton rows={5} />
            ) : tickets.length > 0 ? (
              tickets.map((item) => (
                <TicketCard key={item.id} ticket={item} isFinished={isFinished} />
              ))
            ) : (
              <div className="py-20 text-[#acabab]">Không có vé nào.</div>
            )}
          </div>

          <div className="mt-20">
            <PaginationV2
              currentPage={pageNumber}
              pageSize={4}
              totalPage={totalPages}
              totalElements={totalElements}
              handlePagination={handlePagination}
            ></PaginationV2>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyTickets;
