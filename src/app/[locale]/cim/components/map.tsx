"use client";
import Map, {
  Layer,
  MapRef,
  Source,
  Popup,
  MapLayerMouseEvent,
} from "react-map-gl";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  acState,
  hcState,
  mtState,
  dynamicAcOptionsState,
  dynamicHcOptionsState,
} from "@/recoil/filterState";
// dynamicAcOptionsState, dynamicHcOptionsState: 새로 추가한 atom
// 이를 통해 화면상 보이는 포인트 기반으로 AC/HC 필터 목록을 업데이트

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface HoverInfo {
  longitude: number;
  latitude: number;
  cluster?: boolean;
  properties: {
    title?: string;
    company?: string;
    methodology?: string;
    reduction?: number;
    point_count?: number;
    reductionSum?: number;
    ac_name?: string;
    hc_name?: string;
  };
}

export default function CimMap() {
  const mapRef = useRef<MapRef>(null);
  const acValue = useRecoilValue(acState);
  const hcValue = useRecoilValue(hcState);
  const mtValue = useRecoilValue(mtState);

  const setDynamicAcOptions = useSetRecoilState(dynamicAcOptionsState);
  const setDynamicHcOptions = useSetRecoilState(dynamicHcOptionsState);

  const [mapUrl, setMapUrl] = useState(
    `${process.env.NEXT_PUBLIC_API_URL}/geomap`
  );
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "";
    if (num >= 1000000000) {
      return `${Math.round(num / 1000000000)}B`;
    } else if (num >= 1000000) {
      return `${Math.round(num / 1000000)}M`;
    } else if (num >= 1000) {
      return `${Math.round(num / 1000)}K`;
    }
    return num.toString();
  };

  const onMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features && event.features[0];
    if (!feature) return;
    if (feature.geometry && feature.geometry.type === "Point") {
      const coordinates = feature.geometry.coordinates as [number, number];

      if (feature.layer.id === "clusters" && mapRef.current) {
        // 클러스터 확대 로직
        const clusterId = feature.properties?.cluster_id;
        const mapboxSource = mapRef.current
          .getMap()
          .getSource("myData") as mapboxgl.GeoJSONSource;
        mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          mapRef.current?.easeTo({
            center: coordinates,
            zoom,
            duration: 500,
          });
        });
      } else {
        // 포인트 이동
        mapRef.current?.easeTo({
          center: coordinates,
          zoom: 6,
          duration: 500,
        });
      }
    }
  };

  const onMouseMove = (event: MapLayerMouseEvent) => {
    const features = event.features;
    if (!features) {
      setHoverInfo(null);
      return;
    }

    const clusterFeature = features.find((f) => f.layer.id === "clusters");
    if (clusterFeature && clusterFeature.geometry.type === "Point") {
      const coords = clusterFeature.geometry.coordinates as [number, number];
      setHoverInfo({
        longitude: coords[0],
        latitude: coords[1],
        cluster: true,
        properties: {
          point_count: clusterFeature.properties?.point_count,
          reductionSum: clusterFeature.properties?.reductionSum,
        },
      });
      return;
    }

    const pointFeature = features.find(
      (f) => f.layer.id === "unclustered-point"
    );
    if (pointFeature && pointFeature.geometry.type === "Point") {
      const coords = pointFeature.geometry.coordinates as [number, number];
      setHoverInfo({
        longitude: coords[0],
        latitude: coords[1],
        cluster: false,
        properties: {
          title: pointFeature.properties?.title,
          company: pointFeature.properties?.company,
          methodology: pointFeature.properties?.methodology,
          reduction: pointFeature.properties?.reduction,
          ac_name: pointFeature.properties?.ac_name,
          hc_name: pointFeature.properties?.hc_name,
        },
      });
    } else {
      setHoverInfo(null);
    }
  };

  // 맵 이동/줌 종료 시 현재 viewport에 보여지는 unclustered-point들 기반으로 AC, HC 목록 업데이트
  const onMoveEnd = () => {
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current.getMap();

    // 현재 뷰포트에 표시되는 unclustered-point 피쳐들 가져오기
    const visibleFeatures = map.queryRenderedFeatures(undefined, {
      layers: ["unclustered-point"],
    });

    const acSet = new Set<string>();
    const hcSet = new Set<string>();

    visibleFeatures.forEach((f) => {
      const acName = f.properties?.ac_name;
      const hcName = f.properties?.hc_name;
      if (acName) acSet.add(acName);
      if (hcName) hcSet.add(hcName);
    });

    // recoil state로 AC, HC 옵션 업데이트
    setDynamicAcOptions(Array.from(acSet));
    setDynamicHcOptions(Array.from(hcSet));
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
      <Map
        initialViewState={{
          latitude: 37.6,
          longitude: 127.0,
          zoom: 2,
        }}
        style={{ width: "100%", height: "100%", minHeight: "300px" }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={onMapClick}
        onMouseMove={onMouseMove}
        onMoveEnd={onMoveEnd} // 이동 종료 시 onMoveEnd 호출
        interactiveLayerIds={["unclustered-point", "clusters", "cluster-count"]}
        ref={mapRef}
      >
        <Source
          id="myData"
          type="geojson"
          data={mapUrl}
          cluster={true}
          clusterRadius={40}
          clusterMaxZoom={9}
          clusterProperties={{
            reductionSum: ["+", ["get", "reduction"]],
          }}
        >
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": "#f7971e",
              "circle-radius": [
                "step",
                ["get", "point_count"],
                15,
                10,
                20,
                50,
                25,
                100,
                30,
              ],
              "circle-stroke-color": "#fff",
              "circle-stroke-width": 2,
            }}
          />

          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-size": 14,
            }}
            paint={{
              "text-color": "#fff",
              "text-halo-color": "#000",
              "text-halo-width": 1,
            }}
          />

          <Layer
            id="unclustered-point"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "reduction"],
                0,
                10,
                2000,
                12,
                5000,
                14,
                30000,
                16,
                100000,
                18,
                500000,
                20,
                1000000,
                22,
              ],
              "circle-color": "#50BBD6",
              "circle-stroke-color": "#fff",
              "circle-stroke-width": 1,
            }}
          />

          <Layer
            id="unclustered-text"
            type="symbol"
            filter={["!", ["has", "point_count"]]}
            layout={{
              "text-field": [
                "case",
                [">=", ["get", "reduction"], 1000000000],
                [
                  "concat",
                  [
                    "to-string",
                    ["round", ["/", ["get", "reduction"], 1000000000]],
                  ],
                  "B",
                ],
                [">=", ["get", "reduction"], 1000000],
                [
                  "concat",
                  [
                    "to-string",
                    ["round", ["/", ["get", "reduction"], 1000000]],
                  ],
                  "M",
                ],
                [">=", ["get", "reduction"], 1000],
                [
                  "concat",
                  ["to-string", ["round", ["/", ["get", "reduction"], 1000]]],
                  "K",
                ],
                ["to-string", ["get", "reduction"]],
              ],
              "text-size": 14,
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "text-anchor": "center",
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            }}
            paint={{
              "text-color": "#fff",
              "text-halo-color": "#000",
              "text-halo-width": 1,
            }}
          />
        </Source>

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
          >
            <div className="text-sm">
              {hoverInfo.cluster ? (
                <div>
                  <div className="font-bold mb-1">
                    {hoverInfo.properties.point_count} points in this cluster
                  </div>
                  <div>
                    Reduction Sum:{" "}
                    {formatNumber(hoverInfo.properties.reductionSum)} tCO2
                  </div>
                  <div className="text-xs mt-1">Click cluster to zoom in.</div>
                </div>
              ) : (
                <>
                  <div className="font-bold mb-1">
                    {hoverInfo.properties.title}
                  </div>
                  <div>Company: {hoverInfo.properties.company}</div>
                  <div>Methodology: {hoverInfo.properties.methodology}</div>
                  <div>Reduction: {hoverInfo.properties.reduction} tCO2</div>
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>
      <div className="absolute top-[21px] left-[10px]">
        <Image
          src="/cim/map_carbon_reduction_index.png"
          width={188}
          height={18}
          alt="index"
        />
      </div>
      <div className="absolute top-[50px] left-[10px]">
        <Image
          src="/cim/map_carbon_reduction_index2.png"
          width={112}
          height={18}
          alt="index"
        />
      </div>
    </main>
  );
}
