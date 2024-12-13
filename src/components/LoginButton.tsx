// components/LoginButton.tsx

import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase/firebaseConfig";

const LoginButton: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // 로그인 성공 시 사용자 정보
      const user = result.user;
      console.log("로그인 성공:", user);
      // 추가적인 처리 (예: 리다이렉션)
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Google로 로그인
    </button>
  );
};

export default LoginButton;
