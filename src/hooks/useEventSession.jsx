import { useState, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "event_sessions";

export const useEventSession = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const getSession = useCallback(
    (showId) => {
      const session = sessions[showId];
      if (!session) return null;

      if (new Date().getTime() > session.expiresAt) {
        return null;
      }
      return session;
    },
    [sessions],
  );

  const updateSession = useCallback((showId, token, expiresIn) => {
    const expiresAt = new Date().getTime() + expiresIn * 1000;
    const newData = { token, expiresAt };

    setSessions((prev) => {
      const updated = { ...prev, [showId]: newData };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
    return newData;
  }, []);

  const syncSession = useCallback(
    async (showId) => {
      const existing = getSession(showId);

      if (existing) {
        return existing;
      }

      try {
        console.log("chạy:", getSession(showId));
        const response = await axiosClient.get(`/shows/${showId}/queue/status`);
        if (response?.data?.status !== "BUYING") {
          navigate("/");
          return;
        }
        const { token, expiresIn } = response.data;
        return updateSession(showId, token, expiresIn);
      } catch (error) {
        console.error("Không thể khôi phục phiên từ Redis:", error);
        return null;
      }
    },
    [getSession, updateSession],
  );

  return { sessions, getSession, syncSession, updateSession };
};
