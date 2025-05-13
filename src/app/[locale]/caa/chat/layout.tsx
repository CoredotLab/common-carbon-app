// app/(chat)/layout.tsx  — 예시
import SidebarNav from "./components/nav";

export const metadata = {
  title: "Carbon AI Assistant",
  description: "Unlocking sustainable futures",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-screen">
      {/* 왼쪽 네비게이션 */}
      <SidebarNav />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </section>
  );
}
