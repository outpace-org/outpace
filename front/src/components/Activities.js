import React, {useEffect, useState} from "react";
import {Map, GeoJson, Marker, Overlay} from "pigeon-maps";
import {ReactComponent as MarkerIcon} from '../assets/flag-checkered-solid.svg';

import {
    centerZoomFromLocations, convertToKm, formatDate, formatNumber, formatTime,
    getProvider,
} from "../utils/functions";

var polyline = require("@mapbox/polyline");

function Activities({activities}) {
    console.log("les activités ici ", activities)
    let coordinates = [];
    activities.forEach((activity) => {
        try {
            // Check if summary_polyline is not null
            if (activity.summary_polyline) {
                const activityCoordinates = polyline
                    .decode(activity.summary_polyline)
                    .map(([lng, lat]) => [lat, lng]);
                coordinates = [...coordinates, ...activityCoordinates];
            }
        } catch (error) {
            console.error(error);
        }
    });
    const mapWidth = window.innerWidth * 0.6;
    const mapHeight = window.innerHeight * 0.6;
    const centerZoom = centerZoomFromLocations(
        coordinates,
        mapWidth,
        mapHeight,
    );

    // Add state for the hovered activity
    const [hoveredActivity, setHoveredActivity] = useState(null);

    return (
        <Map
            width={mapWidth}
            height={mapHeight}
            center={[centerZoom.center[1], centerZoom.center[0]]}
            zoom={centerZoom.zoom}
            provider={getProvider()}
            twoFingerDrag={true}
            mouseEvents={true}
        >
            {activities.map((activity, index) => {
                let activityCoordinates = [];
                if (activity.summary_polyline) {
                    activityCoordinates = polyline
                        .decode(activity.summary_polyline)
                        .map(([lng, lat]) => [lat, lng]);
                }
                return (
                    <GeoJson
                        key={index}
                        data={{
                            type: "FeatureCollection",
                            features: [
                                {
                                    type: "Feature",
                                    geometry: {
                                        type: "LineString",
                                        coordinates: activityCoordinates,
                                    },
                                    properties: {
                                        name: activity.name,
                                    },
                                },
                            ],
                        }}
                        styleCallback={(feature, hover) => {
                            if (hover) {
                                console.log(feature.properties.name); // Print the name when hovered
                                setHoveredActivity(index); // Set the hovered activity index
                                return {strokeWidth: "2", stroke: "red"}; // Change the color to red when hovered
                            } else {
                                // Delay setting the hoveredActivity state to null
                                setTimeout(() => {
                                    setHoveredActivity(null); // Clear the hovered activity when the mouse leaves
                                }, 100);
                                return {
                                    fill: "#d4e6ec66",
                                    strokeWidth: "1",
                                    stroke: "black",
                                    r: "20",
                                };
                            }
                        }}
                    />
                );
            })}
            {hoveredActivity !== null && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: "#d4e6ec79",
                        borderRadius: "10px",
                        padding: "10px",
                    }}
                >
                    <h3>{activities[hoveredActivity].name}</h3>
                    <p>
                        Total Elevation Gain:{" "}
                        {formatNumber(activities[hoveredActivity]["total_elevation_gain"])}m
                    </p>
                    <p>Elapsed Time: {formatTime(activities[hoveredActivity].elapsed_time)}</p>
                    <p>Distance: {formatNumber(convertToKm(activities[hoveredActivity].distance))}km</p>
                    <p>Type: {activities[hoveredActivity].type}</p>
                    <p>Start Date: {formatDate(activities[hoveredActivity].start_date)}</p>
                </div>
            )}
        </Map>
    );
}

export default Activities;