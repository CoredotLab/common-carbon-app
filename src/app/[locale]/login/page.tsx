// pages/login.tsx

import LoginButton from "@/components/LoginButton";
import React from "react";

const Login: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl mb-4">로그인</h1>
        <LoginButton />
      </div>
    </div>
  );
};

export default Login;
