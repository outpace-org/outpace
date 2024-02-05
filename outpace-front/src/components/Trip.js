import React from "react";
import {Map, Marker, GeoJson} from "pigeon-maps";
import turfBbox from '@turf/bbox'
import {featureCollection as turfFeatureCollection, point as turfPoint} from '@turf/helpers'
import geoViewport from '@mapbox/geo-viewport'
import {centerZoomFromLocations, centerZoomFromLocationsTrip, mapboxProvider} from "../utils/functions";

var polyline = require('@mapbox/polyline');


function Trip({trip, index}) {
    console.log("index there is ", index)
    let coordinates = [];
    let totalDistance = 0;
    let totalElevationGain = 0;

    trip.activities.forEach(activity => {
        try {
            console.log("activitiy", activity.name)
            const activityCoordinates = polyline.decode(activity.summary_polyline).map(([lng, lat]) => [lat, lng]);
            coordinates = [...coordinates, ...activityCoordinates];
            totalDistance += activity.distance;
            totalElevationGain += activity.total_elevation_gain;
        } catch (error) {
            console.error(error);
        }
    });
    //console.log("full coords", coordinates)
    const mapWidth = window.innerWidth * 0.6;
    const mapHeight = window.innerHeight * 0.3;
    const {center, zoom} = centerZoomFromLocations(coordinates, mapWidth, mapHeight);
    return (

        <div className="row" style={{padding: "10px"}}>
            <div className="column33">
                <h2>Trip #{index + 1}</h2>
                <p>Total Elevation Gain: {totalElevationGain}</p>
                <p>Distance: {totalDistance}</p>
                <p>Start Date: {trip.activities[0].start_date}</p>
                <p>End Date: {trip.activities[trip.activities.length - 1].start_date}</p>
            </div>
            <div className="column66">
                <Map
                    width={mapWidth}
                    height={mapHeight}
                    defaultCenter={[center[1], center[0]]}
                    defaultZoom={zoom}
                    provider={mapboxProvider}
                    twoFingerDrag={false} // Disable two finger drag (mobile)
                    mouseEvents={false} // Disable mouse events (desktop)
                >
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
