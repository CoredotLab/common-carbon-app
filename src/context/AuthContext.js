"use client";
// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authTokens");
      return token ? JSON.parse(token) : null;
    }
    return null;
  });

  const router = useRouter();

  // 최고관리자 -> "1000", 중간관리자 -> "100", 골프장 관리자 -> "60", 골프장 직원 -> "50"
  const [role, setRole] = useState(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      return role;
    }
    return null;
  });

  const login = (tokens) => {
    setAuthTokens(tokens);
    localStorage.setItem("authTokens", JSON.stringify(tokens));
    try {
      const decoded = jwt.decode(tokens.access_token);

      const { role } = decoded;

      localStorage.setItem("role", role);
      setRole(role);
    } catch (error) {
      throw new Error("Token invalid.");
    }

    // TOOD: 권한에 따라 어드민페이지, 업체 페이지로 이동
  };

  const logout = () => {
    setAuthTokens(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    // router.push("/en/calculator");
  };

  return (
    <AuthContext.Provider value={{ authTokens, login, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
