import React, { useState } from "react";

const TicketQuantityCard = ({ ticketType, onUpdateCart, quan = 0 }) => {
  const [quantity, setQuantity] = useState(quan);
  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Thiết kế Cuống Vé Stub Vật Lý Cao Cấp */}
      <div className="relative bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(16,185,129,0.03)] group">
        {/* Lỗ khoét răng cưa ở biên trên/dưới */}
        <div className="absolute left-[72%] -translate-x-1/2 -top-[12px] w-6 h-6 bg-slate-50 border border-slate-100 rounded-full z-10 hidden md:block"></div>
        <div className="absolute left-[72%] -translate-x-1/2 -bottom-[12px] w-6 h-6 bg-slate-50 border border-slate-100 rounded-full z-10 hidden md:block"></div>
        
        <div className="flex flex-col md:flex-row items-stretch">
          {/* PHẦN THÂN VÉ (TICKET BODY) - CHIẾM 72% */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6 md:border-r-2 md:border-dashed md:border-slate-100/80 relative">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {ticketType?.seatingType || "Vé Tham Dự"}
                </span>
                <span className="text-slate-300 text-xs">|</span>
                <span className="text-slate-400 text-xs font-black uppercase tracking-wider">Hạng Vé</span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 mt-4 tracking-tight">
                {ticketType?.name}
              </h3>
              
              {ticketType?.tierDescription ? (
                <p className="text-slate-400 text-xs mt-2.5 font-semibold leading-relaxed max-w-md">
                  {ticketType?.tierDescription}
                </p>
              ) : (
                <p className="text-slate-400 text-xs mt-2.5 font-semibold leading-relaxed max-w-md italic">
                  Vé tham dự suất diễn chính thức của sự kiện. Vui lòng chọn số lượng để tiếp tục đặt vé.
                </p>
              )}
            </div>

            {/* Mức giá */}
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-baseline gap-2">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Đơn giá:</span>
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                {ticketType?.tierPrice?.toLocaleString()}đ
              </span>
            </div>
          </div>

          {/* PHẦN CUỐNG VÉ (TICKET STUB) - CHIẾM 28% */}
          <div className="md:w-[28%] bg-slate-50/30 p-6 md:p-8 flex flex-col justify-center items-center gap-6 shrink-0 relative">
            <div className="text-center w-full">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block mb-2">Số lượng vé</span>
              
              <div className="flex items-center justify-between bg-white rounded-2xl p-1 border border-slate-200/80 shadow-sm max-w-[150px] mx-auto">
                <button
                  type="button"
                  onClick={decrement}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg font-bold">remove</span>
                </button>

                <div className="w-10 text-center font-black text-base text-slate-800">
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={increment}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg font-bold">add</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onUpdateCart(ticketType, quantity);
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-[0_6px_18px_rgba(16,185,129,0.2)] text-white font-black py-3.5 px-6 rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest shadow-md shadow-emerald-100"
            >
              <span>Chọn vé</span>
              <span className="material-symbols-outlined text-sm font-bold">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hướng dẫn & Quy định đặt vé thực tế */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] p-6 md:p-8 space-y-5">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
          <span className="material-symbols-outlined text-emerald-500 text-lg">info</span>
          Thông tin và Hướng dẫn đặt vé
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-xl font-bold">looks_one</span>
              <h5 className="text-slate-800 text-xs font-black uppercase tracking-wider">Chọn số lượng</h5>
            </div>
            <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
              Tùy chỉnh số lượng vé bạn muốn mua tại cuống vé bên trên, sau đó ấn nút <strong>Chọn vé</strong> để đưa vào giỏ hàng.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-xl font-bold">looks_two</span>
              <h5 className="text-slate-800 text-xs font-black uppercase tracking-wider">Thông tin liên hệ</h5>
            </div>
            <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
              Điền chính xác Họ tên, Email và Số điện thoại tại bước tiếp theo để hệ thống gửi vé điện tử (E-ticket) về cho bạn.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-xl font-bold">looks_3</span>
              <h5 className="text-slate-800 text-xs font-black uppercase tracking-wider">Thanh toán an toàn</h5>
            </div>
            <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
              Thực hiện thanh toán trực tuyến bảo mật thông qua cổng thanh toán VNPay trong thời gian quy định của phiên giao dịch.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 space-y-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">help</span>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              <strong>Hỗ trợ trực tuyến:</strong> Nếu gặp bất kỳ khó khăn nào trong quá trình giao dịch, vui lòng liên hệ Bộ phận Chăm sóc Khách hàng của Event Hunting qua Hotline: <strong className="text-emerald-600">1900 xxxx</strong> hoặc Email: <strong className="text-emerald-600">support@eventhunting.com</strong> để được hỗ trợ tức thì.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketQuantityCard;
