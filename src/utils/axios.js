// src/utils/axios.js

import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const useAxios = () => {
  const { logout } = useContext(AuthContext);

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // 쿠키 자동 전송
  });

  // 요청 인터셉터: 헤더에 토큰 설정 로직 제거
  instance.interceptors.request.use(
    (config) => {
      // 쿠키 기반 인증이므로 추가 인증 헤더 불필요
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터: 401 시 로그아웃 처리
  instance.interceptors.response.use(
    (response) => {
      // 추가 권한 처리 필요시 여기서 가능
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // 인증 만료나 실패 시 로그아웃 처리
        // logout();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;
