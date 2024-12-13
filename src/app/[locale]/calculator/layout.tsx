import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="w-full min-h-screen relative"
      style={{
        backgroundImage: 'url("/calculator/bg.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* 오버레이: 흰색 배경 10% 불투명 */}
      <div
        className="absolute inset-0 [backdrop-filter:blur(96px)]"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      />
      {/* 실제 콘텐츠 */}
      <div className="relative">{children}</div>
    </section>
  );
}
