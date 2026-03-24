import { CircularProgress } from "@mui/material";

const LoadingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="relative flex items-center justify-center">
        <CircularProgress size={80} thickness={3} sx={{ color: "#16a34a" }} />

        {/* Logo hoặc Icon nằm giữa vòng xoay (Tùy chọn) */}
        {/* <div className="absolute">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-10 h-10 animate-pulse" 
            onError={(e) => e.target.style.display = 'none'} // Ẩn nếu chưa có file logo
          />
        </div> */}
      </div>

      <h2 className="mt-6 text-xl font-semibold text-slate-700 animate-pulse">
        Đang chuẩn bị dữ liệu...
      </h2>
      <p className="mt-2 text-sm text-slate-500">Vui lòng đợi trong giây lát</p>
    </div>
  );
};

export default LoadingPage;
