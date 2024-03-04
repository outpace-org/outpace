import React, { useEffect, useState } from "react";
import { Map, GeoJson, Marker } from "pigeon-maps";
import {
  centerZoomFromLocations,
  concatCoords,
  getGeoJsonContainingLatLng,
  includes,
  isPointInGeoJson,
  mapboxProvider,
  convertToKm,
  formatNumber,
  nameTrip,
  getExtremeLocations,
  getProvider,
} from "../utils/functions";
import { connect, useSelector } from "react-redux";
import { setZoomeds } from "../actions";

var polyline = require("@mapbox/polyline");

const calculateDuration = (startDate, endDate, elapsed_time) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.ceil(
    ((end - start) / 1000 + elapsed_time) / (60 * 60 * 24),
  );
  return duration;
};

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

function Trip({ trip, index, onButtonClick }) {
  const geoJson = useGeoJson();
  const zoomeds = useSelector((state) => state.zoomeds);
  const [update, setUpdate] = useState(0);
  // Don't try to use geoJson until it's defined
  if (!geoJson) {
    return <div>Loading...</div>;
  }
  const zoomed = zoomeds[index];
  console.log("zoomed", zoomed);
  const theClass = zoomed ? "fas fa-search-minus" : "fas fa-search-plus";
  let coordinates = [];
  let totalDistance = 0;
  let totalElevationGain = 0;
  let geos = [];
  let combinedCoords = [];
  let ind = 0;
  trip.activities.forEach((activity) => {
    try {
      const activityCoordinates = polyline
        .decode(activity.summary_polyline)
        .map(([lng, lat]) => [lat, lng]);
      coordinates = [...coordinates, ...activityCoordinates];
      totalDistance += activity.distance;
      totalElevationGain += activity.total_elevation_gain;
      const start = activityCoordinates[0];
      const end = activityCoordinates[activityCoordinates.length - 1];
      let geoStart;
      let geoEnd;
      if (isPointInGeoJson(start[1], start[0], geoJson)) geoStart = geoJson;
      else {
        geoStart = getGeoJsonContainingLatLng(start[1], start[0]);
      }
      if (isPointInGeoJson(end[1], end[0], geoJson)) {
        geoEnd = geoJson;
      } else {
        geoEnd = getGeoJsonContainingLatLng(end[1], end[0]);
      }

      if (!includes(geos, geoStart)) {
        geos.push(geoStart);
        combinedCoords = [
          ...combinedCoords,
          ...getExtremeLocations(concatCoords(geoStart)),
        ];
        ind++;
      }
      if (!includes(geos, geoEnd)) {
        geos.push(geoEnd);
        combinedCoords = [
          ...combinedCoords,
          ...getExtremeLocations(concatCoords(geoEnd)),
        ];
        ind++;
      }
    } catch (error) {
      console.error(error);
    }
  });
  const mapWidth = window.innerWidth * 0.6;
  const mapHeight = window.innerHeight * 0.4;
  const centerZoom = centerZoomFromLocations(
    zoomed ? coordinates : combinedCoords,
    mapWidth,
    mapHeight,
  );
  const handleToggleClick = (event) => {
    event.stopPropagation();
    onButtonClick(index);
    setUpdate(update + 1);
  };

  const totalElevationGainDisplay = formatNumber(totalElevationGain);
  const totalDistanceDisplay = formatNumber(convertToKm(totalDistance));
  const duration = calculateDuration(
    trip.activities[0].start_date,
    trip.activities[trip.activities.length - 1].start_date,
    trip.activities[trip.activities.length - 1].elapsed_time,
  );
  return (
    <div className="row" style={{ padding: "10px" }}>
      <div className="column33">
        {/*<h2>Trip #{index + 1}</h2>*/}
        <h2>{nameTrip(trip)}</h2>
        <p>Total Elevation Gain: {totalElevationGainDisplay}m</p>
        <p>Distance: {totalDistanceDisplay}km</p>
        <p>Duration: {duration} days</p>
      </div>
      <div className="column66" style={{ position: "relative" }}>
        <Map
          width={mapWidth}
          height={mapHeight}
          center={[centerZoom.center[1], centerZoom.center[0]]}
          zoom={centerZoom.zoom}
          provider={getProvider()}
          twoFingerDrag={false}
          mouseEvents={false}
        >
          {geos?.map((geo, index) => (
            <GeoJson
              data={geo}
              //styleCallback={() => ({ fill: `rgb(255, ${255-geoColor[1]}, ${255-geoColor[1]})` })}
              styleCallback={() => ({
                fill: `rgba(${(255 * (index + 1)) / geos.length}, 0, ${255 * (1 - (index + 1) / geos.length)}, .3)`,
              })}
            />
          ))}

          <GeoJson
            data={{
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates,
                  },
                  properties: {
                    prop0: "value0",
                    prop1: 0.0,
                  },
                },
              ],
            }}
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

          {trip.activities.map(
            (acti, index) =>
              index < trip.activities.length - 1 &&
              zoomed && <Marker anchor={acti.end_latlng} title={acti.name} />,
          )}
        </Map>
        <button
          onClick={handleToggleClick}
          style={{ position: "absolute", top: "1em", right: "6em" }}
        >
          <i className={theClass}></i>
        </button>
      </div>
    </div>
  );
}

const mapDispatchToProps = {
  setZoomeds,
};

export default connect(null, mapDispatchToProps)(Trip);
