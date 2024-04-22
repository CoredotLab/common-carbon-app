"use client";
import Map, {
  GeoJSONSource,
  Layer,
  MapRef,
  Marker,
  Source,
} from "react-map-gl";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import { acState, hcState, mtState } from "@/recoil/filterState";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Set your mapbox token here

interface mapData {
  ac: string;
  hc: string;
  title: string;
  company: string;
  methodology: string;
  m_end: string;
  lat: number;
  id: number;
  mt: string;
  reduction: number;
  m_start: string;
  l_name: string;
  long: number;
}

export default function CimMap() {
  const mapRef = useRef<MapRef>(null);
  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);
  const [mapUrl, setMapUrl] = useState(
    `${process.env.NEXT_PUBLIC_API_URL}/geomap`
  );

  const onClick = (event: any) => {
    const feature = event.features[0];

    if (!feature) {
      return;
    }

    // 클릭된 feature의 좌표를 가져옵니다.
    const coordinates = feature.geometry.coordinates;

    // 지도의 중심을 클릭된 좌표로 이동하고, 확대합니다.
    mapRef.current?.easeTo({
      center: coordinates,
      zoom: 6, // 확대 수준 (zoom level)은 적절히 조절할 수 있습니다.
      duration: 500,
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams();
    if (!acValue.includes("All")) urlParams.append("ac", acValue);
    if (!hcValue.includes("All")) urlParams.append("hc", hcValue);
    if (!mtValue.includes("All")) urlParams.append("mt", mtValue);

    const url = `${
      process.env.NEXT_PUBLIC_API_URL
    }/geomap?${urlParams.toString()}`;
    setMapUrl(url);
  }, [acValue, hcValue, mtValue]);

  return (
    <main className="w-full min-h-[300px] border relative">
      {/* 위 컴포넌트에 꽉차게 UI */}
      <Map
        initialViewState={{
          latitude: 37.6,
          longitude: 127.0,
          zoom: 2,
        }}
        style={{ width: "100%", height: "100%", minHeight: "300px" }}
        mapStyle="mapbox://styles/mapbox/dark-v10"
        interactiveLayerIds={["dataCircleLayer"]}
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={onClick}
        ref={mapRef}
      >
        <Source id="myData" type="geojson" data={mapUrl}>
          <Layer
            id="dataCircleLayer"
            type="circle"
            paint={{
              // Use a 'step' expression to implement a graduated circle size based on the 'reduction' property
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "reduction"],
                0,
                13, // 0 reduction - radius 5
                2000,
                15, // 500 reduction - radius 10
                2500,
                17, // 1000 reduction - radius 15
                3000,
                19, // 3000 reduction - radius 20
                5000,
                21, // 5000 reduction - radius 25
                30000,
                23, // 30000 reduction - radius 30
                100000,
                25, // 100000 reduction - radius 35
                500000,
                27, // 500000 reduction - radius 40
                1000000,
                29, // 1000000 reduction - radius 45
              ],
              "circle-color": "#50BBD6", // set color of circles
            }}
          />
          {/* Symbol Layer for rendering text */}
          <Layer
            id="dataTextLayer"
            type="symbol"
            layout={{
              "text-field": [
                "case",
                [">=", ["get", "reduction"], 1000],
                [
                  "concat",
                  ["to-string", ["round", ["/", ["get", "reduction"], 1000]]],
                  "K",
                ],
                ["get", "reduction"],
              ],
              "text-size": 12,
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "text-anchor": "center",
            }}
            paint={{
              "text-color": "#fff",
            }}
          />
        </Source>
      </Map>
      <div className="absolute top-[21px] left-[10px]">
        <Image
          src="/cim/map_carbon_reduction_index.png"
          width={188}
          height={18}
          alt={"index"}
        />
      </div>
    </main>
  );
}
