// src/services/apiService.ts
import { AuthContext } from "@/context/AuthContext";

import useAxios from "@/utils/axios";
import { useContext } from "react";

export const useApiService = () => {
  const axiosInstance = useAxios();
  const { login } = useContext(AuthContext);

  return {};
};
