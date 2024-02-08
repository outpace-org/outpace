import React from "react";
import {Map, GeoJson} from "pigeon-maps";
import {
    centerZoomFromLocations,
    getGeoJsonContainingLatLng,
    getGeoJsonFromCountry,
    getUserActivitiesFromDB,
    mapboxProviderDark
} from "../utils/functions";
import polyline from "@mapbox/polyline";
import _ from "lodash";

function concatCoords(geo) {
    let coords = [];
    geo.features.forEach(feature => {
        coords = [...coords, ...feature.geometry.coordinates];
    })
    return coords[0];
}

function includes(arr, val) {
    let b = false;
    let c = 0;
    arr.forEach(v => {
        if (_.isEqual(val, v)) {
            b = true;
        }
        if (!b) {
            c++;
        }
    })
    if (b)
        return c;
    else
        return -1;
}

function WorldMap({activities}) {
    const mapWidth = window.innerWidth * .8;
    const mapHeight = mapWidth/1.5;
    let geos = [];
    let combinedCoords = [];
    let counts = [];
    activities.forEach(activity => {
        try {
            const activityCoordinates = polyline.decode(activity.summary_polyline).map(([lng, lat]) => [lat, lng]);
            const start = activityCoordinates[0];
            const end = activityCoordinates[activityCoordinates.length - 1];
            const geoStart = getGeoJsonContainingLatLng(start[1], start[0]);
            const ind = includes(geos, geoStart);
            if (ind === -1) {
                geos.push(geoStart);
                combinedCoords = [...combinedCoords, ...concatCoords(geoStart)];
                counts.push(1);
            } else {
                counts[ind]++;
            }
        } catch (error) {
            console.error(error);
        }
    });
    const maxim = Math.max.apply(null, counts)
    console.log("geos", geos)
    console.log("counts", counts)
    const {center, zoom} = centerZoomFromLocations(combinedCoords, mapWidth, mapHeight);
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3em'}}>
            <h1>Your heatmap</h1>
            <Map width={mapWidth}
                 height={mapHeight}
                 defaultCenter={[center[1], center[0]]}
                 defaultZoom={zoom}
                 provider={mapboxProviderDark}
                 twoFingerDrag={false}
                 mouseEvents={false}>
                {geos?.map((geo, index) => (
                    <GeoJson
                        data={geo}
                        styleCallback={() => ({fill: `rgba(255, 0, 0, ${.2 + 0.8 * (counts[index] / maxim)})`})}
                    />
                ))}
            </Map>
        </div>
    );
}

export default WorldMap;
