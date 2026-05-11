import React from 'react';
import { useNavigate } from 'react-router-dom';

const GeneralError = ({ 
  errorCode = "500", 
  title = "Đã có lỗi xảy ra", 
  message = "Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau hoặc quay lại trang chủ." 
}) => {
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
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .error-glow {
            box-shadow: 0 0 50px rgba(74, 222, 128, 0.05);
          }
        `}
      </style>

      <main className="flex-grow pt-16 flex items-center justify-center overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#252626] rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#131313] to-transparent opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-8 w-full">
          <div className="flex flex-col items-center text-center">
            
            {/* Visual Anchor: Warning Icon with animated glow */}
            <div className="relative mb-12 animate-float">
              <div className="absolute inset-0 bg-[#4ade80]/10 rounded-full blur-3xl"></div>
              <div className="relative bg-[#1f2020] p-10 rounded-3xl border border-[#474848]/20 shadow-2xl">
                <span className="material-symbols-outlined text-8xl text-[#4ade80]" style={{ fontVariationSettings: "'FILL' 0" }}>
                  running_with_errors
                </span>
              </div>
              {/* Decorative particles */}
              <div className="absolute -top-4 -right-4 w-4 h-4 bg-[#4ade80] rounded-full opacity-40 blur-sm"></div>
              <div className="absolute -bottom-2 -left-6 w-3 h-3 bg-[#474848] rounded-full opacity-60"></div>
            </div>

            {/* Error Content */}
            <div className="space-y-6 max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4ade80]/5 border border-[#4ade80]/10 text-[#4ade80] text-xs uppercase tracking-[0.2em] font-bold">
                Error Code: {errorCode}
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-[#e7e5e5] tracking-tight">
                {title}
              </h2>
              
              <p className="text-[#acabab] text-lg leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-[#252626] text-[#e7e5e5] font-bold rounded-xl border border-[#474848]/30 hover:bg-[#2b2c2c] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Thử tải lại trang
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-[#e7e5e5] text-[#0e0e0e] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(231,229,229,0.2)] transition-all active:scale-95"
              >
                Về lại trang chủ
              </button>
            </div>

            {/* Bottom Support Info */}
            <p className="mt-16 text-[#474848] text-sm flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-sm">contact_support</span>
              Nếu sự cố tiếp diễn, vui lòng báo lỗi qua hotline 1900 6408
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeneralError;