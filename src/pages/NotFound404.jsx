import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound404 = () => {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-[#e7e5e5] bg-[#0e0e0e] min-h-screen flex flex-col">
      <style>
        {`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
          }
          .glow-effect {
            box-shadow: 0 0 40px rgba(198, 198, 199, 0.05);
          }
        `}
      </style>

      {/* Main Content */}
      <main className="flex-grow pt-16 flex items-center justify-center overflow-hidden relative">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#252626] rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1f2020] rounded-full blur-[150px] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visual Anchor (The 403 Graphic) */}
            <div className="flex justify-center md:justify-end order-2 md:order-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#c6c6c7]/5 rounded-full blur-3xl group-hover:bg-[#c6c6c7]/10 transition-all duration-700"></div>
                <div className="relative flex flex-col items-center">
                  <span className="text-[12rem] md:text-[16rem] font-extrabold leading-none tracking-tighter text-[#252626] select-none opacity-40">
                    404
                  </span>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1f2020]/80 backdrop-blur-xl p-8 rounded-full border border-[#474848]/20 shadow-2xl">
                    <span
                      className="material-symbols-outlined text-7xl md:text-8xl text-[#c6c6c7]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      lock
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Textual Information */}
            <div className="flex flex-col gap-8 order-1 md:order-2 text-center md:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7f2927]/10 border border-[#7f2927]/20 text-[#bb5551] text-xs uppercase tracking-widest font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ee7d77] animate-pulse"></span>
                  PAGE NOT FOUND
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#e7e5e5] tracking-tight leading-tight">
                  Trang này không tồn tại
                </h2>
                <p className="text-[#acabab] text-base md:text-lg max-w-md leading-relaxed">
                  Có vẻ như đường dẫn đã bị thay đổi hoặc không còn tồn tại.
                  Đừng lo, bạn có thể quay lại trang chủ để tiếp tục tìm kiếm sự
                  kiện nhé!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button
                  onClick={() => navigate("/")}
                  className="group relative px-8 py-4 bg-[#c6c6c7] text-[#3f4041] font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(198,198,199,0.2)] active:scale-95 w-full sm:w-auto"
                >
                  <span className="relative z-10">Quay lại Trang chủ</span>
                  <div className="absolute inset-0 bg-[#3f4041]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>

              {/* Meta details */}
              <div className="pt-8 border-t border-[#474848]/10 mt-4">
                <div className="flex flex-col gap-1 text-[10px] text-[#757575] uppercase tracking-[0.2em]">
                  <span>Error Code: HTTP_404_NOTFOUND</span>
                  <span>Timestamp: {new Date().toISOString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound404;
