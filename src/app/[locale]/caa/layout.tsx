import Image from "next/image";
import localFont from "next/font/local";

const afacad = localFont({
  src: [
    {
      path: "../../../../public/fonts/Afacad-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../public/fonts/Afacad-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../../public/fonts/Afacad-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-afacad", // Tailwind에 넘길 CSS 변수명
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section
      className={`w-full min-h-screen relative ${afacad.variable}`}
      style={{
        backgroundImage: 'url("/caa/bg.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* 실제 콘텐츠 */}
      <div className="relative">{children}</div>
    </section>
  );
}
