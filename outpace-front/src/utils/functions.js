import axios from "axios";
import Cookies from "js-cookie";
import {
  featureCollection as turfFeatureCollection,
  point as turfPoint,
} from "@turf/helpers";
import turfBbox from "@turf/bbox";
import geoViewport from "@mapbox/geo-viewport";
import getMap from "@geo-maps/countries-maritime-50m";
import GeoJsonPolygonLookup from "geojson-geometries-lookup";
import _ from "lodash";
import * as turf from "@turf/turf";
const geolib = require("geolib");

export const {
  REACT_APP_CLIENT_ID,
  REACT_APP_CLIENT_SECRET,
  REACT_APP_HOST_URL,
  REACT_APP_WEB_URL,
  REACT_APP_MAPBOX_ACCESS_TOKEN,
  REACT_APP_ION_DEFAULT_ACCESS_TOKEN,
} = process.env;

export function setStravaId(id) {
  Cookies.set("strava_id", id, { expires: 7 });
}

export const getStravaId = Cookies.get("strava_id");
export const getParamValues = (url) => {
  const afterQM = url.split("?")[1];
  return afterQM.split("&").reduce((prev, curr) => {
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
      `https://www.strava.com/api/v3/oauth/token?client_id=${REACT_APP_CLIENT_ID}&client_secret=${REACT_APP_CLIENT_SECRET}&code=${authTok}&grant_type=authorization_code`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const postUserToken = async (toks) => {
  try {
    const response = await fetch(`${REACT_APP_HOST_URL}/register_token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toks),
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
// Function to get refresh token from the database
async function getRefreshTokenFromDB(stravaId) {
  try {
    const response = await axios.get(
      `${REACT_APP_HOST_URL}/refresh_token_strava/${stravaId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error during API call", error);
  }
}
// Function to post new token to the database
async function postNewToken(stravaId, newToken, newRefreshToken, expiresAt) {
  try {
    const response = await axios.put(
      `${REACT_APP_HOST_URL}/refreshtoken/${stravaId}/AthleteSLAT/`,
      {
        token: newToken,
        read_activity: true,
        expires_at: expiresAt,
        new_refresh_token: newRefreshToken,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error during API call", error);
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
    const response = await axios.post(
      "https://www.strava.com/api/v3/oauth/token",
      {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "refresh_token",
        refresh_token: refresh_token.refresh_token,
      },
    );
    console.log("response", response);

    // Call the function postNewToken with the new token and new refresh_token
    await postNewToken(
      stravaId,
      response.data.access_token,
      response.data.refresh_token,
      response.data.expires_at,
    );
    return response.data;
  } catch (error) {
    console.error("Error during API call", error);
  }
};
export const postUserActivities = async (acts) => {
  try {
    const response = await fetch(`${REACT_APP_HOST_URL}/activities/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(acts.data),
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const postUserProfile = async (prof) => {
  try {
    const response = await fetch(`${REACT_APP_HOST_URL}/profile/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prof.data),
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const pinActivity = async (id) => {
  const url = `${process.env.REACT_APP_HOST_URL}/activities/pin/${id}`;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};
export const unpinActivities = async (strava_id) => {
  const url = `${process.env.REACT_APP_HOST_URL}/activities/unpin/${strava_id}`;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};
export const getLastActivityTimestamp = async (userID) => {
  try {
    const str = `${REACT_APP_HOST_URL}/activities/last_date/${userID}`;
    console.log("Trying to fetch", str);
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

// export const fetchStravaAfterDate
export const getUserActivitiesElevationFromDB = async (userID) => {
  try {
    const str = `${REACT_APP_HOST_URL}/activities/elevation/${userID}/30000`;
    console.log("Trying to fetch", str);
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
      const excludeParams = exclude.map((id) => `exclude=${id}`).join("&");
      str += `?${excludeParams}`;
    }
    console.log("Trying to fetch", str);
    const response = await fetch(str);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};
export const getUserDashboardFromDB = async (userID) => {
  try {
    let str = `${REACT_APP_HOST_URL}/dashboard/${userID}`;
    console.log("Trying to fetch", str);
    const response = await fetch(str);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};
export const getDashboardFromToken = async (token) => {
  try {
    let str = `${REACT_APP_HOST_URL}/dashboard/share/${token}`;
    console.log("Trying to fetch", str);
    const response = await fetch(str);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const theJson = await response.json();
    console.log("And the response is", theJson);
    return theJson;
  } catch (error) {
    console.log(error);
  }
};
export async function putDashboardToken(stravaId) {
  try {
    const response = await axios.put(
      `${REACT_APP_HOST_URL}/dashboard/share/${stravaId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error during API call", error);
  }
}
export const getUserTripsFromDB = async (stravaId) => {
  try {
    const str = `${REACT_APP_HOST_URL}/trips/${stravaId}`;
    console.log("Trying to fetch", str);
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
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const getUserProfile = async (userID, accessToken) => {
  try {
    const response = await axios.get(
      `https://www.strava.com/api/v3/athletes/${userID}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
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
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const getUserActivitiesAfter = async (userID, accessToken, after) => {
  try {
    let str = `https://www.strava.com/api/v3/athletes/${userID}/activities?after=${after}&per_page=200`;
    console.log(str);
    const response = await axios.get(str, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

async function putActivityElevations(activityId, elevations) {
  try {
    const response = await axios.put(
      `${REACT_APP_HOST_URL}/activities/${activityId}/elevations/`,
      elevations,
    );
    return response.data;
  } catch (error) {
    console.error("Error during API call", error);
  }
}

export const addElevationsToActivity = async (activityId, geoJson3d) => {
  console.log("la maaaaaaap", geoJson3d);
  let geoCoords = geoJson3d.features.map(
    (feat) => feat.geometry.coordinates[0],
  );
  geoCoords.push(
    geoJson3d.features[geoJson3d.features.length - 1].geometry.coordinates[1],
  );
  const elevations = geoCoords.map((coord) => coord[2]);
  console.log("the elevations", elevations);
  const resp = await putActivityElevations(activityId, elevations);
  return resp;
};

export const convertToMiles = (meters) => {
  return (meters * 0.621371) / 1000;
};
export async function fetchNewActivities(strava_id) {
  const data = await getLastActivityTimestamp(strava_id);
  let mTimestamp = data.last_date;
  const expired = data.expires_in < 0;
  let token = data.token;
  if (expired) {
    const newTokenData = await reloadToken(strava_id);
    console.log("getting new token for ", strava_id);
    token = newTokenData.access_token;
  } else {
    console.log("Not expired");
  }
  const activities = await getUserActivitiesAfter(strava_id, token, mTimestamp);
  return activities;
}

// export function getProvider(dark) {
//   if (!dark)
//     return process.env.NODE_ENV !== "development" ? mapboxProvider : undefined;
//   else
//     return process.env.NODE_ENV !== "development"
//       ? mapboxProviderDark
//       : undefined;
// }

export function getProvider(dark) {
  if (!dark)
    return mapboxProvider;
  else
    return mapboxProviderDark;
}


export function mapboxProvider(x, y, z, dpr) {
  return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/${z}/${x}/${y}${dpr >= 2 ? "@2x" : ""}?access_token=${REACT_APP_MAPBOX_ACCESS_TOKEN}`;
}

export function mapboxProviderDark(x, y, z, dpr) {
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/${z}/${x}/${y}${dpr >= 2 ? "@2x" : ""}?access_token=${REACT_APP_MAPBOX_ACCESS_TOKEN}`;
}

export function centerZoomFromLocations(locations, width, height) {
  const points = locations.map(([lat, lng]) => turfPoint([lat, lng]));
  const features = turfFeatureCollection(points);
  let bounds = turfBbox(features);
  bounds[1] = Math.min(60, bounds[1]);
  bounds[3] = Math.min(60, bounds[3]);
  const { center, zoom } = geoViewport.viewport(bounds, [width, height]);
  console.log("bounds", bounds, "center", center, "zoom", zoom);
  return {
    center,
    zoom: Math.min(zoom, 13),
  };
}
export const getRankedActivities = async (
  stravaId,
  actType,
  criteria,
  limit = 10,
) => {
  const response = await fetch(
    `${REACT_APP_HOST_URL}/activities/ranked/${stravaId}/${actType}/${criteria}?limit=${limit}`,
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const activities = await response.json();
  return activities;
};
export const getPinnedActivities = async (stravaId) => {
  const response = await fetch(
    `${REACT_APP_HOST_URL}/activities/pinned/${stravaId}`,
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const activities = await response.json();
  return activities;
};
export function includes(arr, val) {
  let b = false;
  arr.forEach((v) => {
    if (_.isEqual(val, v)) {
      b = true;
    }
  });
  return b;
}

export function index(arr, val) {
  let b = false;
  let c = 0;
  arr.forEach((v) => {
    if (_.isEqual(val, v)) {
      b = true;
    }
    if (!b) {
      c++;
    }
  });
  if (b) return c;
  else return -1;
}

let worldLookup = null;
export function getGeoJsonContainingLatLng(lat, lng) {
  if (worldLookup === null) {
    const map = getMap();
    worldLookup = new GeoJsonPolygonLookup(map);
  }
  const countries = worldLookup.getContainers({
    type: "Point",
    coordinates: [lng, lat],
  });
  let feats = countries.features;
  let codes = [...new Set(countries.features.map((f) => f.properties.A3))];
  return {
    type: "FeatureCollection",
    features: feats,
  };
}
export function getCodes(lat, lng) {
  if (worldLookup === null) {
    const map = getMap();
    worldLookup = new GeoJsonPolygonLookup(map);
  }

  const countries = worldLookup.getContainers({
    type: "Point",
    coordinates: [lng, lat],
  });
  if (countries.features.length > 0) {
    return [...new Set(countries.features.map((f) => f.properties.A3))];
  }
  return [];
}
export const getDashboardURL = (token) => {
  return `${REACT_APP_WEB_URL}/redirectDashboard?token=${token}`;
};
export const formatNumber = (num) => {
  return num.toFixed(2);
};
export const convertToKm = (meters) => {
  return meters / 1000;
};
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  seconds = seconds % 60;
  return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
};
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
export const nameTrip = (trip) => {
  return `Trip from ${trip.start} to ${trip.end}`;
};
export const shortenText = (str, nb) => {
  return str.length <= nb ? str : `${str.substring(0, nb)}...`;
};
export function isPointInGeoJson(lat, lng, geoJson) {
  const point = turf.point([lng, lat]);

  let isInside = false;
  turf.geomEach(geoJson, (geometry) => {
    if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
      if (turf.booleanPointInPolygon(point, geometry)) {
        isInside = true;
        return false; // This will stop the iteration
      }
    }
  });

  return isInside;
}
function flattenCoordinates(coords) {
  if (!Array.isArray(coords)) {
    return [coords];
  }
  // If the first element is a number, assume this is a [lat, lng] pair
  if (typeof coords[0] === "number") {
    return [coords];
  }
  return coords.reduce((flattened, c) => {
    return flattened.concat(flattenCoordinates(c));
  }, []);
}
export function concatCoords(geo) {
  let coords = [];
  geo.features.forEach((feature) => {
    coords = [...coords, ...flattenCoordinates(feature.geometry.coordinates)];
  });

  return coords;
}
export function getExtremeLocations(coords) {
  const bounds = geolib.getBounds(coords);
  return [
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat],
    [bounds.maxLng, bounds.minLat],
  ];
}
