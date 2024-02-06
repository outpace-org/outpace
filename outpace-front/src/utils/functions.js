import axios from "axios";
import Cookies from 'js-cookie';
import {featureCollection as turfFeatureCollection, point as turfPoint} from "@turf/helpers";
import turfBbox from "@turf/bbox";
import geoViewport from "@mapbox/geo-viewport";
import geoJson from "world-geojson";
import getMap from "@geo-maps/countries-maritime-10m";
import GeoJsonPolygonLookup from "geojson-geometries-lookup";


const {REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET, REACT_APP_HOST_URL, REACT_APP_MAPBOX_ACCESS_TOKEN} = process.env;


export function setStravaId(id) {
    Cookies.set('strava_id', id, {expires: 7});
};

export const getStravaId = Cookies.get('strava_id');

export const getParamValues = (url) => {
    return url
        .slice(1)
        .split("&")
        .reduce((prev, curr) => {
            const [title, value] = curr.split("=");
            prev[title] = value;
            return prev;
        }, {});
};

export const cleanUpAuthToken = (str) => {
    return str.split("&")[1].slice(5);
};

export const testAuthGetter = async (authTok) => {
    try {
        const response = await axios.post(
            `https://www.strava.com/api/v3/oauth/token?client_id=${REACT_APP_CLIENT_ID}&client_secret=${REACT_APP_CLIENT_SECRET}&code=${authTok}&grant_type=authorization_code`
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const postUserToken = async (toks) => {
    try {
        const response = await fetch(`${REACT_APP_HOST_URL}/register_token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toks)
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

// Function to get refresh token from the database
async function getRefreshTokenFromDB(stravaId) {
    try {
        const response = await axios.get(`${REACT_APP_HOST_URL}/refresh_token_strava/${stravaId}`);
        return response.data;
    } catch (error) {
        console.error('Error during API call', error);
    }
}

// Function to post new token to the database
async function postNewToken(stravaId, newToken, newRefreshToken, expiresAt) {
    try {
        const response = await axios.put(`${REACT_APP_HOST_URL}/refreshtoken/${stravaId}/AthleteSLAT/`, {
            "token": newToken,
            "read_activity": true,
            "expires_at": expiresAt,
            "new_refresh_token": newRefreshToken
        });
        return response.data;
    } catch (error) {
        console.error('Error during API call', error);
    }
}


// To fetch new token from strava and store it in DB
export const reloadToken = async (stravaId) => {

    // Retrieve client_id and client_secret from .env
    const client_id = process.env.REACT_APP_CLIENT_ID;
    const client_secret = process.env.REACT_APP_CLIENT_SECRET;

    // Retrieve refresh_token from the function getRefreshTokenFromDB
    const refresh_token = await getRefreshTokenFromDB(stravaId);
    try {
        const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": 'refresh_token',
            "refresh_token": refresh_token.refresh_token,
        });
        console.log("response", response)

        // Call the function postNewToken with the new token and new refresh_token
        await postNewToken(stravaId, response.data.access_token, response.data.refresh_token, response.data.expires_at);
        return response.data;
    } catch (error) {
        console.error('Error during API call', error);
    }
};

export const postUserActivities = async (acts) => {
    try {
        const response = await fetch(`${REACT_APP_HOST_URL}/activities/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(acts.data)
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const getLastActivityTimestamp = async (userID) => {
    try {
        const str = `${REACT_APP_HOST_URL}/activities/last_date/${userID}`;
        console.log("Trying to fetch", str)
        const response = await fetch(str);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = response.json()
        return await data;
    } catch (error) {
        console.log(error);
    }
};

// export const fetchStravaAfterDate

export const getUserActivitiesElevationFromDB = async (userID) => {
    try {
        const str = `${REACT_APP_HOST_URL}/activities/elevation/${userID}/30000`;
        console.log("Trying to fetch", str)
        const response = await fetch(str);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log(error);
    }
};

export const getUserActivitiesFromDB = async (userID, exclude = []) => {
    try {
        let str = `${REACT_APP_HOST_URL}/activities/${userID}`;
        if (exclude.length > 0) {
            const excludeParams = exclude.map(id => `exclude=${id}`).join('&');
            str += `?${excludeParams}`;
        }
        console.log("Trying to fetch", str)
        const response = await fetch(str);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log(error);
    }
};


export const getUserTripsFromDB = async (stravaId) => {
    try {
        const str = `${REACT_APP_HOST_URL}/trips/${stravaId}`;
        console.log("Trying to fetch", str)
        const response = await fetch(str);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = response.json();
        return await data;
    } catch (error) {
        console.log(error);
    }
};

export const fetchCountryValsFromDB = async (stravaId) => {
    try {
        const str = `${REACT_APP_HOST_URL}/activities/countries/${stravaId}`;
        console.log("Trying to fetch", str)
        const response = await fetch(str);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = response.json();
        return await data;
    } catch (error) {
        console.log(error);
    }
};

export const getUserData = async (userID, accessToken) => {
    try {
        const response = await axios.get(
            `https://www.strava.com/api/v3/athletes/${userID}/stats`,
            {headers: {Authorization: `Bearer ${accessToken}`}}
        );
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const getUserActivities = async (userID, accessToken) => {
    try {
        const response = await axios.get(
            `https://www.strava.com/api/v3/athletes/${userID}/activities?after=1577836800&per_page=200`,
            {headers: {Authorization: `Bearer ${accessToken}`}}
        );
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const getUserActivitiesAfter = async (userID, accessToken, after) => {
    try {
        let str = `https://www.strava.com/api/v3/athletes/${userID}/activities?after=${after}&per_page=200`
        console.log(str)
        const response = await axios.get(str
            ,
            {headers: {Authorization: `Bearer ${accessToken}`}}
        );
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const convertToMiles = (meters) => {
    return (meters * 0.621371) / 1000;
};

export async function fetchNewActivities(strava_id) {
    const data = await getLastActivityTimestamp(strava_id);
    let mTimestamp = data.last_date;
    const expired = true;
    let token = data.token;
    if (expired) {
        const newTokenData = await reloadToken(strava_id);
        console.log("getting new token for ", strava_id);
        token = newTokenData.access_token;
    }
    const activities = await getUserActivitiesAfter(strava_id, token, mTimestamp);
    return activities;
}

export function mapboxProvider(x, y, z, dpr) {
    return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}?access_token=${REACT_APP_MAPBOX_ACCESS_TOKEN}`;
}

export function mapboxProviderDark(x, y, z, dpr) {
    return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}?access_token=${REACT_APP_MAPBOX_ACCESS_TOKEN}`;
}

export function centerZoomFromLocations(locations, width, height) {
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

export const getRankedActivities = async (stravaId, actType, criteria, limit = 10) => {
    const response = await fetch(`${REACT_APP_HOST_URL}/activities/ranked/${stravaId}/${actType}/${criteria}?limit=${limit}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const activities = await response.json();
    return activities;
}

export function getGeoJsonFromCountry(country){
    return country === "United States" ?
        geoJson.forCountry("USA") : geoJson.forCountry(country)
}

let worldLookup = null;
export function getGeoJsonContainingLatLng(lat, lng) {
    if (worldLookup === null) {
        const map = getMap();
        worldLookup = new GeoJsonPolygonLookup(map);
    }

    const countries = worldLookup.getContainers({type: 'Point', coordinates: [lng, lat]});
    const feats = countries.features;
    return {
        type: 'FeatureCollection',
        features: feats};
}

export function getCodes(lat, lng) {
    if (worldLookup === null) {
        const map = getMap();
        worldLookup = new GeoJsonPolygonLookup(map);
    }

    const countries = worldLookup.getContainers({type: 'Point', coordinates: [lng, lat]});

    if (countries.features.length > 0) {
        return [...new Set(countries.features.map(f => f.properties.A3))];
    }
    return [];
}



