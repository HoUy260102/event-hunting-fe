import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { useParams } from "react-router-dom";
import StatusBadge from "../../../components/common/StatusBadge";

function InfoEventInfor() {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await axiosClient.get(`/events/${id}`);
        setEventData(eventRes.data);
        if (eventRes.data?.user) {
          setOwner(eventRes.data.user);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sự kiện:", error.message);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const STATUS_CONFIG = {
    DRAFT: {
      label: "Nháp",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
    PENDING: {
      label: "Chờ duyệt",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      dot: "bg-yellow-500",
    },
    APPROVED: {
      label: "Đã duyệt",
      color: "bg-green-100 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    PUBLISHED: {
      label: "Đã công khai",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "bg-orange-100 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
    },
    REJECTED: {
      label: "Bị từ chối",
      color: "bg-red-100 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  };

  if (!eventData) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* SECTION: Trạng thái */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-900">
            Trạng thái sự kiện:
          </label>
          <div className="relative mt-2">
            <StatusBadge
              status={eventData.status}
              options={STATUS_CONFIG}
              readOnly={true}
            />
          </div>
        </div>
      </section>

      {/* SECTION: Hình ảnh */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <label className="block text-sm font-semibold text-slate-900">
            Hình ảnh sự kiện
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[400px]">
          <div className="md:col-span-4 lg:col-span-3">
            <div className="md:h-full h-[250px] relative overflow-hidden border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center">
              {eventData.poster?.url ? (
                <img
                  src={eventData.poster.url}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Poster"
                />
              ) : (
                <span className="text-slate-400 text-sm">Không có poster</span>
              )}
            </div>
            <p className="text-center text-xs text-slate-500 mt-2 font-medium">Ảnh Poster</p>
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <div className="md:h-full h-[250px] relative overflow-hidden border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center">
              {eventData.banner?.url ? (
                <img
                  src={eventData.banner.url}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Banner"
                />
              ) : (
                <span className="text-slate-400 text-sm">Không có banner</span>
              )}
            </div>
            <p className="text-center text-xs text-slate-500 mt-2 font-medium">Ảnh Banner</p>
          </div>
        </div>
      </section>

      {/* SECTION: Thông tin cơ bản */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-900">Tên sự kiện</label>
          <div className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 text-sm font-medium">
            {eventData.name}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Tên địa điểm</label>
            <div className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 text-sm">
              {eventData.location}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Địa chỉ</label>
            <div className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 text-sm">
              {eventData.address || "N/A"}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Tỉnh / Thành</label>
            <div className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 text-sm">
              {eventData.province?.name}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Thể loại</label>
            <div className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 text-sm">
              {eventData.category?.name}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Mô tả sự kiện */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label className="block text-sm font-semibold mb-4 text-slate-900">Thông tin sự kiện</label>
        <div
          className="ck-content border border-slate-100 rounded-lg p-6 bg-slate-50 min-h-[200px]"
          dangerouslySetInnerHTML={{ __html: eventData.descriptionHtml || "<p class='text-slate-400 italic'>Không có mô tả</p>" }}
        />
      </section>

      {/* SECTION: Người sở hữu */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <label className="block text-sm font-semibold text-slate-900">Người sở hữu</label>
        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            {owner?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{owner?.name || "N/A"}</p>
            <p className="text-xs text-slate-500">{owner?.email || "ID: " + eventData.userId}</p>
          </div>
        </div>
      </section>

      {/* SECTION: Thông tin ban tổ chức */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label className="block text-sm font-semibold mb-6 text-slate-900">Thông tin ban tổ chức</label>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[200px] shrink-0">
            <div className="h-[200px] border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center relative overflow-hidden">
              {eventData.organizerLogo?.url ? (
                <img
                  src={eventData.organizerLogo.url}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Logo BTC"
                />
              ) : (
                <span className="text-slate-400 text-xs">Không có logo</span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Tên ban tổ chức</label>
              <div className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 text-sm font-medium">
                {eventData.organizerName}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Giới thiệu ban tổ chức</label>
              <div className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 text-sm whitespace-pre-wrap min-h-[100px]">
                {eventData.organizerInfo}
              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        /* CKEditor 5 Content Styles */
        .ck-content {
          font-family: inherit;
          line-height: 1.6;
          color: #334155;
        }
        .ck-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .ck-content h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .ck-content p { margin-bottom: 1rem; }
        .ck-content ul, .ck-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .ck-content ul { list-style-type: disc; }
        .ck-content ol { list-style-type: decimal; }
        
        /* Alignment */
        .ck-content .text-align-center { text-align: center; }
        .ck-content .text-align-left { text-align: left; }
        .ck-content .text-align-right { text-align: right; }
        .ck-content .text-align-justify { text-align: justify; }

        /* Images */
        .ck-content figure.image {
          margin: 1rem auto !important;
          display: table !important;
          clear: both;
        }
        .ck-content figure.image img {
          display: block;
          margin: 0 auto;
          max-width: 100%;
          min-width: 50px;
          border-radius: 8px;
        }
        
        /* Fix for images inside aligned paragraphs (Tailwind Preflight override) */
        .ck-content p img {
          display: inline-block !important;
          vertical-align: middle;
        }

        .ck-content .image-style-align-left,
        .ck-content .image-style-block-align-left {
          float: left;
          margin-right: 1.5rem !important;
        }
        .ck-content .image-style-align-right,
        .ck-content .image-style-block-align-right {
          float: right;
          margin-left: 1.5rem !important;
        }
        .ck-content .image-style-align-center,
        .ck-content .image-style-block-align-center {
          margin-left: auto !important;
          margin-right: auto !important;
          display: table !important;
          text-align: center;
        }
        
        /* Table */
        .ck-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .ck-content table td, .ck-content table th {
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
        }

        .ck-content blockquote {
          border-left: 4px solid #10b981;
          padding-left: 1rem;
          font-style: italic;
          color: #64748b;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

export default InfoEventInfor;
