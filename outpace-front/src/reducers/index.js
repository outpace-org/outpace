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

const setUserSummaryReducer = (usersummary = null, action) => {
    switch (action.type) {
        case "SET_USER_SUMMARY":
            return action.payload;
        default:
            return usersummary;
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

const setDistanceRidesReducer = (distanceRides= null, action) => {
    switch (action.type) {
        case "SET_DISTANCE_RIDES":
            return action.payload;
        default:
            return distanceRides;
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
    usersummary: setUserSummaryReducer,
    metric: changeUnitsReducer,
    sports: setSportsReducer,
    totalDistance: setTotalDistanceReducer,
    userId: setUserIdReducer,
    userToken: setUserTokenReducer,
    userTrips: setUserTripsReducer,
    distanceRides: setDistanceRidesReducer
});