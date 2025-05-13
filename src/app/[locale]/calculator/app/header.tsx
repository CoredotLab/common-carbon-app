"use client";

import type { NextPage } from "next";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAxios from "@/utils/axios";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import { showHeaderState } from "@/recoil/showHeaderState";
import classNames from "classnames";

const Header: NextPage = () => {
  const router = useRouter();
  const axios = useAxios();
  const [email, setEmail] = useState<string | null>(null);
  const { logout } = useContext(AuthContext);
  const [showHeader, setShowHeader] = useRecoilState(showHeaderState);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        setEmail(res.data.email);
        localStorage.setItem("email", res.data.email);
      } catch (err) {
        // 인증 안 된 경우 로그인 페이지로 돌려보낼 수도 있음
        // router.push("/en"); // 필요시 사용
      }
    };
    fetchUser();
  }, [axios, router]);

  const firstLetter = email ? email.charAt(0).toUpperCase() : "L";

  const handleSignOut = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      logout();
      toast.success("Logged out successfully");
      router.push("/en/calculator");
    } catch (error) {}
  };

  return (
    <div
      className={classNames(
        "w-number-common-device-width relative [background:linear-gradient(180deg,_rgba(255,_255,_255,_0),_rgba(255,_255,_255,_0.2))] h-16 flex flex-row items-center justify-between py-0 px-5 box-border text-left text-lg text-color-text-default font-label-small-bold",
        {
          "mt-[70px]": showHeader,
        }
      )}
    >
      <div className="flex flex-row items-center justify-start gap-number-spacing-spacing-xxxs">
        <div className="rounded-[1000px] w-8 h-8 flex flex-row items-center justify-center py-2 px-number-spacing-spacing-xs box-border text-sm bg-[#2655B2]">
          <b className="relative leading-[16px] text-[25px] text-bold text-white">
            {firstLetter}
          </b>
        </div>
        <b className="relative leading-[25px]">{email || "Master Kitten"}</b>
      </div>
      <button
        onClick={handleSignOut}
        className="rounded-number-common-radius-full [background:linear-gradient(180deg,_rgba(255,_255,_255,_0.6),_rgba(255,_255,_255,_0.4))] h-8 flex flex-row items-center justify-center py-2 px-number-spacing-spacing-xs box-border min-w-[96px] text-sm"
      >
        <b className="relative leading-[16px]">Sign Out</b>
      </button>
    </div>
  );
};

export default Header;
