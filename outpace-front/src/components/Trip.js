import React from "react";
import {Map, Marker, GeoJson} from "pigeon-maps";
import turfBbox from '@turf/bbox'
import {featureCollection as turfFeatureCollection, point as turfPoint} from '@turf/helpers'
import geoViewport from '@mapbox/geo-viewport'

var polyline = require('@mapbox/polyline');
const {REACT_APP_MAPBOX_ACCESS_TOKEN} = process.env;

function centerZoomFromLocations(locations, width = 564, height = 300) {
    const points = locations.map(([lat, lng]) => turfPoint([lat, lng]));
    const features = turfFeatureCollection(points)
    const bounds = turfBbox(features)
    const {center, zoom} = geoViewport.viewport(bounds, [width, height])
    console.log("bounds", bounds, "center", center, "zoom", zoom)
    return {
        center,
        zoom: Math.min(zoom, 13)
    }
}

function mapboxProvider(x, y, z, dpr) {
    return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}?access_token=${REACT_APP_MAPBOX_ACCESS_TOKEN}`;
}

function Trip({trip}) {
    let coordinates = [];
    let totalDistance = 0;
    let totalElevationGain = 0;
    trip.forEach(activity => {
        try {
            const activityCoordinates = polyline.decode(activity.summary_polyline).map(([lng, lat]) => [lat, lng]);
            coordinates = [...coordinates, ...activityCoordinates];
            totalDistance +=activity.distance;
            totalElevationGain += activity.total_elevation_gain;
        } catch (error) {
            console.error(error);
        }
    });
    console.log("full coords", coordinates)
    const {center, zoom} = centerZoomFromLocations(coordinates);
    return (

        <div className="row">
            <div className="column33">
                <p>Total Elevation Gain: {totalElevationGain}</p>
                <p>Distance: {totalDistance}</p>
                <p>Start Date: {trip[0].start_date}</p>
                <p>Start Date: {trip[trip.length-1].start_date}</p>
            </div>
            <div className="column66">
                <Map height={300} defaultCenter={[center[1], center[0]]} defaultZoom={zoom} provider={mapboxProvider}>

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

export default Trip;
