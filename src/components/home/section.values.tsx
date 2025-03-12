import Image from "next/image";

export default function SectionValues() {
  return (
    <main className="w-full flex flex-col py-[40px] justify-center items-center space-y-[20px] bg-[#F9F7C9]">
      <span className="xl:pt-[40px] pt-[20px] pb-[20px] text-[#133334] xl:text-[30px] text-[20px] font-[600]">
        Transparency x Efficiency = Impact
      </span>
      <Values />
    </main>
  );
}

type ValuesProps = {
  image: string;
  title: string;
  description1: string;
  description2: string;
  description3: string;
};

function Values() {
  const valueItems: ValuesProps[] = [
    {
      image: "/home/value_transparency.png",
      title: "Data Transparency",
      description1: "We track and provide",
      description2: "credible carbon reduction data",
      description3: "using our Carbon Impact Map (CIM).",
    },
    {
      image: "/home/value_efficiency.png",
      title: "Operational Efficiency",
      description1: "We utilize the power",
      description2: "of AI to streamline",
      description3: "your carbon reduction projects.",
    },
    {
      image: "/home/value_together.png",
      title: "Endurance",
      description1: "Join our platform",
      description2: "to maximize your impact.",
      description3: "",
    },
  ];
  return (
    <div className="w-full max-w-[1440px] flex xl:flex-row flex-col xl:py-[120px] py-[30px] xl:space-x-[160px] xl:space-y-[0px] space-y-[30px] xl:justify-center xl:items-start items-center">
      {valueItems.map((valueItem, index) => (
        <div
          key={index}
          className="w-[300px] flex flex-col items-center space-y-[60px]"
        >
          <div className="relative w-[70px] h-[70px] m-[15px]">
            <Image
              src={valueItem.image}
              layout="fill"
              objectFit="contain"
              alt="value image"
            />
          </div>
          <div className="flex flex-col space-y-[20px] text-center w-full">
            <span className="text-black xl:text-[20px] text-[16px] font-[600]">
              {valueItem.title}
            </span>
            <span className="text-black xl:text-[16px] text-[14px] font-[500]">
              {valueItem.description1} <br />
              {valueItem.description2} <br />
              {valueItem.description3}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
