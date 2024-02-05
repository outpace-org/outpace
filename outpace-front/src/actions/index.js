export const setUserActivities = (data) => {
    return {
        type: "SET_USER_ACTIVITIES",
        payload: data,
    };
};

export const setUserTrips = (data) => {
    return {
        type: "SET_USER_TRIPS",
        payload: data,
    };
};

export const setDistanceRides = (data) => {
    return {
        type: "SET_DISTANCE_RIDES",
        payload: data,
    };
};

export const setUserProfile = (data) => {
    return {
        type: "SET_USER_PROFILE",
        payload: data,
    };
};

export const setUsersummary = (data) => {
    return {
        type: "SET_USER_SUMMARY",
        payload: data,
    };
};

export const setUserId = (data) => {
    return {
        type: "SET_USER_ID",
        payload: data,
    };
};

export const setUserToken = (data) => {
    return {
        type: "SET_USER_TOKEN",
        payload: data,
    };
};

export const setTotalDistance = (data) => {
    return {
        type: "SET_TOTAL_DISTANCE",
        payload: data,
    };
};

export const changeUnits = () => {
    return {
        type: "CHANGE_UNITS",
    };
};

export const addSport = (sport) => {
    return {
        type: "ADD_SPORT",
        payload: sport,
    };
};

export const removeSport = (sport) => {
    return {
        type: "REMOVE_SPORT",
        payload: sport,
    };
};
