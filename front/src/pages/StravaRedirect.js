import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import {
  setUserProfile,
  setUserActivities,
  setUsersummary,
  setUserId,
  setUserToken,
} from "../actions";
import Loading from "../components/Loading";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  cleanUpAuthToken,
  testAuthGetter,
  getUserData,
  convertToMiles,
  postUserToken,
  getUserActivities,
  postUserActivities,
  setStravaId,
  getUserProfile,
  postUserProfile, getAllUserActivities,
} from "../utils/functions";

const StravaRedirect = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticate = async () => {
      try {
        // If not redirected to Strava, return to home
        if (_.isEmpty(location)) {
          return navigate("/");
        }
        // Save the Auth Token to the Store (it's located under 'search' for some reason)
        const stravaAuthToken = cleanUpAuthToken(location.search);

        // Post Request to Strava (with AuthToken) which returns Refresh Token and and Access Token
        const responseTokens = await testAuthGetter(stravaAuthToken);
        console.log("get refresh token", responseTokens);

        const responseRegistration = await postUserToken(responseTokens);
        console.log("token to db", responseRegistration);

        props.setUserProfile(responseTokens.athlete);
        const accessToken = responseTokens.access_token;
        const userID = responseTokens.athlete.id;
        props.setUserId(userID);
        props.setUserToken(responseTokens.access_token);
        //adding strava_id to cache
        setStravaId(responseTokens.athlete.id);

        // Axios request to get users info
        const userStats = await getUserData(userID, accessToken);
        const userProfile = await getUserProfile(userID, accessToken);

        // Axios request to get users activities
        const userActivities = await getAllUserActivities(userID, accessToken);

        //posting the user's activities
        const resp = await postUserActivities(userActivities);
        const respProf = await postUserProfile(userProfile);

        console.log("all user activities", userActivities);
        console.log("activity added response", resp);
        console.log("profile added response", respProf);

        props.setUsersummary(userActivities);

        props.setUserActivities({
          runTotal: {
            kms: (userStats.data.all_run_totals.distance / 1000).toFixed(2),
            miles: convertToMiles(
              userStats.data.all_run_totals.distance,
            ).toFixed(2),
            count: userStats.data.all_run_totals.count,
          },
          rideTotal: {
            kms: (userStats.data.all_ride_totals.distance / 1000).toFixed(2),
            miles: convertToMiles(
              userStats.data.all_ride_totals.distance,
            ).toFixed(2),
            count: userStats.data.all_ride_totals.count,
          },
          swimTotal: {
            kms: (userStats.data.all_swim_totals.distance / 1000).toFixed(2),
            miles: convertToMiles(
              userStats.data.all_swim_totals.distance,
            ).toFixed(2),
            count: userStats.data.all_swim_totals.count,
          },
        });

        // Once complete, go to display page
        //navigate('/yourdistance');
        navigate("/summary");
      } catch (error) {
        console.log(props);
        console.log(error.stack);
        //If error, go back home
        //navigate('/about');
      }
    };
    authenticate();
  }, []);

  return (
    <div>
      <Loading text={"Connecting with Strava."} />
    </div>
  );
};

const mapStateToProps = (state) => {
  return { authTokenURL: state.authTokenURL };
};

export default connect(mapStateToProps, {
  setUserActivities,
  setUserProfile,
  setUsersummary,
  setUserId,
  setUserToken,
})(StravaRedirect);
