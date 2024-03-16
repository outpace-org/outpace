import React, { useEffect, useState } from "react";
import { Map, Marker, GeoJson } from "pigeon-maps";
import {
  addElevationsToActivity,
  centerZoomFromLocations, computeColorFromGrad,
  convertToKm,
  formatDate,
  formatNumber,
  formatTime,
  getProvider,
  mapboxProvider,
  REACT_APP_GOOGLE_API_KEY,
} from "../utils/functions";
import { addAltitudeToGeoJson } from "../utils/ElevationComputation";
import haversine from 'haversine-distance'

const polyline = require("@mapbox/polyline");


function Activity({ activity }) {
  const [geoWithElevations, setGeoWithElevations] = useState(null);
  let coordinates = [];
  coordinates = polyline
    .decode(activity.summary_polyline)
    .map(([lng, lat]) => [lat, lng]);
  const elevations = activity.elevations;
  const addElevations = elevations.length === coordinates.length;
  // creating the geoJson containing activity, adding the elevations if they are in db
  const actJson = {
    type: "FeatureCollection",
    features: coordinates.slice(0, -1).map((coordinate, i) => {
      const nextCoordinate = coordinates[i + 1];
      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: addElevations
            ? [
                [coordinate[0], coordinate[1], elevations[i]],
                [nextCoordinate[0], nextCoordinate[1], elevations[i + 1]],
              ]
            : [coordinate, nextCoordinate],
        },
      };
    }),
  };

  // if elevations were stored in db, we set them in the geoJsonWithElevations
  if (addElevations && !geoWithElevations) {
    setGeoWithElevations(actJson);
  }
  useEffect(() => {
    const fetchAltitudes = async () => {
      const result = await addAltitudeToGeoJson(actJson);
      setGeoWithElevations(result);
      await addElevationsToActivity(activity.id, result);
    };
    if (!geoWithElevations) {
      fetchAltitudes().then((r) => console.log("altitudes fetched", r));
    }
  }, [actJson, activity.id, geoWithElevations]);

  const mapWidth = window.innerWidth * 0.5;
  const mapHeight = window.innerHeight * 0.3;
  const { center, zoom } = centerZoomFromLocations(
    coordinates,
    mapWidth,
    mapHeight,
  );
  if (!geoWithElevations) {
    return getMapWithNoColorDiv();
  }

  const geoJsonWithColors = {
    type: "FeatureCollection",
    features: geoWithElevations.features.map((feature, i) => {
      const coordinate = feature.geometry.coordinates[0];
      const nextCoordinate = feature.geometry.coordinates[1];
      const dist = haversine({latitude: coordinate[1], longitude: coordinate[0]},
          {latitude: nextCoordinate[1], longitude: nextCoordinate[0]})
      const diff = nextCoordinate[2] - coordinate[2];
      const grad = Math.abs(diff/dist) * 100; //gradient in %
      let color = computeColorFromGrad(diff, grad);
      return {
        type: "Feature",
        properties: {
          stroke: color,
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [coordinate[0], coordinate[1]],
            [nextCoordinate[0], nextCoordinate[1]],
          ],
        },
      };
    }),
  };

  function getMapWithColorDiv() {
    return (
      <div className="row">
        <div className="column33">
          <h3>{activity.name}</h3>
          <p>
            Total Elevation Gain:{" "}
            {formatNumber(activity["total_elevation_gain"])}m
          </p>
          <p>Elapsed Time: {formatTime(activity.elapsed_time)}</p>
          <p>Distance: {formatNumber(convertToKm(activity.distance))}km</p>
          <p>Type: {activity.type}</p>
          <p>Start Date: {formatDate(activity.start_date)}</p>
        </div>
        <div className="column66">
          <Map
            width={mapWidth}
            height={mapHeight}
            defaultCenter={[center[1], center[0]]}
            defaultZoom={zoom}
            provider={getProvider()}
          >
            <GeoJson
              data={geoJsonWithColors}
              styleCallback={(feature, hover) => {
                if (feature.geometry.type === "LineString") {
                  return {
                    strokeWidth: "2",
                    stroke: feature.properties.stroke,
                  };
                }
                return {
                  fill: "#d4e6ec99",
                  strokeWidth: "1",
                  stroke: "white",
                  r: "20",
                };
              }}
            />
          </Map>
        </div>
      </div>
    );
  }
  function getMapWithNoColorDiv() {
    return (
      <div className="row">
        <div className="column33">
          <h3>{activity.name}</h3>
          <p>
            Total Elevation Gain:{" "}
            {formatNumber(activity["total_elevation_gain"])}m
          </p>
          <p>Elapsed Time: {formatTime(activity.elapsed_time)}</p>
          <p>Distance: {formatNumber(convertToKm(activity.distance))}km</p>
          <p>Type: {activity.type}</p>
          <p>Start Date: {formatDate(activity.start_date)}</p>
        </div>
        <div className="column66">
          <Map
            width={mapWidth}
            height={mapHeight}
            defaultCenter={[center[1], center[0]]}
            defaultZoom={zoom}
            provider={getProvider()}
          >
            <GeoJson
              data={actJson}
              styleCallback={(feature, hover) => {
                if (feature.geometry.type === "LineString") {
                  return { strokeWidth: "2", stroke: "black" };
                }
                return {
                  fill: "#d4e6ec99",
                  strokeWidth: "1",
                  stroke: "white",
                  r: "20",
                };
              }}
            />
          </Map>
        </div>
      </div>
    );
  }

  return getMapWithColorDiv();
}
export default Activity;
