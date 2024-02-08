import React from "react";
import {Map, Marker, GeoJson} from "pigeon-maps";
import turfBbox from '@turf/bbox'
import {featureCollection as turfFeatureCollection, point as turfPoint} from '@turf/helpers'
import geoViewport from '@mapbox/geo-viewport'
import {
    centerZoomFromLocations,
    convertToKm,
    formatDate,
    formatNumber,
    formatTime,
    mapboxProvider
} from "../utils/functions";

const polyline = require('@mapbox/polyline');


function Activity({activity}) {
    var coordinates = [];
    try {
        coordinates = polyline.decode(activity.summary_polyline).map(([lng, lat]) => [lat, lng]);
    } catch (error) {
        console.error(error);
        coordinates = polyline.decode(activity.map.summary_polyline).map(([lng, lat]) => [lat, lng]);
    }
    const mid = coordinates[parseInt(coordinates.length / 2)];
    const mapWidth = window.innerWidth * 0.5;
    const mapHeight = window.innerHeight * 0.3;
    const {center, zoom} = centerZoomFromLocations(coordinates, mapWidth, mapHeight);
    console.log("mid", mid, "center", center)
    return (
        <div className="row">
            <div className="column33">
                <h3>{activity.name}</h3>
                <p>Total Elevation Gain: {formatNumber(activity["total_elevation_gain"])}m</p>
                <p>Elapsed Time: {formatTime(activity.elapsed_time)}</p>
                <p>Distance: {formatNumber(convertToKm(activity.distance))}km</p>
                <p>Type: {activity.type}</p>
                <p>Start Date: {formatDate(activity.start_date)}</p>
            </div>
            <div className="column66">
                <Map width={mapWidth} height={mapHeight} defaultCenter={[center[1], center[0]]} defaultZoom={zoom}
                     provider={mapboxProvider}>
                    <GeoJson
                        data={{
                            type: 'FeatureCollection',
                            features: [{
                                type: 'Feature',
                                geometry: {
                                    type: 'LineString',
                                    coordinates,
                                },
                                properties: {
                                    prop0: 'value0',
                                    prop1: 0.0,
                                },
                            },
                            ],
                        }}
                        styleCallback={(feature, hover) => {
                            if (feature.geometry.type === 'LineString') {
                                return {strokeWidth: '2', stroke: 'black'}
                            }
                            return {fill: '#d4e6ec99', strokeWidth: '1', stroke: 'white', r: '20'}
                        }}
                    />
                </Map>
            </div>
        </div>
    );
}

export default Activity;
