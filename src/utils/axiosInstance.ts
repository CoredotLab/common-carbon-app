// src/utils/axios.ts ----------------------------------------------------
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // ← 쿠키 자동 포함
});
