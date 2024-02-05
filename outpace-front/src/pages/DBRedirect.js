import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import {setUsersummary, setUserId, setUserTrips, setDistanceRides, setCountryVals} from '../actions';
import Loading from '../components/Loading';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
    fetchCountryValsFromDB,
    getRankedActivities,

    getStravaId,
    getUserActivitiesElevationFromDB, getUserTripsFromDB
} from '../utils/functions';

const { REACT_APP_CLIENT_ID } = process.env;

 const URL = 'http://localhost:3000/redirect';

const scope = 'read,activity:read_all';

const DBRedirect = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    let userTrips;
    let rankedRides;
    let countryVals;

    useEffect(() => {
        const fetch = async () => {
            try {
                // If not redirected to Strava, return to home
                if (_.isEmpty(location)) {
                    return navigate('/');
                }
                const userID = getStravaId;
                props.setUserId(userID);
                userTrips = await getUserTripsFromDB(userID);
                rankedRides = await getRankedActivities(userID, "Ride", "distance");
                countryVals = await fetchCountryValsFromDB(userID);
                console.log("rides", rankedRides);

                
            } catch (error) {
                console.log(props)
                console.log(error.stack)
                //If error, go back home
                navigate('/redirect');
            }
        };
        fetch().then(r => {
            if (rankedRides === undefined || rankedRides.length === 0) {
                window.location = `http://www.strava.com/oauth/authorize?client_id=${REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${URL}/exchange_token&approval_prompt=force&scope=${scope}`;
            } else {
                props.setUserTrips(userTrips);
                props.setDistanceRides(rankedRides);
                props.setCountryVals(countryVals);
                navigate('/dashboard');
            }
        });
    }, []);

    return (
        <div>
            <Loading text={'Talking to Database.'} />
        </div>
    );
}



export default connect(null, {
    setUserId,
    setUserTrips,
    setDistanceRides,
    setCountryVals
})(DBRedirect);
