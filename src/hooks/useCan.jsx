import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useCan = () => {
  const { permissions } = useContext(AuthContext);
  const can = (permissionName = "BYPASS") => {
    if (permissionName === "BYPASS") return true;
    return permissions?.includes(permissionName);
  };
  return can;
};