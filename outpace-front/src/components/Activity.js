import React, {useEffect, useState} from "react";
import {Map, Marker, GeoJson} from "pigeon-maps";
import {
    addElevationsToActivity,
    centerZoomFromLocations,
    convertToKm,
    formatDate,
    formatNumber,
    formatTime, getProvider,
    mapboxProvider, REACT_APP_GOOGLE_API_KEY
} from "../utils/functions";
import {addAltitudeToGeoJson} from "../utils/ElevationComputation";

const polyline = require('@mapbox/polyline');

function Activity({activity}) {
    const [geoWithAltitudes, setGeoWithAltitudes] = useState(null);
    let coordinates = [];
    try {
        coordinates = polyline.decode(activity.summary_polyline).map(([lng, lat]) => [lat, lng]);
    } catch (error) {
        console.error(error);
        coordinates = polyline.decode(activity.map.summary_polyline).map(([lng, lat]) => [lat, lng]);
    }
    const altitudes = activity.elevations;
    const addAltitudes = altitudes.length === coordinates.length;
    console.log("comparaison", addAltitudes, coordinates.length, altitudes.length, activity)
    const actJson = {
        "type": "FeatureCollection",
        "features": coordinates.slice(0, -1).map((coordinate, i) => {
            const nextCoordinate = coordinates[i + 1];
            return {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": addAltitudes ? [[coordinate[0], coordinate[1], altitudes[i]], [nextCoordinate[0],
                        nextCoordinate[1], altitudes[i+1]]] : [coordinate, nextCoordinate]
                }
            };
        })
    };

    if (addAltitudes && !geoWithAltitudes){
        setGeoWithAltitudes(actJson);
    }

    useEffect(() => {
        const fetchAltitudes = async () => {
            const result = await addAltitudeToGeoJson(actJson);
            setGeoWithAltitudes(result);
            await addElevationsToActivity(activity.id, result);
        };
        if (!geoWithAltitudes)
            fetchAltitudes();
    }, [actJson, activity.id, geoWithAltitudes]);

    const mapWidth = window.innerWidth * 0.5;
    const mapHeight = window.innerHeight * 0.3;
    const {center, zoom} = centerZoomFromLocations(coordinates, mapWidth, mapHeight);
    if (!geoWithAltitudes) {
        return getMapWithNoColorDiv();
    }

    const geoJsonWithColors = {
        "type": "FeatureCollection",
        "features": geoWithAltitudes.features.map((feature, i) => {
            const coordinate = feature.geometry.coordinates[0];
            const nextCoordinate = feature.geometry.coordinates[1];
            const diff = nextCoordinate[2] - coordinate[2];
            let color;
            if (diff > 0){ //going up
                color = `rgb(${Math.abs(Math.min(255, 10*(nextCoordinate[2] - coordinate[2])))}, 0, 0)`;
            } else {
                color = `rgb(0, ${Math.abs(Math.min(255, 10*(nextCoordinate[2] - coordinate[2])))}, 0)`;
            }
            return {
                "type": "Feature",
                "properties": {
                    "stroke": color
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[coordinate[0], coordinate[1]], [nextCoordinate[0], nextCoordinate[1]]]
                }
            };
        })
    };

    function getMapWithColorDiv() {
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
                         provider={getProvider()}
                    >
                        <GeoJson
                            data={geoJsonWithColors}
                            styleCallback={(feature, hover) => {
                                if (feature.geometry.type === 'LineString') {
                                    return {strokeWidth: '2', stroke: feature.properties.stroke}
                                }
                                return {fill: '#d4e6ec99', strokeWidth: '1', stroke: 'white', r: '20'}
                            }}
                        />
                    </Map>
                </div>
            </div>
        );
    }
    function getMapWithNoColorDiv() {
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
                         provider={getProvider()}
                    >
                        <GeoJson
                            data={actJson}
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

    return getMapWithColorDiv();
}
export default Activity;
