import dayjs from "dayjs";
import "dayjs/locale/vi";
export const formatDateTimeLocal = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatDateVN = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

export const toISOString = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

export const formatEventDateToString = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Thời gian không hợp lệ";
  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(
    date,
  );
  const datePart = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${weekday}, ${datePart} | ${timePart}`;
};

export const formatShowTime = (startStr, endStr) => {
  const start = dayjs(startStr).locale("vi");
  const end = dayjs(endStr).locale("vi");
  if (start.isSame(end, "day")) {
    return `${start.format("HH:mm")} - ${end.format("HH:mm")}, ${start.format("DD/MM/YYYY")}`;
  }
  return `${start.format("HH:mm, DD/MM")} - ${end.format("HH:mm, DD/MM/YYYY")}`;
};

export const formatDate = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Format date error:", error);
    return "";
  }
};

export const separateDateTime = (dateStr) => {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return {
        year: year,
        month: month,
        day: day
    };
}

export const formatDateTime = (date) => {
  if (!date) return "--";

  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};