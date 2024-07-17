import React, {useEffect, useState} from "react";
import {Map, GeoJson} from "pigeon-maps";
import {
    centerZoomFromLocations,
    concatCoords,
    getExtremeLocations,
    getGeoJsonContainingLatLng,
    getProvider,
    isPointInGeoJson,
    index,
} from "../utils/functions";
import polyline from "@mapbox/polyline";
import Activities from "./Activities";
import {Dialog, DialogContent} from "@mui/material";

function useGeoJson() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("quebec.geojson")
            .then((response) => response.json())
            .then((jsonData) => setData(jsonData))
            .catch((error) => console.error(error));
    }, []);

    return data;
}

function rankingAlpha(activities, index) {
    const maxim = Math.max.apply(null, activities.map(ids => ids.length));
    return Math.sqrt(0.1 + 0.8 * (activities[index].length / maxim));
}

function WorldMap({activities, name}) {
    const geoJsonQuebec = useGeoJson();
    const [countryActivitiesOpen, setCountriesActivitiesOpen] = useState(false);
    const [currentOpenActivity, setCurrentOpenActivity] = useState(null);

    const handleClickOpen = (activities) => {
        setCountriesActivitiesOpen(true);
        setCurrentOpenActivity(activities);
    };

    const handleCloseOpenActivity = () => {
        setCountriesActivitiesOpen(false);
    };

    // Don't try to use geoJson until it's defined
    if (!geoJsonQuebec) {
        return <div>Loading...</div>;
    }
    const mapWidth = window.innerWidth * 0.8;
    const mapHeight = mapWidth / 1.5;
    let geos = [];
    let combinedCoords = [];
    let activitiesInEachCountry = [];
    activities.forEach((activity) => {
        try {
            const activityCoordinates = polyline
                .decode(activity.summary_polyline)
                .map(([lng, lat]) => [lat, lng]);
            const start = activityCoordinates[0];
            let geoStart;
            if (isPointInGeoJson(start[1], start[0], geoJsonQuebec)) geoStart = geoJsonQuebec; else {
                geoStart = getGeoJsonContainingLatLng(start[1], start[0]);
            }
            const ind = index(geos, geoStart);
            if (ind === -1) {
                geos.push(geoStart);
                combinedCoords = [...combinedCoords, ...getExtremeLocations(concatCoords(geoStart)),];
                activitiesInEachCountry.push([activity]); // Store the activity ID in a new sub-array
            } else {
                activitiesInEachCountry[ind].push(activity); // Add the activity ID to the existing sub-array
            }
        } catch (error) {
            console.error(error);
        }
    });
    console.log("geos", geos);
    console.log("activityIds", activitiesInEachCountry); // Log the activity IDs
    const {center, zoom} = centerZoomFromLocations(combinedCoords, mapWidth, mapHeight,);

    return (<div
        style={{
            display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3em",
        }}
    >
        <h1>{name} heatmap</h1>
        <Dialog
            open={countryActivitiesOpen}
            onClose={handleCloseOpenActivity}
            fullWidth={true}
            maxWidth="md"
            PaperProps={{
                style: {maxHeight: '80vh'},
            }}
        >
            <DialogContent>
                <Activities activities={currentOpenActivity}/>
            </DialogContent>
        </Dialog>
        <Map
            width={mapWidth}
            height={mapHeight}
            defaultCenter={[center[1], center[0]]}
            defaultZoom={zoom}
            provider={getProvider(true)}
            twoFingerDrag={false}
            mouseEvents={false}
        >
            {geos?.map((geo, index) => (
                <GeoJson
                    data={geo}
                    onClick={() => {
                        console.log("the activities", activitiesInEachCountry[index].map(activity => activity.name))
                        handleClickOpen(activitiesInEachCountry[index]);
                    }}
                    styleCallback={() => ({
                        fill: `rgba(255, 0, 0, ${rankingAlpha(activitiesInEachCountry, index)})`,
                    })}
                />))}
        </Map>
    </div>);
}

export default WorldMap;
