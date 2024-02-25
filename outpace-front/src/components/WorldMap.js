import React, { useEffect, useState } from "react";
import { Map, GeoJson } from "pigeon-maps";
import {
  centerZoomFromLocations,
  concatCoords,
  getExtremeLocations,
  getGeoJsonContainingLatLng,
  getProvider,
  isPointInGeoJson,
  index,
} from "../utils/functions";
import polyline from "@mapbox/polyline";

function useGeoJson() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("quebec.geojson")
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData))
      .catch((error) => console.error(error));
  }, []);

  return data;
}

function rankingAlpha(counts, index, maxim) {
  return Math.sqrt(0.1 + 0.8 * (counts[index] / maxim));
}

function WorldMap({ activities }) {
  const geoJsonQuebec = useGeoJson();
  // Don't try to use geoJson until it's defined
  if (!geoJsonQuebec) {
    return <div>Loading...</div>;
  }
  const mapWidth = window.innerWidth * 0.8;
  const mapHeight = mapWidth / 1.5;
  let geos = [];
  let combinedCoords = [];
  let counts = [];
  activities.forEach((activity) => {
    try {
      const activityCoordinates = polyline
        .decode(activity.summary_polyline)
        .map(([lng, lat]) => [lat, lng]);
      const start = activityCoordinates[0];
      let geoStart;
      if (isPointInGeoJson(start[1], start[0], geoJsonQuebec))
        geoStart = geoJsonQuebec;
      else {
        geoStart = getGeoJsonContainingLatLng(start[1], start[0]);
      }
      const ind = index(geos, geoStart);
      if (ind === -1) {
        geos.push(geoStart);
        combinedCoords = [
          ...combinedCoords,
          ...getExtremeLocations(concatCoords(geoStart)),
        ];
        counts.push(1);
      } else {
        counts[ind]++;
      }
    } catch (error) {
      console.error(error);
    }
  });
  const maxim = Math.max.apply(null, counts);
  console.log("geos", geos);
  console.log("counts", counts);
  const { center, zoom } = centerZoomFromLocations(
    combinedCoords,
    mapWidth,
    mapHeight,
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "3em",
      }}
    >
      <h1>Your heatmap</h1>
      <Map
        width={mapWidth}
        height={mapHeight}
        defaultCenter={[center[1], center[0]]}
        defaultZoom={zoom}
        provider={getProvider()}
        twoFingerDrag={false}
        mouseEvents={false}
      >
        {geos?.map((geo, index) => (
          <GeoJson
            data={geo}
            styleCallback={() => ({
              fill: `rgba(255, 0, 0, ${rankingAlpha(counts, index, maxim)})`,
            })}
          />
        ))}
      </Map>
    </div>
  );
}

export default WorldMap;
