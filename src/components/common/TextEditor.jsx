import React from "react";
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
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import axiosClient from "../../api/axiosClient";

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return {
      upload: () => {
        return loader.file.then((file) => {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "IMAGE");
            formData.append("folder", "EVENT_DESCRIPTION");
            axiosClient
              .post("/files/upload", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
              .then((response) => {
                const fileData = response.data; // Giả sử trả về { id: "abc", url: "http://..." }

                // Nối fileId vào URL giống như cách bạn làm với mockId lúc nãy
                const finalUrl = `${fileData.url}?fileId=${fileData.id}`;
                console.log("Dán ID thật vào URL:", finalUrl);
                resolve({
                  default: finalUrl,
                });
              })
              .catch((error) => {
                console.error("Lỗi upload CKEditor:", error);
                reject(error.response?.data?.message || "Không thể upload ảnh");
              });
          });
        });
      },
    };
  };
}

const TextEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="custom-ckeditor">
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
          ],
          extraPlugins: [MyCustomUploadAdapterPlugin],
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

      {/* Giữ nguyên phần Style của bạn */}
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
      `}</style>
    </div>
  );
};

export default TextEditor;
