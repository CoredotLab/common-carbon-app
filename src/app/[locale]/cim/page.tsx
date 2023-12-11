import Image from "next/image";
import { useTranslations } from "next-intl";
import Title from "./components/title";
import Filter from "./components/filter";
import CimMap from "./components/map";
import CimGraph from "./components/graph";
import CimTable from "./components/table";

export default function Home() {
  const t = useTranslations("Index");
  return (
    <main className="flex flex-col min-w-[360px] max-w-[1440px] w-full py-[10px] px-[20px] items-center space-y-[10px]">
      <Title />
      <Filter />
      <div className="min-h-[750px] border w-full flex md:flex-row flex-col md:space-x-[30px] md:space-y-[0px] space-y-[30px]">
        <CimMap />
        {/* graph & table -> md이상에서는 가로 크기 고정, 이하에서는 w-full */}
        <div className="md:w-[320px] w-full shrink-0">
          <CimGraph />
          <CimTable />
        </div>
      </div>
    </main>
  );
}
