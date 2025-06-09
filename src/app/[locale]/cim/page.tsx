import Image from "next/image";
import { useTranslations } from "next-intl";
import Title from "./components/title";
import Filter from "./components/filter2";
import CimMap from "./components/map";
import CimGraph from "./components/graph";
import CimTable from "./components/table";
import CimDetailInfo from "./components/detailInfo";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="flex flex-col min-w-[360px] max-w-[1440px] w-full py-[10px] px-[20px] items-center space-y-[10px] mt-[70px] mx-auto">
      <Title />
      <Filter />
      <div className="min-h-[750px] w-full flex md:flex-row flex-col md:space-x-[30px] md:space-y-[0px] space-y-[30px]">
        <CimMap />
        {/* graph & table -> md이상에서는 가로 크기 고정, 이하에서는 w-full */}
        <div className="md:w-[320px] w-full shrink-0">
          <CimGraph />
          <CimTable />
        </div>
      </div>
      <CimDetailInfo />
    </main>
  );
}
