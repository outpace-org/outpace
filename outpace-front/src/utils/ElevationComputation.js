import {
  Ion,
  sampleTerrainMostDetailed,
  Cartographic,
  createWorldTerrainAsync,
} from "cesium";
import { map, get } from "lodash/fp";
import Bluebird from "bluebird";
import { REACT_APP_ION_DEFAULT_ACCESS_TOKEN } from "./functions";

Ion.defaultAccessToken = REACT_APP_ION_DEFAULT_ACCESS_TOKEN;

let terrainProvider;

export const generateCesiumCoordinates = (positions) => {
  if (Array.isArray(positions)) {
    // is an array check
    if (Array.isArray(positions[0])) {
      // is an array of array
      return map((p) => {
        if (p.length == 2) {
          return Cartographic.fromDegrees(p[0], p[1]);
        } else if (p.length == 3) {
          return Cartographic.fromDegrees(p[0], p[1], p[2]);
        } else {
          throw "Object must have only 2 or 3 coordinates";
        }
      }, positions);
    } else {
      // Should be a single coordinate, check if its an array of numbers only
      if (!positions.some(isNaN)) {
        if (positions.length == 2) {
          return Cartographic.fromDegrees(positions[0], positions[1]);
        } else if (positions.length == 3) {
          return Cartographic.fromDegrees(
            positions[0],
            positions[1],
            positions[2],
          );
        } else {
          throw "Object must have only 2 or 3 coordinates";
        }
      } else {
        throw "Object must be and array of numbers";
      }
    }
  } else {
    throw "Object must an array";
  }
};

export const addAltitudeToLocation = async ({
  longitude,
  latitude,
  ...rest
}) => {
  if (!terrainProvider) terrainProvider = await createWorldTerrainAsync();
  const positions = generateCesiumCoordinates([longitude, latitude]);
  const updatedPositions = await sampleTerrainMostDetailed(terrainProvider, [
    positions,
  ]);
  return { longitude, latitude, ...rest, altitude: updatedPositions[0].height };
};

export const addAltitudeToGeoJson = async (geoJson, offset = 0) => {
  // This only works with single geometries. Multi geometries not allowed at this moment

  const features = await Bluebird.map(
    geoJson.features,
    async (f) => {
      if (f.geometry.type.toLowerCase() == "point") {
        const coordinates = await addAltitudeToLocation({
          longitude: f.geometry.coordinates[0],
          latitude: f.geometry.coordinates[1],
        });
        f.geometry.coordinates = [
          coordinates.longitude,
          coordinates.latitude,
          coordinates.altitude + offset,
        ];
        return f;
      } else if (f.geometry.type.toLowerCase() == "linestring") {
        const coordinates = await Bluebird.map(
          f.geometry.coordinates,
          async (c) => {
            const coordinates = await addAltitudeToLocation({
              longitude: c[0],
              latitude: c[1],
            });
            return [
              coordinates.longitude,
              coordinates.latitude,
              coordinates.altitude + offset,
            ];
          },
          { concurrency: 10 },
        );
        f.geometry.coordinates = coordinates;
        return f;
      } else if (f.geometry.type.toLowerCase() == "polygon") {
        const coordinates = await Bluebird.map(
          f.geometry.coordinates,
          async (p) => {
            const polygonCoordinates = await Bluebird.map(
              p,
              async (c) => {
                const coordinates = await addAltitudeToLocation({
                  longitude: c[0],
                  latitude: c[1],
                });
                return [
                  coordinates.longitude,
                  coordinates.latitude,
                  coordinates.altitude + offset,
                ];
              },
              { concurrency: 10 },
            );
            return polygonCoordinates;
          },
          { concurrency: 10 },
        );
        f.geometry.coordinates = coordinates;
        return f;
      } else {
        throw "Single geometries only. Multi geometries are not allowed.";
      }
    },
    { concurrency: 10 },
  );

  geoJson.features = features;
  return geoJson;
};
