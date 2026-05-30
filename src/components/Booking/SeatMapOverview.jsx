import React, { useEffect, useRef } from "react";
import svgPanZoom from "svg-pan-zoom";

const SeatMapOverview = ({
  svgContent,
  onSectionClick,
  selectedSectionId,
  soldOutSectionIds,
}) => {
  console.log(soldOutSectionIds);
  const handleSvgClick = (e) => {
    const sectionElement = e.target.closest('g[id^="section-"]');
    if (sectionElement) {
      const sectionId = sectionElement.id;
      onSectionClick(sectionId);
    }
  };
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
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;
    const sections = containerRef.current.querySelectorAll('g[id^="section-"]');
    sections.forEach((section) => {
      const sectionId = section.id;
      if (soldOutSectionIds && soldOutSectionIds.includes(sectionId)) {
        section.classList.add("sold-out");
      } else {
        section.classList.remove("sold-out");
      }
    });
  }, [svgContent, soldOutSectionIds]);
  const soldOutSelector =
    soldOutSectionIds && soldOutSectionIds.length > 0
      ? soldOutSectionIds.map((id) => `.svg-container #${id}`).join(", ")
      : null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">map</span>
          Sơ đồ khán đài
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
          Click chọn khu vực
        </span>
      </div>

      <div className="w-full h-[480px] md:h-[550px] bg-gray-50 rounded-lg border border-dashed border-gray-200 relative overflow-hidden flex items-center justify-center p-4">
        <div
          ref={containerRef}
          onClick={handleSvgClick}
          className="w-full h-full flex items-center justify-center svg-container"
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

      {/* Style để highlight khu vực đang chọn thông qua ID */}
      <style>{`
        .svg-container {
          display: flex;
          justify-content: center;
        }
        .svg-container svg {
          width: 100%;
          height: 100%;
        }
        .svg-container g[id^="section-"] {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .svg-container g[id^="section-"]:hover {
          filter: brightness(0.8);
        }
        ${
          soldOutSelector
            ? `
          /* 1. Nhuộm xám toàn bộ thẻ <g> (fill, background, stroke) */
          ${soldOutSelector} {
            fill: #4B5563 !important; 
            opacity: 0.5;
            cursor: not-allowed !important;
            pointer-events: none; 
          }
          ${soldOutSelector} * {
            fill: #4B5563 !important;
            stroke: #9ca3af !important; 
          }
        `
            : ""
        }
        /* Highlight khu vực đang chọn */
        ${
          selectedSectionId
            ? `
          .svg-container #${selectedSectionId} {
            stroke-width: 1px;
            filter: brightness(0.7);
          }
        `
            : ""
        }
      `}</style>
    </div>
  );
};

export default SeatMapOverview;
