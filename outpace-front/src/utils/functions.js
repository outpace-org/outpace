import axios from "axios";
import Cookies from 'js-cookie';


const { REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET, REACT_APP_HOST_URL } = process.env;

export function setStravaId(id){
    Cookies.set('strava_id', id, { expires: 7 });
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

export const getUserActivitiesFromDB = async (userID) => {
    try {
        console.log("Trying to fetch", `${REACT_APP_HOST_URL}/activities/elevation/${userID}/8000`)
        const response = await fetch(`${REACT_APP_HOST_URL}/activities/elevation/${userID}/8000`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getUserActivitiesFromDB2 = async (userID, accessToken) => {
    try {
        const response = await fetch(`${REACT_APP_HOST_URL}/activities/${userID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
};

/*
export const postUserToken = async (toks) => {
    try {
        const response = await axios.post('http://localhost:8000/register_token/', toks, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const postUserActivities = async (acts) => {
    try {
        const response = await axios.post('http://localhost:8000/activities/', acts, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const getUserActivitiesFromDB = async (userID, accessToken) => {
    try {
        const response = await axios.get(
            `http://localhost:8000/activities/${userID}`
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
};*/


export const getUserData = async (userID, accessToken) => {
    try {
        const response = await axios.get(
            `https://www.strava.com/api/v3/athletes/${userID}/stats`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
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
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const convertToMiles = (meters) => {
    return (meters * 0.621371) / 1000;
};

