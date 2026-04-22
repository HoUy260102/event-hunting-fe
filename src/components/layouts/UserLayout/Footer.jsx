import React from "react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative w-full border-t border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
      {/* Hiệu ứng gradient mờ ở góc (Nocturnal Spotlight) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(circle at top left, #3f3f46 0%, transparent 70%)",
        }}
      ></div>

      <div className="relative z-10 max-w-full mx-auto px-8 py-12 md:px-16 flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Cột 1: Branding & Tagline */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white uppercase tracking-wider">
              Event Hunting
            </span>
            <span className="text-[10px] text-zinc-500 tracking-[0.2em] mt-1 font-medium">
              by VNPAY
            </span>
          </div>
          <div className="max-w-xs">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Nền tảng quản lý và phân phối vé sự kiện hàng đầu Việt Nam.
            </p>
          </div>
          <div className="pt-2">
            <p className="text-xs text-zinc-500 opacity-70">
              © 2026 Công ty TNHH EventHunting. All rights reserved.
            </p>
          </div>
          {/* Social Icons */}
          <div className="flex gap-4 pt-2">
            <a
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              href="#"
            >
              <span
                className="material-symbols-outlined !text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                social_leaderboard
              </span>
            </a>
            <a
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              href="#"
            >
              <span
                className="material-symbols-outlined !text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_circle
              </span>
            </a>
          </div>
        </div>

        {/* Cột 2: Thông tin doanh nghiệp */}
        <div className="flex-[1.5] space-y-6">
          <h3 className="text-sm font-bold text-zinc-200 tracking-wide uppercase">
            Thông tin doanh nghiệp
          </h3>
          <div className="space-y-4">
            <p className="text-base text-zinc-100 font-bold">
              Công ty TNHH Event Hunting
            </p>
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Địa chỉ: Thành phố Huế.
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-zinc-800/50">
            {[
              "Điều khoản sử dụng",
              "Chính sách bảo mật",
              "Quy chế hoạt động",
              "Liên hệ",
            ].map((item) => (
              <a
                key={item}
                className="text-xs text-zinc-500 hover:text-zinc-200 hover:underline transition-all"
                href="#"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Cột 3: Compliance & Apps */}
        <div className="flex-1 flex flex-col md:items-end gap-6">
          <div className="flex flex-col md:items-end gap-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-1">
              Tải ứng dụng tại
            </p>
            <div className="flex gap-3 flex-col">
              <button className="h-10 bg-zinc-900 rounded-lg flex items-center border border-zinc-800 hover:bg-zinc-800 transition-colors">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="App Store" 
                  className="h-10 w-auto"
                />
                <div className="flex flex-col items-center leading-none w-30">
                  <span className="text-[8px] text-zinc-500 uppercase">
                    Download on
                  </span>
                  <span className="text-[12px] text-zinc-100 font-bold">
                    App Store
                  </span>
                </div>
              </button>
              <button className="h-10 bg-zinc-900 rounded-lg flex items-center border border-zinc-800 hover:bg-zinc-800 transition-colors">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Google Play Store" 
                  className="h-10 w-auto"
                />
                <div className="flex flex-col items-center leading-none w-30">
                  <span className="text-[8px] text-zinc-500 uppercase">
                    Get it on
                  </span>
                  <span className="text-[12px] text-zinc-100 font-bold">
                    Google Play
                  </span>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="mt-4 flex items-center justify-between gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-full border border-zinc-700 text-zinc-400 hover:text-white transition-all group"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Back to Top
            </span>
            <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-y-1">
              arrow_upward
            </span>
          </button>
        </div>
      </div>

      <div className="mx-8 md:mx-16 border-t border-zinc-800/50 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">
            Operational in Vietnam
          </p>
        </div>
        <div className="flex gap-4 opacity-40 grayscale">
          <span className="material-symbols-outlined text-lg text-zinc-400">
            credit_card
          </span>
          <span className="material-symbols-outlined text-lg text-zinc-400">
            payments
          </span>
          <span className="material-symbols-outlined text-lg text-zinc-400">
            account_balance
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
