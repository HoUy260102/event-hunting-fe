import React from "react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative w-full border-t border-zinc-900 bg-zinc-950 shadow-2xl overflow-hidden">
      {/* Hiệu ứng gradient mờ ở góc (Nocturnal Spotlight) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 select-none"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at bottom right, rgba(63, 63, 70, 0.15) 0%, transparent 60%)",
        }}
      ></div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-16 md:px-12 grid grid-cols-1 sm:grid-cols-2 gap-12 lg:flex lg:flex-row lg:justify-between lg:gap-0 w-full">
        {/* Cột 1: Branding & Tagline */}
        <div className="w-full lg:w-[28%] space-y-6">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white uppercase tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Event Hunting
            </span>
            <span className="text-[9px] text-emerald-400 tracking-[0.25em] mt-1 font-extrabold uppercase">
              BY VNPAY
            </span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
            Nền tảng quản lý, đặt vé và phân phối sự kiện hàng đầu Việt Nam. Kiến tạo trải nghiệm săn vé hiện đại, bảo mật và trọn vẹn nhất.
          </p>
          {/* Social Icons */}
          <div className="flex gap-3 pt-2">
            {[
              { icon: "public", label: "Website", url: "#" },
              { icon: "play_circle", label: "YouTube", url: "#" },
              { icon: "chat", label: "Zalo", url: "#" }
            ].map((social) => (
              <a
                key={social.icon}
                className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 shadow-md hover:scale-110 active:scale-95 group"
                href={social.url}
                title={social.label}
              >
                <span className="material-symbols-outlined text-xl group-hover:rotate-[10deg] transition-transform">
                  {social.icon}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Cột 2: Khám phá Sự kiện */}
        <div className="w-full lg:w-[20%] space-y-6">
          <h3 className="text-xs font-bold text-zinc-200 tracking-widest uppercase border-l-2 border-emerald-500 pl-3">
            Khám phá sự kiện
          </h3>
          <nav className="flex flex-col gap-3">
            {[
              "Liveshow & Concert",
              "Sân khấu & Kịch",
              "Triển lãm Nghệ thuật",
              "Hội thảo & Talkshow"
            ].map((category) => (
              <span
                key={category}
                className="text-xs text-zinc-400 font-medium"
              >
                {category}
              </span>
            ))}
          </nav>
        </div>

        {/* Cột 3: Hỗ trợ & Quy định */}
        <div className="w-full lg:w-[20%] space-y-6">
          <h3 className="text-xs font-bold text-zinc-200 tracking-widest uppercase border-l-2 border-emerald-500 pl-3">
            Chính sách & Hỗ trợ
          </h3>
          <nav className="flex flex-col gap-3">
            {[
              { name: "Điều khoản sử dụng", url: "#" },
              { name: "Chính sách bảo mật", url: "#" },
              { name: "Quy chế hoạt động", url: "#" },
              { name: "Liên hệ hỗ trợ", url: "#" }
            ].map((policy) => (
              <a
                key={policy.name}
                className="text-xs text-zinc-400 hover:text-emerald-400 hover:translate-x-1.5 transition-all duration-300 w-fit font-medium"
                href={policy.url}
              >
                {policy.name}
              </a>
            ))}
          </nav>
        </div>

        {/* Cột 4: Tải app & Back to Top */}
        <div className="w-full lg:w-[22%] space-y-6 flex flex-col">
          <div className="w-full">
            <h3 className="text-xs font-bold text-zinc-200 tracking-widest uppercase border-l-2 border-emerald-500 pl-3 mb-4">
              Tải ứng dụng tại
            </h3>
            <div className="flex flex-row gap-3">
              <a
                href="#"
                className="inline-block h-10 transition-all duration-300 hover:scale-[1.04] active:scale-[0.96] w-fit"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store" 
                  className="h-full w-auto opacity-80 hover:opacity-100 transition-opacity rounded-lg"
                />
              </a>
              <a
                href="#"
                className="inline-block h-10 transition-all duration-300 hover:scale-[1.04] active:scale-[0.96] w-fit"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  className="h-full w-auto opacity-80 hover:opacity-100 transition-opacity rounded-lg"
                />
              </a>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center justify-between gap-3 px-5 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 rounded-xl border border-zinc-800/80 hover:border-emerald-500/30 text-zinc-400 hover:text-white transition-all duration-300 group hover:scale-[1.03] active:scale-[0.97] shadow-lg mt-2 w-fit"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Lên đầu trang
            </span>
            <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-y-1">
              arrow_upward
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Operational status & Copyright */}
      <div className="max-w-[1440px] mx-auto px-6 pb-8">
        <div className="border-t border-zinc-900 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-extrabold">
                Operational in Vietnam
              </p>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              © 2026 Công ty TNHH EventHunting. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 opacity-25 grayscale hover:opacity-65 hover:grayscale-0 transition-all duration-500">
            <span className="material-symbols-outlined text-lg text-zinc-450">
              credit_card
            </span>
            <span className="material-symbols-outlined text-lg text-zinc-450">
              payments
            </span>
            <span className="material-symbols-outlined text-lg text-zinc-450">
              account_balance
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
