import React, {useEffect, useState} from "react";
import {Map, GeoJson} from "pigeon-maps";
import {feature} from '@turf/helpers'
import {
    centerZoomFromLocations, getCodes,
    getGeoJsonContainingLatLng, includes,
    mapboxProvider
} from "../utils/functions";
import {connect, useSelector} from "react-redux";
import { faZoomIn } from '@fortawesome/free-solid-svg-icons';
import {setZoomeds} from "../actions";

let _ = require('lodash');


var polyline = require('@mapbox/polyline');

function concatCoords(geo) {
    let coords = [];
    geo.features.forEach(feature => {
        coords = [...coords, ...feature.geometry.coordinates];
    })
    return coords[0];
}

function Trip({trip, index, onButtonClick}) {
    const [update, setUpdate] = useState(0);
    const zoomeds = useSelector((state) => state.zoomeds);
    const zoomed = zoomeds[index];
    console.log("zoomed", zoomed)
    const theClass = zoomed ? "fas fa-search-minus" : "fas fa-search-plus";
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
            const end = activityCoordinates[activityCoordinates.length - 1];
            const geoStart = getGeoJsonContainingLatLng(start[1], start[0])
            const geoEnd = getGeoJsonContainingLatLng(end[1], end[0])

            if (!includes(geos, geoStart)) {
                geos.push(geoStart);
                combinedCoords = [...combinedCoords, ...concatCoords(geoStart)];
                ind++;
            }
            if (!includes(geos, geoEnd)) {
                geos.push(geoEnd);
                combinedCoords = [...combinedCoords, ...concatCoords(geoEnd)];
                ind++;
            }
        } catch (error) {
            console.error(error);
        }
    });
    const mapWidth = window.innerWidth * 0.6;
    const mapHeight = window.innerHeight * 0.4;
    const centerZoom = centerZoomFromLocations(zoomed ? coordinates : combinedCoords, mapWidth, mapHeight);
    const handleToggleClick = (event) => {
        event.stopPropagation();
        onButtonClick(index);
        setUpdate(update+1);
    };
    return (
        <div className="row" style={{padding: "10px"}}>
            <div className="column33">
                <h2>Trip #{index + 1}</h2>
                <p>Total Elevation Gain: {totalElevationGain}</p>
                <p>Distance: {totalDistance}</p>
                <p>Start Date: {trip.activities[0].start_date}</p>
                <p>End Date: {trip.activities[trip.activities.length - 1].start_date}</p>
            </div>
            <div className="column66" style={{position: "relative"}}>
                <Map
                    width={mapWidth}
                    height={mapHeight}
                    center={[centerZoom.center[1], centerZoom.center[0]]}
                    zoom={centerZoom.zoom}
                    provider={mapboxProvider}
                    twoFingerDrag={false}
                    mouseEvents={false}
                >


                    {geos?.map((geo, index) => (
                        <GeoJson
                            data={geo}
                            //styleCallback={() => ({ fill: `rgb(255, ${255-geoColor[1]}, ${255-geoColor[1]})` })}
                            styleCallback={() => ({fill: `rgba(${255 * (index + 1) / geos.length}, 0, ${255 * (1 - (index + 1) / geos.length)}, .3)`})}
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
                <button onClick={handleToggleClick} style={{position: "absolute", top: "1em", right: "6em"}}>
                    <i className={theClass}></i>
                </button>
            </div>
        </div>
    );
}

const mapDispatchToProps = {
    setZoomeds
};

export default connect(null, mapDispatchToProps)(Trip);

