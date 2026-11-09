import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Italic,
  Link,
  List,
  Heading,
  BlockQuote,
  Table,
  Essentials,
  Paragraph,
  Image,
  ImageUpload,
  Undo,
  FileRepository,
  Alignment,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  GeneralHtmlSupport,
  ButtonView,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import { uploadDirect } from "../../utils/fileUpload";

// Icon máy quay video cho nút Toolbar
const VIDEO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
  <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h8.5A2.25 2.25 0 0014 13.75v-1.5l3.562 2.138A1 1 0 0019 13.528V6.472a1 1 0 00-1.438-.86L14 7.75v-1.5A2.25 2.25 0 0011.75 4h-8.5z" />
</svg>`;

// Custom Upload Adapter cho Hình Ảnh (CKEditor chuẩn)
function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return {
      upload: () => {
        return loader.file.then(async (file) => {
          window.dispatchEvent(
            new CustomEvent("ckeditor-upload-status", {
              detail: { isUploading: true },
            })
          );
          try {
            const fileData = await uploadDirect(file, "IMAGE", "EVENT_DESCRIPTION");
            const finalUrl = `${fileData.url}?fileId=${fileData.id}`;
            return {
              default: finalUrl,
            };
          } catch (error) {
            console.error("Lỗi upload ảnh CKEditor:", error);
            throw error.message || "Không thể upload ảnh";
          } finally {
            window.dispatchEvent(
              new CustomEvent("ckeditor-upload-status", {
                detail: { isUploading: false },
              })
            );
          }
        });
      },
    };
  };
}

// Custom Plugin tạo nút "Tải lên Video" trên Toolbar CKEditor
function CustomVideoUploadPlugin(editor) {
  editor.ui.componentFactory.add("uploadVideo", (locale) => {
    const view = new ButtonView(locale);

    view.set({
      label: "Tải lên Video sự kiện (MP4, MOV)",
      icon: VIDEO_ICON,
      tooltip: true,
    });

    view.on("execute", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        window.dispatchEvent(
          new CustomEvent("ckeditor-upload-status", {
            detail: { isUploading: true },
          })
        );
        window.dispatchEvent(
          new CustomEvent("ckeditor-video-upload-progress", {
            detail: { status: "uploading", progress: 1 },
          })
        );

        try {
          // Upload video trực tiếp (hỗ trợ chia chunk + retry tự động)
          const fileData = await uploadDirect(file, "VIDEO", "EVENT_DESCRIPTION", (percent) => {
            window.dispatchEvent(
              new CustomEvent("ckeditor-video-upload-progress", {
                detail: { status: "uploading", progress: percent },
              })
            );
          });

          const finalUrl = `${fileData.url}?fileId=${fileData.id}`;

          // Chèn thẻ video HTML5 vào vị trí con trỏ trong Editor (100% chiều ngang bằng với ảnh)
          const videoHtml = `
            <div class="event-video-wrapper" contenteditable="false" style="width: 100%; margin: 16px 0; clear: both; user-select: none;">
              <video controls preload="metadata" src="${finalUrl}" style="width: 100%; height: auto; display: block; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <source src="${finalUrl}" type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ phát thẻ video.
              </video>
            </div>
            <p>&nbsp;</p>
          `;

          const viewFragment = editor.data.processor.toView(videoHtml);
          const modelFragment = editor.data.toModel(viewFragment);
          editor.model.insertContent(modelFragment);

          window.dispatchEvent(
            new CustomEvent("ckeditor-video-upload-progress", {
              detail: { status: "success", progress: 100 },
            })
          );
        } catch (err) {
          console.error("Lỗi upload video CKEditor:", err);
          alert(err.message || "Tải video lên thất bại.");
          window.dispatchEvent(
            new CustomEvent("ckeditor-video-upload-progress", {
              detail: { status: "error", progress: 0 },
            })
          );
        } finally {
          window.dispatchEvent(
            new CustomEvent("ckeditor-upload-status", {
              detail: { isUploading: false },
            })
          );
        }
      };

      input.click();
    });

    return view;
  });
}

const TextEditor = ({ value, onChange, placeholder, onUploadingChange }) => {
  const [videoUploadState, setVideoUploadState] = useState(null);
  const [isEditorUploading, setIsEditorUploading] = useState(false);

  useEffect(() => {
    const handleProgress = (e) => {
      const data = e.detail;
      if (data.status === "uploading") {
        setVideoUploadState(data.progress);
      } else {
        setTimeout(() => setVideoUploadState(null), 1500);
      }
    };

    let activeUploads = 0;
    const handleUploadStatus = (e) => {
      if (e.detail?.isUploading) {
        activeUploads++;
        setIsEditorUploading(true);
        onUploadingChange?.(true);
      } else {
        activeUploads = Math.max(0, activeUploads - 1);
        if (activeUploads === 0) {
          setIsEditorUploading(false);
          onUploadingChange?.(false);
        }
      }
    };

    window.addEventListener("ckeditor-video-upload-progress", handleProgress);
    window.addEventListener("ckeditor-upload-status", handleUploadStatus);
    return () => {
      window.removeEventListener("ckeditor-video-upload-progress", handleProgress);
      window.removeEventListener("ckeditor-upload-status", handleUploadStatus);
    };
  }, [onUploadingChange]);

  return (
    <div className="custom-ckeditor relative">
      {/* Banner hiển thị tiến trình khi đang upload Video dung lượng lớn */}
      {videoUploadState !== null && (
        <div className="mb-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-700 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
            <span className="font-semibold">Đang truyền tải video lên Cloudinary... ({videoUploadState}%)</span>
          </div>
          <div className="w-40 bg-indigo-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${videoUploadState}%` }}
            />
          </div>
        </div>
      )}

      {/* Banner hiển thị khi đang upload Hình ảnh */}
      {isEditorUploading && videoUploadState === null && (
        <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-700 animate-fadeIn">
          <svg className="animate-spin h-3.5 w-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Đang tải hình ảnh lên Cloudinary, vui lòng đợi hoàn tất trước khi lưu sự kiện...</span>
        </div>
      )}

      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          licenseKey: "GPL",
          plugins: [
            Essentials,
            Paragraph,
            Heading,
            Bold,
            Italic,
            Link,
            List,
            BlockQuote,
            Table,
            Image,
            ImageUpload,
            ImageToolbar,
            ImageStyle,
            ImageResize,
            Undo,
            FileRepository,
            Alignment,
            GeneralHtmlSupport, // Cho phép lưu thẻ <video> và <source>
          ],
          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
          extraPlugins: [MyCustomUploadAdapterPlugin, CustomVideoUploadPlugin],
          placeholder: placeholder || "Nhập nội dung...",
          toolbar: [
            "heading",
            "|",
            "alignment:left",
            "alignment:center",
            "alignment:right",
            "alignment:justify",
            "|",
            "bold",
            "italic",
            "link",
            "uploadImage",
            "uploadVideo", // Nút tải video lên Toolbar
            "bulletedList",
            "numberedList",
            "|",
            "blockQuote",
            "insertTable",
            "undo",
            "redo",
          ],
          alignment: {
            options: ["left", "center", "right", "justify"],
          },
          image: {
            toolbar: [
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
              "|",
              "toggleImageCaption",
              "imageTextAlternative",
            ],
          },
        }}
        onChange={(event, editor) => {
          const htmlData = editor.getData();
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = htmlData;
          const plainText = tempDiv.textContent || tempDiv.innerText || "";
          onChange({
            html: htmlData,
            text: plainText,
          });
        }}
      />

      {/* Style tùy chỉnh cho Editor */}
      <style>{`
        .custom-ckeditor .ck-editor__main > .ck-editor__editable { 
          min-height: 250px !important; 
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
          border-color: #e2e8f0 !important;
          padding-left: 2rem !important;
          padding-right: 2rem !important;
        }
        .custom-ckeditor .ck-editor__top {
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
          overflow: hidden;
          border-color: #e2e8f0 !important;
        }
        .custom-ckeditor .ck-toolbar {
          background: #f8fafc !important;
        }
        .custom-ckeditor .ck-focused { 
          border-color: #10b981 !important; 
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1) !important;
        }
        .custom-ckeditor .event-video-wrapper {
          position: relative;
          display: block;
          width: 100% !important;
          margin: 1.5rem 0 !important;
          clear: both;
          user-select: none;
        }
        .custom-ckeditor video {
          width: 100% !important;
          height: auto !important;
          display: block !important;
          border-radius: 8px;
          outline: none;
          pointer-events: auto !important;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;
