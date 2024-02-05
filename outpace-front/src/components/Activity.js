import React from "react";
import {Map, Marker, GeoJson} from "pigeon-maps";
import turfBbox from '@turf/bbox'
import {featureCollection as turfFeatureCollection, point as turfPoint} from '@turf/helpers'
import geoViewport from '@mapbox/geo-viewport'
import {centerZoomFromLocations, mapboxProvider} from "../utils/functions";

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
                <p>Total Elevation Gain: {activity["total_elevation_gain"]}</p>
                <p>Elapsed Time: {activity.elapsed_time}</p>
                <p>Distance: {activity.distance}</p>
                <p>Type: {activity.type}</p>
                <p>Start: {activity.start_latlng[0] + ";" + activity.start_latlng[1]}</p>
                <p>End: {activity.end_latlng[0] + ";" + activity.end_latlng[1]}</p>
                <p>Start Date: {activity.start_date}</p>
            </div>
            <div className="column66">
                <Map width={mapWidth} height={mapHeight} defaultCenter={[center[1], center[0]]} defaultZoom={zoom} provider={mapboxProvider}>
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
