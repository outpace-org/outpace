export const setUserActivities = (data) => {
  return {
    type: "SET_USER_ACTIVITIES",
    payload: data,
  };
};
export const setTripActivities = (data) => {
  return {
    type: "SET_TRIP_ACTIVITIES",
    payload: data,
  };
};

export const setUserTrips = (data) => {
  return {
    type: "SET_USER_TRIPS",
    payload: data,
  };
};

export const setZoomeds = (data) => {
  return {
    type: "SET_ZOOMEDS",
    payload: data,
  };
};

export const setTripName = (data) => {
  return {
    type: "SET_TRIP_NAME",
    payload: data,
  };
};

export const setDistanceRides = (data) => {
  return {
    type: "SET_DISTANCE_RIDES",
    payload: data,
  };
};

export const setPinnedActivities = (data) => {
  return {
    type: "SET_PINNED_ACTIVITIES",
    payload: data,
  };
};

export const setAltitudes = (data) => {
  return {
    type: "SET_ALTITUDES",
    payload: data,
  };
};

export const setCountryActivities = (data) => {
  return {
    type: "SET_COUNTRY_ACTIVITIES",
    payload: data,
  };
};


export const setUserProfile = (data) => {
  return {
    type: "SET_USER_PROFILE",
    payload: data,
  };
};

export const setUserName = (data) => {
  return {
    type: "SET_USER_NAME",
    payload: data,
  };
};

export const setExternal = (data) => {
  return {
    type: "SET_EXTERNAL",
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
