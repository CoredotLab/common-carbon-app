// src/utils/axios.js
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useLoadingStore } from "../../lib/store/loadingStore";

const useAxios = () => {
  const { authTokens, setAuthTokens, logout } = useContext(AuthContext);
  const { setLoading } = useLoadingStore();

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  let isRefreshing = false;
  let refreshSubscribers = [];

  const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
  };

  const onRefreshed = (newToken) => {
    refreshSubscribers.map((cb) => cb(newToken));
  };

  const shouldRefreshToken = () => {
    if (authTokens) {
      const token = authTokens.access_token;
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)
        if (decodedToken.exp < currentTime) {
          // 토큰이 만료됨
          return true;
        } else {
          // 토큰이 유효함
          return false;
        }
      } catch (e) {
        console.error("토큰 디코딩 중 에러 발생:", e);
        return false;
      }
    }
    return false;
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/app/auth/access_token`,
        {
          refresh_token: authTokens.refreshToken,
        }
      );

      if (
        response.data.result_code !== "100" ||
        !response.data.access_token ||
        response.data.access_token === ""
      ) {
        // 토큰 갱신 실패 시 로그아웃 처리
        logout();
        throw new Error("토큰 갱신 실패");
      }

      // 새로운 토큰 저장
      const newAuthTokens = {
        ...authTokens,
        access_token: response.data.access_token,
      };
      setAuthTokens(newAuthTokens);

      // 대기 중인 요청들에게 새로운 토큰 전달
      onRefreshed(response.data.access_token);

      // 구독자 배열 초기화
      refreshSubscribers = [];

      return response.data.access_token;
    } catch (error) {
      console.error("토큰 갱신 중 에러 발생:", error);
      logout();
      throw error;
    }
  };

  instance.interceptors.request.use(
    async (config) => {
      setLoading(true);
      if (authTokens) {
        // 토큰 만료 여부 확인
        if (shouldRefreshToken()) {
          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const newToken = await refreshToken();
              isRefreshing = false;
              config.headers.Authorization = `Bearer ${newToken}`;
              return config;
            } catch (error) {
              return Promise.reject(error);
            }
          } else {
            // 토큰 갱신 중인 경우, 토큰 갱신이 완료될 때까지 대기
            return new Promise((resolve) => {
              subscribeTokenRefresh((newToken) => {
                config.headers.Authorization = `Bearer ${newToken}`;
                resolve(config);
              });
            });
          }
        } else {
          config.headers.Authorization = `Bearer ${authTokens.access_token}`;
          return config;
        }
      }
      return config;
    },
    (error) => {
      setLoading(false);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      setLoading(false);
      if (
        response.data.result_code === "601" ||
        response.data.result_code === "602" ||
        response.data.result_code === "603"
      ) {
        alert("권한이 없습니다.");
      }

      return response;
    },
    (error) => {
      setLoading(false);
      if (error.response && error.response.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;
