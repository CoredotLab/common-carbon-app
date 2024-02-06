import Image from "next/image";

export default function SectionMain() {
  return (
    <main
      className="w-full top-0 flex h-[820px] xl:px-[40px] px-[20px] flex-col justify-center items-center"
      style={{
        backgroundImage: "url(/carbonai/image_main.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center">
        <Image
          src="/carbonai/image_brain.png"
          alt="image_brain"
          width={240}
          height={300}
          quality={100}
        />
        <div className="flex flex-col items-center font-suit mt-10">
          <span
            className="xl:text-[40px] text-[30px] font-[700] text-center"
            style={{
              background:
                "linear-gradient(100deg, #00FFDA 11.89%, rgba(111, 113, 174, 0.72) 116.49%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Carbon AI
          </span>
          <span
            className="xl:text-[20px] text-[18px] font-[500] text-center"
            style={{
              background:
                "linear-gradient(100deg, rgba(0, 255, 218, 1) 11.89%, rgba(33, 45, 43, 1) 116.49%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            What AI will bring to carbon reduction{" "}
          </span>
        </div>
      </div>
    </main>
  );
}
