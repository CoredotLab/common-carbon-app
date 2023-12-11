"use client";
import Map, {
  GeoJSONSource,
  Layer,
  MapRef,
  Marker,
  Source,
} from "react-map-gl";
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from "./map/layers";
import { useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Set your mapbox token here

export default function CimMap() {
  const mapRef = useRef<MapRef>(null);

  const onClick = (event: any) => {
    const feature = event.features[0];
    const clusterId = feature.properties.cluster_id;

    const mapboxSource = mapRef.current?.getSource(
      "earthquakes"
    ) as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        return;
      }

      mapRef.current?.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500,
      });
    });
  };

  return (
    <main className="w-full min-h-[226px] border">
      {/* 위 컴포넌트에 꽉차게 UI */}
      <Map
        initialViewState={{
          latitude: 37.6,
          longitude: 127.0,
          zoom: 2,
        }}
        style={{ width: "100%", height: "100%", minHeight: "226px" }}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        interactiveLayerIds={[clusterLayer.id as string]}
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={onClick}
        ref={mapRef}
      >
        <Marker longitude={127.0} latitude={37.6} color="red" />
        <Source
          id="earthquakes"
          type="geojson"
          data="https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
    </main>
  );
}