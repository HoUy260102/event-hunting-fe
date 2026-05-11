import React, { useEffect, useRef } from "react";
import svgPanZoom from "svg-pan-zoom";
const SeatGrid = ({
  svgContent,
  selectedSeats = [],
  bookedSeats = [],
  onSeatClick,
}) => {
  const containerRef = useRef(null);
  const panZoomRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    panZoomRef.current = svgPanZoom(svg, {
      zoomEnabled: true,
      controlIconsEnabled: false,
      fit: true,
      center: true,
      minZoom: 0.5,
      maxZoom: 6,
    });
  }, [svgContent]);
  const handleZoomIn = () => panZoomRef.current?.zoomIn();
  const handleZoomOut = () => panZoomRef.current?.zoomOut();
  const handleReset = () => {
    panZoomRef.current?.resetZoom();
    panZoomRef.current?.center();
  };
  // update trạng thái ghế
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;
    const seats = containerRef.current.querySelectorAll('g[id^="seat-"]');

    seats.forEach((seat) => {
      if (!seat.querySelector(".seat-check")) {
        const circle = seat.querySelector("circle");
        if (circle) {
          const cx = circle.getAttribute("cx");
          const cy = circle.getAttribute("cy");
          const check = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          check.setAttribute("class", "seat-check");
          check.setAttribute("d", "M-3 0 L0 3 L4 -3");
          check.setAttribute("stroke", "white");
          check.setAttribute("stroke-width", "1.8");
          check.setAttribute("fill", "none");
          check.setAttribute("transform", `translate(${cx}, ${cy})`);
          seat.appendChild(check);
        }
      }

      if (!seat.querySelector(".booked-slash")) {
        const circle = seat.querySelector("circle");
        if (circle) {
          const cx = circle.getAttribute("cx");
          const cy = circle.getAttribute("cy");
          const slash = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          slash.setAttribute("class", "booked-slash");
          slash.setAttribute("d", "M-4 4 L4 -4");
          slash.setAttribute("stroke", "grey");
          slash.setAttribute("stroke-width", "1");
          slash.setAttribute("stroke-linecap", "round");
          slash.setAttribute("transform", `translate(${cx}, ${cy})`);
          seat.appendChild(slash);
        }
      }
    });
  }, [svgContent]);
  useEffect(() => {
    if (!containerRef.current) return;
    const seats = containerRef.current.querySelectorAll('g[id^="seat-"]');
    seats.forEach((seat) => {
      const seatId = seat.id;
      seat.classList.remove("selected-seat");
      seat.classList.remove("booked-seat");
      if (bookedSeats.includes(seatId)) {
        seat.classList.add("booked-seat");
      }
      if (selectedSeats.includes(seatId)) {
        seat.classList.add("selected-seat");
      }
    });
  }, [selectedSeats, bookedSeats]);

  const handleSvgClick = (e) => {
    const seatElement = e.target.closest('g[id^="seat-"]');
    if (!seatElement) return;
    const seatId = seatElement.id;
    if (bookedSeats.includes(seatId)) return;
    onSeatClick(seatId);
  };
  return (
    <div className="bg-white h-full rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold">Chọn vị trí ghế</h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#D9D9D9]" />
            Trống
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#57D629]" />
            Đang chọn
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gray-400/70 border border-gray-300 relative overflow-hidden flex items-center justify-center">
              <svg
                viewBox="0 0 16 16"
                className="absolute top-0 left-0 w-full h-full text-white/90"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="16"
                  x2="16"
                  y2="0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="grey"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Đã bán</span>
          </div>
        </div>
      </div>

      {/* SVG */}
      <div className="w-full pb-4 flex justify-center relative">
        <div
          ref={containerRef}
          onClick={handleSvgClick}
          className="seat-svg-container flex justify-center items-center w-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white shadow-md border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-700 font-bold active:scale-90 transition-all"
            title="Phóng to"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white shadow-md border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-700 font-bold active:scale-90 transition-all"
            title="Thu nhỏ"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-10 h-10 bg-white shadow-md border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-500 active:scale-90 transition-all"
            title="Về ban đầu"
          >
            <span className="material-symbols-outlined text-sm">
              restart_alt
            </span>
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`

        .seat-svg-container g[id^="seat-"] {
          cursor: pointer;
          transition: all 0.2s;
        }

        .seat-svg-container g[id^="seat-"] circle {
          fill: #D9D9D9;
          transition: fill 0.2s;
        }

        .seat-svg-container g[id^="seat-"] path[id^="text"] {
          display: block;
          pointer-events: none;
        }

        .seat-check, .booked-slash {
          display: none;
          pointer-events: none;
        }

        .seat-svg-container g[id^="seat-"]:hover {
          filter: brightness(0.95);
        }

        .booked-seat {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .booked-seat circle {
          fill: #94a3b8 !important;
        }

        .booked-seat path[id^="text"] {
          display: none !important;
        }
        
        .booked-seat .booked-slash {
          display: block !important; 
        }

        .selected-seat circle {
          fill: #57D629 !important;
        }

        .selected-seat path[id^="text"] {
          display: none !important;
        }

        .selected-seat .seat-check {
          display: block !important;
        }

        .seat-svg-container {
          display: flex;
          justify-content: center;
        }

        .seat-svg-container svg {
          width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default SeatGrid;
