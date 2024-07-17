import React, {useEffect, useState} from "react";
import {Map, GeoJson, Marker, Overlay} from "pigeon-maps";
import {ReactComponent as MarkerIcon} from '../assets/flag-checkered-solid.svg';

import {
    centerZoomFromLocations,
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
                                        name: activity.name, // Add the name of the activity here
                                    },
                                },
                            ],
                        }}
                        styleCallback={(feature, hover) => {
                            if (hover) {
                                console.log(feature.properties.name); // Print the name when hovered
                                setHoveredActivity(index); // Set the hovered activity index
                            } else {
                                // Delay setting the hoveredActivity state to null
                                setTimeout(() => {
                                    setHoveredActivity(null); // Clear the hovered activity when the mouse leaves
                                }, 100);
                            }
                            if (feature.geometry.type === "LineString") {
                                return {strokeWidth: "2", stroke: "black"};
                            }
                            return {
                                fill: "#d4e6ec99",
                                strokeWidth: "1",
                                stroke: "white",
                                r: "20",
                            };
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
                        background: "white",
                        borderRadius: "10px",
                        padding: "10px",
                    }}
                >
                    <p>{activities[hoveredActivity].name}</p>
                </div>
            )}
        </Map>
    );
}

export default Activities;