"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Map, {
  Source,
  Layer,
  Popup,
  MapLayerMouseEvent,
  MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  acState,
  hcState,
  mtState,
  verifierState,
  dynamicAcOptionsState,
  dynamicHcOptionsState,
} from "@/recoil/filterState";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/* ───────── 헬퍼: 숫자 포맷 ───────── */
const fmtNumber = (n?: number) =>
  n === undefined
    ? ""
    : n >= 1e9
    ? `${Math.round(n / 1e9)}B`
    : n >= 1e6
    ? `${Math.round(n / 1e6)}M`
    : n >= 1e3
    ? `${Math.round(n / 1e3)}K`
    : n.toString();

/* ───────── 메인 컴포넌트 ───────── */
export default function CimMap() {
  /* Recoil 상태 */
  const ac = useRecoilValue(acState);
  const hc = useRecoilValue(hcState);
  const mt = useRecoilValue(mtState);
  const verifier = useRecoilValue(verifierState);

  const setDynAc = useSetRecoilState(dynamicAcOptionsState);
  const setDynHc = useSetRecoilState(dynamicHcOptionsState);

  const mapRef = useRef<MapRef>(null);
  const [hoverInfo, setHoverInfo] = useState<null | any>(null);

  /* URL 빌더 (메모이즈) */
  const buildGeoUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (verifier !== "All") p.append("verifier", verifier);
    if (ac !== "All") p.append("ac", ac);
    if (hc !== "All") p.append("hc", hc);
    if (mt !== "All") p.append("mt", mt);
    return `${process.env.NEXT_PUBLIC_API_URL}/geomap?${p.toString()}`;
  }, [verifier, ac, hc, mt]);

  /* GeoJSON URL (memo → re-render 시 Source 갱신) */
  const geoUrl = useMemo(buildGeoUrl, [buildGeoUrl]);

  /* ───────── 핸들러 ───────── */
  const onMapClick = (e: MapLayerMouseEvent) => {
    const f = e.features?.[0];
    if (!f || f.geometry.type !== "Point") return;

    const coords = f.geometry.coordinates as [number, number];

    if (f.layer.id === "clusters" && mapRef.current) {
      const src = mapRef.current
        .getMap()
        .getSource("myData") as mapboxgl.GeoJSONSource;
      src.getClusterExpansionZoom(f.properties?.cluster_id, (err, zoom) => {
        if (!err)
          mapRef.current?.easeTo({ center: coords, zoom, duration: 500 });
      });
    } else {
      mapRef.current?.easeTo({ center: coords, zoom: 6, duration: 500 });
    }
  };

  const onMouseMove = (e: MapLayerMouseEvent) => {
    const fs = e.features;
    if (!fs?.length) return setHoverInfo(null);

    const cluster = fs.find((f) => f.layer.id === "clusters");
    if (cluster && cluster.geometry.type === "Point") {
      const [lng, lat] = cluster.geometry.coordinates as [number, number];
      return setHoverInfo({
        longitude: lng,
        latitude: lat,
        cluster: true,
        props: cluster.properties,
      });
    }
    const point = fs.find((f) => f.layer.id === "unclustered-point");
    if (point && point.geometry.type === "Point") {
      const [lng, lat] = point.geometry.coordinates as [number, number];
      return setHoverInfo({
        longitude: lng,
        latitude: lat,
        cluster: false,
        props: point.properties,
      });
    }
    setHoverInfo(null);
  };

  /* 뷰포트 변경 → 동적 옵션 집계 */
  const onMoveEnd = () => {
    if (!mapRef.current) return;
    const vis = mapRef.current
      .getMap()
      .queryRenderedFeatures(undefined, { layers: ["unclustered-point"] });

    const acSet = new Set<string>();
    const hcSet = new Set<string>();
    vis.forEach((f) => {
      f.properties?.ac_name && acSet.add(f.properties.ac_name);
      f.properties?.hc_name && hcSet.add(f.properties.hc_name);
    });
    setDynAc(Array.from(acSet));
    setDynHc(Array.from(hcSet));
  };

  return (
    <main className="w-full min-h-[300px] border relative">
      <Map
        initialViewState={{ longitude: 127.0, latitude: 37.6, zoom: 2 }}
        style={{ width: "100%", height: "100%", minHeight: "300px" }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={onMapClick}
        onMouseMove={onMouseMove}
        onMoveEnd={onMoveEnd}
        interactiveLayerIds={["unclustered-point", "clusters", "cluster-count"]}
        ref={mapRef}
      >
        <Source
          id="myData"
          type="geojson"
          data={geoUrl} /* ← verifier 적용 URL */
          cluster
          clusterRadius={40}
          clusterMaxZoom={9}
          clusterProperties={{ reductionSum: ["+", ["get", "reduction"]] }}
        >
          {/* cluster bubbles */}
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

          {/* individual points */}
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
                2_000,
                12,
                5_000,
                14,
                30_000,
                16,
                100_000,
                18,
                500_000,
                20,
                1_000_000,
                22,
              ],
              "circle-color": "#50BBD6",
              "circle-stroke-color": "#fff",
              "circle-stroke-width": 1,
            }}
          />

          {/* point labels */}
          <Layer
            id="unclustered-text"
            type="symbol"
            filter={["!", ["has", "point_count"]]}
            layout={{
              "text-field": [
                "case",
                [">=", ["get", "reduction"], 1e9],
                [
                  "concat",
                  ["to-string", ["round", ["/", ["get", "reduction"], 1e9]]],
                  "B",
                ],
                [">=", ["get", "reduction"], 1e6],
                [
                  "concat",
                  ["to-string", ["round", ["/", ["get", "reduction"], 1e6]]],
                  "M",
                ],
                [">=", ["get", "reduction"], 1e3],
                [
                  "concat",
                  ["to-string", ["round", ["/", ["get", "reduction"], 1e3]]],
                  "K",
                ],
                ["to-string", ["get", "reduction"]],
              ],
              "text-size": 14,
              "text-allow-overlap": true,
              "text-anchor": "center",
            }}
            paint={{
              "text-color": "#fff",
              "text-halo-color": "#000",
              "text-halo-width": 1,
            }}
          />
        </Source>

        {/* Popup */}
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
                <>
                  <div className="font-bold mb-1">
                    {hoverInfo.props.point_count} points in this cluster
                  </div>
                  <div>
                    Reduction Sum: {fmtNumber(hoverInfo.props.reductionSum)}{" "}
                    tCO2
                  </div>
                  <div className="text-xs mt-1">Click cluster to zoom in.</div>
                </>
              ) : (
                <>
                  <div className="font-bold mb-1">{hoverInfo.props.title}</div>
                  <div>Company: {hoverInfo.props.company}</div>
                  <div>Methodology: {hoverInfo.props.methodology}</div>
                  <div>Reduction: {hoverInfo.props.reduction} tCO2</div>
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* 색상 인덱스 이미지 (디자인 유지) */}
      <Image
        src="/cim/map_carbon_reduction_index.png"
        width={188}
        height={18}
        alt="index"
        className="absolute top-[21px] left-[10px]"
      />
      <Image
        src="/cim/map_carbon_reduction_index2.png"
        width={112}
        height={18}
        alt="index"
        className="absolute top-[50px] left-[10px]"
      />
    </main>
  );
}
