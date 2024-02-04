import { combineReducers } from "redux";

const setUserProfileReducer = (user = null, action) => {
    switch (action.type) {
        case "SET_USER_PROFILE":
            return action.payload;
        default:
            return user;
    }
};


const setUserTripsReducer = (userTrips = null, action) => {
    switch (action.type) {
        case "SET_USER_TRIPS":
            return action.payload;
        default:
            return userTrips;
    }
};

const setUserActivitiesReducer = (userActivities = null, action) => {
    switch (action.type) {
        case "SET_USER_ACTIVITIES":
            return action.payload;
        default:
            return userActivities;
    }
};



const changeUnitsReducer = (metric = true, action) => {
    switch (action.type) {
        case "CHANGE_UNITS":
            return !metric;
        default:
            return metric;
    }
};

const setTotalDistanceReducer = (totalDistance = 0, action) => {
    switch (action.type) {
        case "SET_TOTAL_DISTANCE":
            return action.payload;
        default:
            return totalDistance;
    }
};

const setSportsReducer = (sports = [], action) => {
    switch (action.type) {
        case "ADD_SPORT":
            return [...sports, action.payload];
        case "REMOVE_SPORT":
            return sports.filter((unit) => unit !== action.payload);
        default:
            return sports;
    }
};

const setUserClimbsReducer = (userClimbs = null, action) => {
    switch (action.type) {
        case "SET_USER_CLIMBS":
            return action.payload;
        default:
            return userClimbs;
    }
};

const setUserIdReducer = (userId= null, action) => {
    switch (action.type) {
        case "SET_USER_ID":
            return action.payload;
        default:
            return userId;
    }
}

const setUserTokenReducer = (token= null, action) => {
    switch (action.type) {
        case "SET_USER_TOKEN":
            return action.payload;
        default:
            return token;
    }
}


export default combineReducers({
    userProfile: setUserProfileReducer,
    userActivities: setUserActivitiesReducer,
    userClimbs: setUserClimbsReducer,
    metric: changeUnitsReducer,
    sports: setSportsReducer,
    totalDistance: setTotalDistanceReducer,
    userId: setUserIdReducer,
    userToken: setUserTokenReducer,
    userTrips: setUserTripsReducer
});