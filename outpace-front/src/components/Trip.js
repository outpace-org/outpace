import React from "react";
import {Map, GeoJson} from "pigeon-maps";
import {feature} from '@turf/helpers'
import {
    centerZoomFromLocations, getCodes,
    getGeoJsonContainingLatLng,
    mapboxProvider
} from "../utils/functions";
let _ = require('lodash');


var polyline = require('@mapbox/polyline');

function concatCoords(geo) {
    let coords = [];
    geo.features.forEach(feature => {
        coords = [...coords, ...feature.geometry.coordinates];
    })
    return coords[0];
}

function includes(arr, val){
    let b = false;
    arr.forEach(v => {
        if (_.isEqual(val, v)){
            b = true;
        }
    })
    return b;
}

function Trip({trip, index}) {
    console.log("index there is ", index)
    let coordinates = [];
    let totalDistance = 0;
    let totalElevationGain = 0;
    let geos = [];
    let combinedCoords = [];
    let ind = 0;
    trip.activities.forEach(activity => {
        try {
            const activityCoordinates = polyline.decode(activity.summary_polyline).map(([lng, lat]) => [lat, lng]);
            coordinates = [...coordinates, ...activityCoordinates];
            totalDistance += activity.distance;
            totalElevationGain += activity.total_elevation_gain;
            const start = activityCoordinates[0];
            const end = activityCoordinates[activityCoordinates.length-1];
            const geoStart = getGeoJsonContainingLatLng(start[1], start[0])
            const geoEnd = getGeoJsonContainingLatLng(end[1], end[0])

            if (!includes(geos, geoStart)){
                geos.push(geoStart);
                combinedCoords = [...combinedCoords, ...concatCoords(geoStart)];
                ind++;
            }
            if (!includes(geos, geoEnd)){
                geos.push(geoEnd);
                combinedCoords = [...combinedCoords, ...concatCoords(geoEnd)];
                ind++;
            }
        } catch (error) {
            console.error(error);
        }
    });
    console.log("geos", geos)
    const mapWidth = window.innerWidth * 0.6;
    const mapHeight = window.innerHeight * 0.4;
    const {center, zoom} = centerZoomFromLocations(combinedCoords, mapWidth, mapHeight);
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
                    twoFingerDrag={false}
                    mouseEvents={false}
                >

                    {geos?.map((geo, index) => (
                        <GeoJson
                            data={geo}
                            //styleCallback={() => ({ fill: `rgb(255, ${255-geoColor[1]}, ${255-geoColor[1]})` })}
                            styleCallback={() => ({ fill: `rgba(${255*(index+1)/geos.length}, 0, ${255*(1-(index+1)/geos.length)}, .3)` })}
                        />
                    ))}

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
