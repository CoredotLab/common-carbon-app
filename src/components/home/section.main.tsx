import Image from "next/image";

export default function SectionMain() {
  return (
    <main
      className="w-full top-0 flex h-[820px] xl:px-[40px] px-[20px] flex-col justify-end items-start"
      style={{
        backgroundImage: "url(/home/image_main.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="xl:flex hidden min-h-[347px] flex-shrink-0 w-full"></div>
      <div className="flex w-full h-full z-10 flex-col justify-center text-white max-w-[1440px] mx-auto">
        <div className="flex flex-col space-y-[10px]">
          <span className="text-[40px] font-[600]">
            Reviving Our World Through Innovation
          </span>
          <span className="text-[20px] font-[500]">
            Pioneering Change, One Byte at a Time Empowering Carbon Solutions
            for a Sustainable Future
          </span>
        </div>
      </div>
    </main>
  );
}
