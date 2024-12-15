import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose"; // python-jose가 아닌 nodejs용 jose 라이브러리 사용 예 (npm i jose)
import { TextEncoder } from "util";
import Header from "./header";
import { useRecoilState } from "recoil";
import { showHeaderState } from "@/recoil/showHeaderState";
import classNames from "classnames";

// 환경변수 로드 (NEXT_PUBLIC_* 로 클라이언트 전송), SECRET_KEY는 서버 전용
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || "fallback_key";
const ALGORITHM = "HS256";

export default async function Layout({ children }: { children: ReactNode }) {
  // 서버 환경에서 쿠키 가져오기
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    // 세션 토큰이 없으면 로그인 페이지로
    redirect("/en/calculator");
  }

  // JWT 검증
  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(
      sessionToken,
      encoder.encode(SECRET_KEY),
      {
        algorithms: [ALGORITHM],
      }
    );

    // payload 안에 user_id나 uid 검사 가능
    // const userId = payload.sub;
    // 만약 유효하지 않거나 만료되었다면 에러 발생
  } catch (e) {
    // 검증 실패 -> 로그인 페이지로
    redirect("/en/calculator");
  }

  // 여기까지 왔다면 쿠키 검증 성공, 인증된 상태이므로 children 렌더링
  return (
    <section className={classNames("flex flex-col", {})}>
      <Header />
      {children}
    </section>
  );
}
