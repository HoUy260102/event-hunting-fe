import { useEffect, useState, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../hooks/useAuth";
import { toast, ToastContainer } from "react-toastify";
import EmojiPicker from "emoji-picker-react";

const formatRelativeTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 5) return "vừa xong";
  if (diffSec < 60) return `${diffSec} giây trước`;
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 30) return `${diffDay} ngày trước`;

  return date.toLocaleDateString("vi-VN");
};

// Cấu hình các biểu tượng cảm xúc giống Facebook
const REACTIONS = [
  { type: "LIKE", emoji: "👍", label: "Thích", color: "text-blue-500 font-bold" },
  { type: "LOVE", emoji: "❤️", label: "Yêu thích", color: "text-red-500 font-bold" },
  { type: "HAHA", emoji: "😆", label: "Haha", color: "text-yellow-500 font-bold" },
  { type: "WOW", emoji: "😮", label: "Wow", color: "text-yellow-400 font-bold" },
  { type: "SAD", emoji: "😢", label: "Buồn", color: "text-yellow-400 font-bold" },
  { type: "ANGRY", emoji: "😡", label: "Phẫn nộ", color: "text-red-400 font-bold" },
];

// Chúng ta sử dụng thư viện emoji-picker-react chính thức thay vì danh sách cứng này

function EventComments({ eventId }) {
  const { user, openLogin } = useAuth();
  const [comments, setComments] = useState([]);
  const [nextId, setNextId] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form bình luận cha
  const [newCommentText, setNewCommentText] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]); // [{id, url}]
  const [isUploading, setIsUploading] = useState(false);
  const mainFileInputRef = useRef(null);

  // Danh sách các comment đang được mở phần phản hồi (map parentId -> replyText)
  const [replyInputMap, setReplyInputMap] = useState({});
  // Danh sách ảnh đang tải lên của phần phản hồi (map parentId -> [{id, url}])
  const [replyImagesMap, setReplyImagesMap] = useState({});
  const [replyUploadingMap, setReplyUploadingMap] = useState({});

  // Lưu trữ danh sách reply của từng comment cha
  const [repliesMap, setRepliesMap] = useState({}); // parentId -> [replyObj]
  const [repliesNextIdMap, setRepliesNextIdMap] = useState({});
  const [repliesHasNextMap, setRepliesHasNextMap] = useState({});
  const [repliesLoadingMap, setRepliesLoadingMap] = useState({});

  // State xác nhận xóa bình luận (Modal)
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    commentId: null,
    isReply: false,
    parentId: null,
  });

  // State quản lý xem emoji picker nào đang mở ('main' hoặc parentId của reply)
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);

  // 1. Tải bình luận cha ban đầu
  useEffect(() => {
    fetchParentComments(true);
  }, [eventId]);

  const fetchParentComments = async (isInitial = false) => {
    try {
      setIsLoading(true);
      const cursor = isInitial ? "" : nextId;
      const res = await axiosClient.get(`/comments/event/${eventId}`, {
        params: {
          nextId: cursor || undefined,
          size: 5,
        },
      });
      const data = res.data;
      if (isInitial) {
        setComments(data.content || []);
      } else {
        setComments((prev) => [...prev, ...(data.content || [])]);
      }
      setNextId(data.nextId);
      setHasNext(data.hasNext);
    } catch (err) {
      console.error("Lỗi lấy danh sách bình luận:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Tải phản hồi (Replies) của bình luận cha
  const fetchReplies = async (parentId, isLoadMore = false) => {
    try {
      setRepliesLoadingMap((prev) => ({ ...prev, [parentId]: true }));
      const cursor = isLoadMore ? repliesNextIdMap[parentId] : "";
      const res = await axiosClient.get(`/comments/${parentId}/replies`, {
        params: {
          nextId: cursor || undefined,
          size: 5,
        },
      });
      const data = res.data;

      setRepliesMap((prev) => {
        const currentList = prev[parentId] || [];
        return {
          ...prev,
          [parentId]: isLoadMore ? [...currentList, ...(data.content || [])] : (data.content || []),
        };
      });
      setRepliesNextIdMap((prev) => ({ ...prev, [parentId]: data.nextId }));
      setRepliesHasNextMap((prev) => ({ ...prev, [parentId]: data.hasNext }));
    } catch (err) {
      console.error("Lỗi lấy danh sách phản hồi:", err);
    } finally {
      setRepliesLoadingMap((prev) => ({ ...prev, [parentId]: false }));
    }
  };

  // 3. Đăng tải hình ảnh đính kèm (Pending)
  const handleImageUpload = async (e, isParent = true, parentId = null) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Giới hạn tối đa 4 hình ảnh
    const currentCount = isParent ? uploadedImages.length : (replyImagesMap[parentId] || []).length;
    if (currentCount + files.length > 4) {
      toast.warning("Bạn chỉ được tải lên tối đa 4 hình ảnh cho mỗi bình luận.");
      return;
    }

    if (isParent) setIsUploading(true);
    else setReplyUploadingMap((prev) => ({ ...prev, [parentId]: true }));

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "IMAGE");
      formData.append("folder", "COMMENT_IMAGE");

      try {
        const response = await axiosClient.post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const fileData = response.data;
        if (isParent) {
          setUploadedImages((prev) => [...prev, { id: fileData.id, url: fileData.url }]);
        } else {
          setReplyImagesMap((prev) => {
            const list = prev[parentId] || [];
            return { ...prev, [parentId]: [...list, { id: fileData.id, url: fileData.url }] };
          });
        }
      } catch (error) {
        console.error("Lỗi upload hình ảnh:", error);
        toast.error("Tải hình ảnh lên thất bại!");
      }
    }

    if (isParent) {
      setIsUploading(false);
      e.target.value = "";
    } else {
      setReplyUploadingMap((prev) => ({ ...prev, [parentId]: false }));
      const el = document.getElementById(`reply-file-${parentId}`);
      if (el) el.value = "";
    }
  };

  // Xóa ảnh khỏi danh sách chờ
  const removeImage = (index, isParent = true, parentId = null) => {
    if (isParent) {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setReplyImagesMap((prev) => {
        const list = prev[parentId] || [];
        return { ...prev, [parentId]: list.filter((_, i) => i !== index) };
      });
    }
  };

  // 4. Gửi bình luận cha mới
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() && !uploadedImages.length) return;

    try {
      const fileIds = uploadedImages.map((img) => img.id);
      const res = await axiosClient.post("/comments", {
        eventId,
        content: newCommentText.trim(),
        fileIds,
      });

      // Thêm bình luận mới vào đầu danh sách
      setComments((prev) => [res.data, ...prev]);
      setNewCommentText("");
      setUploadedImages([]);
      toast.success("Bình luận thành công!");
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      toast.error(error.response?.data?.message || "Không thể gửi bình luận.");
    }
  };

  // 5. Gửi bình luận phản hồi (Reply)
  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    const replyText = replyInputMap[parentId] || "";
    const replyImages = replyImagesMap[parentId] || [];
    if (!replyText.trim() && !replyImages.length) return;

    try {
      const fileIds = replyImages.map((img) => img.id);
      const res = await axiosClient.post("/comments", {
        eventId,
        parentId,
        content: replyText.trim(),
        fileIds,
      });

      // Cập nhật danh sách phản hồi cục bộ
      setRepliesMap((prev) => {
        const list = prev[parentId] || [];
        return { ...prev, [parentId]: [...list, res.data] };
      });

      // Cập nhật số lượng phản hồi hiển thị trên UI cha
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, repliesCount: (c.repliesCount || 0) + 1 } : c
        )
      );

      // Reset form reply
      setReplyInputMap((prev) => ({ ...prev, [parentId]: "" }));
      setReplyImagesMap((prev) => ({ ...prev, [parentId]: [] }));
      toast.success("Phản hồi bình luận thành công!");
    } catch (error) {
      console.error("Lỗi gửi phản hồi:", error);
      toast.error(error.response?.data?.message || "Không thể gửi phản hồi.");
    }
  };

  // 6. Thả cảm xúc (Toggle Reaction)
  const handleToggleReaction = async (commentId, reactionType, isReply = false, parentId = null) => {
    if (!user) {
      openLogin();
      return;
    }

    try {
      await axiosClient.post(`/comments/${commentId}/reactions`, { reactionType });

      // Cập nhật trạng thái cục bộ ngay lập tức để UX mượt mà
      const updateReactionState = (item) => {
        if (item.id === commentId) {
          const isLiked = item.liked;
          const currentReaction = item.currentReaction;
          const wasSame = currentReaction === reactionType;

          let newLikesCount = item.likesCount || 0;
          let newLiked = true;
          let newReaction = reactionType;

          if (wasSame) {
            newLikesCount = Math.max(0, newLikesCount - 1);
            newLiked = false;
            newReaction = null;
          } else {
            if (!isLiked) {
              newLikesCount += 1;
            }
          }

          return {
            ...item,
            liked: newLiked,
            currentReaction: newReaction,
            likesCount: newLikesCount,
          };
        }
        return item;
      };

      if (isReply) {
        setRepliesMap((prev) => {
          const list = prev[parentId] || [];
          return { ...prev, [parentId]: list.map(updateReactionState) };
        });
      } else {
        setComments((prev) => prev.map(updateReactionState));
      }
    } catch (err) {
      console.error("Lỗi thả cảm xúc:", err);
    }
  };

  // Mở modal xác nhận xóa
  const triggerDeleteComment = (commentId, isReply = false, parentId = null) => {
    setDeleteConfirmState({
      isOpen: true,
      commentId,
      isReply,
      parentId,
    });
  };

  // 7. Xóa bình luận (Soft Delete) sau khi xác nhận trên Modal
  const executeDeleteComment = async () => {
    const { commentId, isReply, parentId } = deleteConfirmState;
    if (!commentId) return;

    try {
      await axiosClient.delete(`/comments/${commentId}`);

      if (isReply) {
        setRepliesMap((prev) => {
          const list = prev[parentId] || [];
          return { ...prev, [parentId]: list.filter((r) => r.id !== commentId) };
        });
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, repliesCount: Math.max(0, (c.repliesCount || 0) - 1) } : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
      toast.success("Đã xóa bình luận thành công.");
    } catch (err) {
      console.error("Lỗi xóa bình luận:", err);
      toast.error("Bạn không có quyền xóa bình luận này.");
    } finally {
      setDeleteConfirmState({ isOpen: false, commentId: null, isReply: false, parentId: null });
    }
  };

  // RENDER HÌNH ẢNH ĐÍNH KÈM TRONG BÌNH LUẬN
  const renderCommentImages = (images) => {
    if (!images || !images.length) return null;
    const gridCols = images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3";

    return (
      <div className={`grid ${gridCols} gap-2 mt-3 max-w-xl rounded-lg overflow-hidden`}>
        {images.map((img, i) => (
          <div key={img.id || i} className="relative aspect-video bg-neutral-900 group">
            <img
              src={img.url}
              alt="Đính kèm"
              className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all"
              onClick={() => window.open(img.url, "_blank")}
            />
          </div>
        ))}
      </div>
    );
  };

  // COMPONENT NÚT THẢ CẢM XÚC HOVER GIỐNG FACEBOOK
  const ReactionButton = ({ comment, isReply = false, parentId = null }) => {
    const userReaction = REACTIONS.find((r) => r.type === comment.currentReaction);
    const activeLabel = userReaction ? userReaction.label : "Thích";
    const activeColor = userReaction ? userReaction.color : "text-gray-400 hover:text-white";
    const activeEmoji = userReaction ? userReaction.emoji : "👍";

    return (
      <div className="relative group/react flex items-center">
        {/* Nút chính */}
        <button
          type="button"
          onClick={() => handleToggleReaction(comment.id, "LIKE", isReply, parentId)}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded transition-colors ${activeColor}`}
        >
          <span>{activeEmoji}</span>
          <span>{activeLabel}</span>
        </button>

        {/* Floating Reactions Bar (Popup khi Hover) */}
        <div className="absolute bottom-6 left-0 hidden group-hover/react:flex items-center gap-2 px-3 py-2 bg-[#2a2a2e]/95 border border-white/10 rounded-full shadow-2xl backdrop-blur z-50 animate-bounceOnce">
          {REACTIONS.map((react) => (
            <button
              key={react.type}
              type="button"
              onClick={() => handleToggleReaction(comment.id, react.type, isReply, parentId)}
              className="text-2xl hover:scale-135 transition-transform duration-150 ease-out focus:outline-none"
              title={react.label}
            >
              {react.emoji}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#1E1E21] rounded-2xl shadow-xl mt-8 relative">
      {/* Tiêu đề & Tổng số bình luận */}
      <div className="bg-[#2D2D32] px-6 py-4 flex justify-between items-center border-b border-white/5 rounded-t-2xl">
        <h2 className="text-lg font-bold text-[#2DC275] flex items-center gap-2">
          <span className="material-symbols-outlined">forum</span>
          <span>Bình luận & Phản hồi</span>
        </h2>
        {comments.length > 0 && (
          <span className="text-sm font-semibold text-gray-400">
            {comments.length} thảo luận
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* KHU VỰC NHẬP BÌNH LUẬN CHA */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="flex gap-4 items-start">
            <img
              src={user.avatar?.url || "https://api.dicebear.com/7.x/bottts/svg"}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            <div className="flex-1 bg-[#252528] rounded-xl p-3 border border-white/5 focus-within:border-[#2DC275] transition-all">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Viết bình luận công khai..."
                rows="2"
                className="w-full bg-transparent text-white placeholder-gray-500 text-sm border-0 focus:ring-0 resize-none outline-none"
              />

              {/* Previews của ảnh đang chuẩn bị gửi */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {uploadedImages.map((img, index) => (
                    <div key={img.id} className="relative w-16 h-16 rounded overflow-hidden border border-white/10">
                      <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer của khung nhập: Nút ảnh + Nút gửi */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {/* Nút đính kèm ảnh */}
                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current.click()}
                    disabled={isUploading}
                    className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-[#2DC275] transition-colors"
                    title="Đính kèm tối đa 4 ảnh"
                  >
                    <span className="material-symbols-outlined text-[20px]">image</span>
                  </button>

                  {/* Nút chèn Emoji Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveEmojiPicker(activeEmojiPicker === 'main' ? null : 'main')}
                      className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-[#2DC275] transition-colors"
                      title="Chèn biểu tượng cảm xúc"
                    >
                      <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                    </button>

                    {activeEmojiPicker === 'main' && (
                      <div className="absolute top-10 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Backdrop to close picker on click outside */}
                        <div 
                          className="fixed inset-0 z-[-1]" 
                          onClick={() => setActiveEmojiPicker(null)} 
                        />
                        <EmojiPicker
                          theme="dark"
                          width={320}
                          height={380}
                          skinTonesDisabled
                          searchPlaceholder="Tìm biểu tượng..."
                          onEmojiClick={(emojiData) => {
                            setNewCommentText((prev) => prev + emojiData.emoji);
                            setActiveEmojiPicker(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={mainFileInputRef}
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  {isUploading && (
                    <span className="text-xs text-gray-400 animate-pulse">Đang tải ảnh lên...</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={(!newCommentText.trim() && !uploadedImages.length) || isUploading}
                  className="px-4 py-1.5 bg-[#2DC275] text-black font-bold text-xs rounded-lg hover:bg-[#22A05E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Đang tải ảnh..." : "Gửi bình luận"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-[#252528] rounded-xl p-6 text-center border border-dashed border-white/10">
            <p className="text-gray-400 text-sm mb-4">Bạn cần đăng nhập để tham gia bình luận & thả cảm xúc.</p>
            <button
              onClick={openLogin}
              className="px-6 py-2 bg-[#2DC275] text-black font-bold text-sm rounded-xl hover:bg-[#22A05E] transition-all"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* DANH SÁCH BÌNH LUẬN CHA */}
        <div className="space-y-6 pt-4 border-t border-white/5">
          {comments.map((comment) => {
            const hasReplies = comment.repliesCount > 0;
            const isRepliesVisible = repliesMap[comment.id] !== undefined;

            return (
              <div key={comment.id} className="flex gap-4 items-start group/comment">
                {/* Avatar tác giả */}
                <img
                  src={comment.user?.avatar?.url || "https://api.dicebear.com/7.x/bottts/svg"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  {/* Bong bóng bình luận */}
                  <div className="bg-[#252528] rounded-2xl px-4 py-3 w-fit max-w-full">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-extrabold text-sm text-white">
                        {comment.user?.name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>

                    {/* Hiển thị đính kèm ảnh */}
                    {renderCommentImages(comment.images)}
                  </div>

                  {/* Actions Row: Likes count + Reactions Button + Reply Button + Delete Button */}
                  <div className="flex items-center gap-4 mt-1.5 ml-2 flex-wrap">
                    {/* Thả cảm xúc */}
                    <ReactionButton comment={comment} isReply={false} />

                    {/* Nút phản hồi */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          openLogin();
                          return;
                        }
                        // Toggle hiển thị khung phản hồi
                        setReplyInputMap((prev) => ({
                          ...prev,
                          [comment.id]: prev[comment.id] !== undefined ? undefined : "",
                        }));
                        // Tự động load replies nếu chưa load
                        if (!isRepliesVisible && hasReplies) {
                          fetchReplies(comment.id);
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-white font-bold transition-colors"
                    >
                      Phản hồi
                    </button>

                    {/* Tổng số cảm xúc đã thả */}
                    {comment.likesCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>❤️👍</span>
                        <span className="font-semibold">{comment.likesCount}</span>
                      </div>
                    )}

                    {/* Nút xóa (chỉ tác giả của comment) */}
                    {user && user.id === comment.user?.id && (
                      <button
                        type="button"
                        onClick={() => triggerDeleteComment(comment.id, false)}
                        className="text-xs text-red-500 hover:text-red-400 font-bold opacity-0 group-hover/comment:opacity-100 transition-opacity ml-2"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  {/* --- KHU VỰC PHẢN HỒI (REPLIES - CẤP 2) --- */}
                  <div className="mt-4 pl-4 border-l border-white/5 space-y-4">
                    {/* Nút xem thêm phản hồi cũ hơn */}
                    {hasReplies && !isRepliesVisible && (
                      <button
                        type="button"
                        onClick={() => fetchReplies(comment.id)}
                        className="text-xs text-[#2DC275] hover:underline font-bold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">subdirectory_arrow_right</span>
                        Xem {comment.repliesCount} câu trả lời
                      </button>
                    )}

                    {/* Danh sách phản hồi đã tải */}
                    {isRepliesVisible && (repliesMap[comment.id] || []).map((reply) => (
                      <div key={reply.id} className="flex gap-3 items-start group/reply">
                        <img
                          src={reply.user?.avatar?.url || "https://api.dicebear.com/7.x/bottts/svg"}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Bong bóng reply */}
                          <div className="bg-[#2D2D32] rounded-xl px-3 py-2 w-fit max-w-full">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-xs text-white">
                                {reply.user?.name}
                              </span>
                              <span className="text-[9px] text-gray-500">
                                {formatRelativeTime(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 whitespace-pre-wrap">
                              {reply.content}
                            </p>
                            {renderCommentImages(reply.images)}
                          </div>

                          {/* Actions Row của Reply */}
                          <div className="flex items-center gap-3 mt-1 ml-2 flex-wrap">
                            <ReactionButton comment={reply} isReply={true} parentId={comment.id} />

                            {reply.likesCount > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <span>❤️👍</span>
                                <span>{reply.likesCount}</span>
                              </div>
                            )}

                            {user && user.id === reply.user?.id && (
                              <button
                                type="button"
                                onClick={() => triggerDeleteComment(reply.id, true, comment.id)}
                                className="text-[10px] text-red-500 hover:text-red-400 font-bold opacity-0 group-hover/reply:opacity-100 transition-opacity"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Nút Tải thêm câu trả lời (Keyset Load More) */}
                    {isRepliesVisible && repliesHasNextMap[comment.id] && (
                      <button
                        type="button"
                        onClick={() => fetchReplies(comment.id, true)}
                        disabled={repliesLoadingMap[comment.id]}
                        className="text-[11px] text-[#2DC275] hover:underline font-bold pl-11"
                      >
                        {repliesLoadingMap[comment.id] ? "Đang tải phản hồi..." : "Xem thêm phản hồi..."}
                      </button>
                    )}

                    {/* Khung nhập phản hồi (Reply Input) */}
                    {user && replyInputMap[comment.id] !== undefined && (
                      <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="flex gap-3 items-start pt-2">
                        <img
                          src={user.avatar?.url || "https://api.dicebear.com/7.x/bottts/svg"}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                        />
                        <div className="flex-1 bg-[#2D2D32] rounded-xl p-2.5 border border-white/5 focus-within:border-[#2DC275] transition-all">
                          <textarea
                            value={replyInputMap[comment.id]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReplyInputMap((prev) => ({ ...prev, [comment.id]: val }));
                            }}
                            placeholder={`Phản hồi bình luận của ${comment.user?.name}...`}
                            rows="1"
                            className="w-full bg-transparent text-white placeholder-gray-500 text-xs border-0 focus:ring-0 resize-none outline-none"
                          />

                          {/* Previews ảnh reply */}
                          {(replyImagesMap[comment.id] || []).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(replyImagesMap[comment.id] || []).map((img, index) => (
                                <div key={img.id} className="relative w-12 h-12 rounded overflow-hidden border border-white/10">
                                  <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index, false, comment.id)}
                                    className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Footer của Reply Input */}
                          <div className="flex justify-between items-center mt-2 pt-1 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              {/* Nút đính kèm ảnh của Reply */}
                              <button
                                type="button"
                                onClick={() => document.getElementById(`reply-file-${comment.id}`).click()}
                                disabled={replyUploadingMap[comment.id]}
                                className="p-1 hover:bg-white/5 rounded-full text-gray-400 hover:text-[#2DC275] transition-colors"
                                title="Đính kèm tối đa 4 ảnh"
                              >
                                <span className="material-symbols-outlined text-[18px]">image</span>
                              </button>

                              {/* Nút chèn Emoji Popover của Reply */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveEmojiPicker(activeEmojiPicker === comment.id ? null : comment.id)}
                                  className="p-1 hover:bg-white/5 rounded-full text-gray-400 hover:text-[#2DC275] transition-colors"
                                  title="Chèn biểu tượng cảm xúc"
                                >
                                  <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
                                </button>

                                {activeEmojiPicker === comment.id && (
                                  <div className="absolute top-8 left-0 z-50 shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* Backdrop to close picker on click outside */}
                                    <div 
                                      className="fixed inset-0 z-[-1]" 
                                      onClick={() => setActiveEmojiPicker(null)} 
                                    />
                                    <EmojiPicker
                                      theme="dark"
                                      width={280}
                                      height={320}
                                      skinTonesDisabled
                                      searchPlaceholder="Tìm kiếm..."
                                      onEmojiClick={(emojiData) => {
                                        setReplyInputMap((prev) => ({
                                          ...prev,
                                          [comment.id]: (prev[comment.id] || "") + emojiData.emoji,
                                        }));
                                        setActiveEmojiPicker(null);
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                id={`reply-file-${comment.id}`}
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, false, comment.id)}
                              />
                              {replyUploadingMap[comment.id] && (
                                <span className="text-[10px] text-gray-400 animate-pulse">Đang tải ảnh...</span>
                              )}
                            </div>

                            <button
                              type="submit"
                              disabled={(!(replyInputMap[comment.id] || "").trim() && !(replyImagesMap[comment.id] || []).length) || replyUploadingMap[comment.id]}
                              className="px-3 py-1 bg-[#2DC275] text-black font-bold text-[10px] rounded-md hover:bg-[#22A05E] transition-colors disabled:opacity-50"
                            >
                              {replyUploadingMap[comment.id] ? "Đang tải..." : "Phản hồi"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* NÚT TẢI THÊM BÌNH LUẬN CHA (KEYSET LOAD MORE) */}
        {hasNext && (
          <div className="text-center pt-6 border-t border-white/5">
            <button
              onClick={() => fetchParentComments(false)}
              disabled={isLoading}
              className="px-6 py-2 border border-slate-700 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {isLoading ? "Đang tải thêm bình luận..." : "Tải thêm bình luận"}
            </button>
          </div>
        )}
      </div>

      {/* MODAL XÁC NHẬN XÓA BÌNH LUẬN (FACEBOOK/REDDIT-STYLE PREMIUM MODAL) */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div
            className="bg-[#1E1E21] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl mx-4 transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Icon */}
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="text-lg font-bold text-white">Xóa bình luận</h3>
            </div>

            {/* Nội dung */}
            <p className="text-sm text-gray-400 leading-relaxed mb-6 font-medium">
              Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác và toàn bộ hình ảnh đính kèm (nếu có) cũng sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </p>

            {/* Nút hành động */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmState({ isOpen: false, commentId: null, isReply: false, parentId: null })}
                className="px-4 py-2 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 font-bold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={executeDeleteComment}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-red-600/20"
              >
                Xóa bình luận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Container hiển thị thông báo Toast */}
      <ToastContainer />
    </div>
  );
}

export default EventComments;
