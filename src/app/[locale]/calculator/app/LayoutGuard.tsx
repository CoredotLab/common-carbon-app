"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * LayoutGuard는 "create" 모드일 때 페이지를 떠나면 경고(confirm)를 띄우고,
 * 사용자 확인 시 특정 경로로 이동(router.push) 해주는 예시 컴포넌트입니다.
 */
export default function LayoutGuard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // "create" or "view" etc.

  useEffect(() => {
    // create 모드가 아닐 경우엔 아무 것도 안 함
    if (mode !== "create") return;

    // 1) 새로고침이나 탭 닫기(브라우저 떠나기) 방지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // 크롬 등 최신 브라우저는 문자열은 무시하고 confirm만 표시
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 2) Next.js 내부 라우팅(=routeChange) 또는 브라우저 뒤로가기(popstate) 등 처리
    //  - Next.js 13의 App Router 에서는 routeChangeStart 이벤트를 바로 쓸 수 없으므로,
    //    window.onpopstate 등을 직접 다루거나, `useRouter` replace/ push를 훅으로 막아주는 식으로 구현 가능.
    //  - 여기서는 간단히 popstate 예시만 작성
    const handlePopState = (e: PopStateEvent) => {
      // 브라우저 뒤로가기 등 popstate 발생 시 confirm
      if (
        !window.confirm(
          "정말 이 화면을 떠나시겠습니까? 진행 중인 내용이 사라집니다."
        )
      ) {
        // 뒤로가기 취소(앞으로 다시 이동)
        history.go(1);
      } else {
        // OK 선택 시 특정 경로로 이동하거나, 그대로 뒤로가기를 허용
        router.push("/en/calculator/app/dashboard");
      }
    };
    window.addEventListener("popstate", handlePopState);

    // 언마운트 시 이벤트 해제
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [mode, router]);

  return null; // 아무것도 렌더링하지 않고, 이벤트만 관여
}
