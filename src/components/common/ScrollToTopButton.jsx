import React, { useState, useEffect } from "react";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Toggle button visibility based on scroll distance
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Smooth scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const bounceAnimationStyles = `
    @keyframes gentle-bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }
    .animate-gentle-bounce {
      animation: gentle-bounce 2s ease-in-out infinite;
    }
  `;

  return (
    <>
      <style>{bounceAnimationStyles}</style>
      <button
        type="button"
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-[9999] h-12 w-12 rounded-full bg-[#1DB954]/85 backdrop-blur-md text-black shadow-[0_0_22px_rgba(29,185,84,0.65)] hover:shadow-[0_0_35px_rgba(29,185,84,0.95)] hover:bg-[#1ed760] hover:scale-105 active:scale-[0.92] transition-all duration-300 ease-out flex items-center justify-center border border-[#1DB954]/50 opacity-95 hover:opacity-100 group ${
          isVisible
            ? "translate-y-0 scale-100 pointer-events-auto"
            : "translate-y-8 scale-90 pointer-events-none !opacity-0"
        }`}
        aria-label="Cuộn lên đầu trang"
      >
        <span className="material-symbols-outlined text-[26px] font-bold animate-gentle-bounce">
          arrow_upward
        </span>
      </button>
    </>
  );
}

export default ScrollToTopButton;
