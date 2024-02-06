import React from "react";
import {Map, Marker, GeoJson} from "pigeon-maps";
import turfBbox from '@turf/bbox'
import {featureCollection as turfFeatureCollection, point as turfPoint} from '@turf/helpers'
import geoViewport from '@mapbox/geo-viewport'
import {centerZoomFromLocations, mapboxProvider} from "../utils/functions";

var polyline = require('@mapbox/polyline');


function SmallActivity({activity, crit}) {
    var coordinates = [];
    try {
        coordinates = polyline.decode(activity.summary_polyline).map(([lng, lat]) => [lat, lng]);
    } catch (error) {
        console.error(error);
        coordinates = polyline.decode(activity.map.summary_polyline).map(([lng, lat]) => [lat, lng]);
    }
    const mid = coordinates[parseInt(coordinates.length / 2)];
    const mapWidth = window.innerWidth * 0.3;
    const mapHeight = window.innerHeight * 0.2;
    const {center, zoom} = centerZoomFromLocations(coordinates, mapWidth, mapHeight);
    console.log("mid", mid, "center", center)
    return (
        <div>
            <h3>{activity.name}: {activity[crit]}</h3>
            <Map width={mapWidth} height={mapHeight} defaultCenter={[center[1], center[0]]} defaultZoom={zoom}
                 provider={mapboxProvider} twoFingerDrag={false} mouseEvents={false}>
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
    );
}

export default SmallActivity;
