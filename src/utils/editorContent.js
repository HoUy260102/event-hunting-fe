export function extractFileIdsFromContent(html) {
  if (!html) return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Quét cả thẻ <img>, <video>, và <source>
    const mediaElements = doc.querySelectorAll("img, video, source");

    const fileIds = Array.from(mediaElements)
      .map((el) => {
        try {
          const src = el.src || el.getAttribute("src");
          if (!src) return null;
          const url = new URL(src, window.location.origin);
          return url.searchParams.get("fileId");
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return [...new Set(fileIds)];
  } catch (error) {
    console.error("Failed to extract fileIds:", error);
    return [];
  }
}
