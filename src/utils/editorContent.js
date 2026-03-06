export function extractFileIdsFromContent(html) {
  if (!html) return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const images = doc.querySelectorAll("img");

    const fileIds = Array.from(images)
      .map((img) => {
        try {
          const url = new URL(img.src);
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
