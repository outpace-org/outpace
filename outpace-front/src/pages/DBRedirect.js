import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { setUserProfile, setUserActivities, setUserClimbs } from '../actions';
import Loading from '../components/Loading';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {

    getStravaId,
    getUserActivitiesFromDB
} from '../utils/functions';

const { REACT_APP_CLIENT_ID } = process.env;

 const URL = 'http://localhost:3000/redirect';

const scope = 'read,activity:read_all';

const DBRedirect = (props) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                // If not redirected to Strava, return to home
                if (_.isEmpty(location)) {
                    return navigate('/');
                }
                const userID = getStravaId;
                //fecthing activities from our
                const userClimbs = await getUserActivitiesFromDB(userID);

                props.setUserClimbs(userClimbs);
                console.log(userClimbs)
                if (userClimbs.length === 0) {
                    window.location = `http://www.strava.com/oauth/authorize?client_id=${REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${URL}/exchange_token&approval_prompt=force&scope=${scope}`;
                } else {
                    // Once complete, go to display page
                    navigate('/yourclimbs');
                }
                
            } catch (error) {
                console.log(props)
                console.log(error.stack)
                //If error, go back home
                //navigate('/');
            }
        };
        fetch();
    }, []);

    return (
        <div>
            <Loading text={'Talking to Database.'} />
        </div>
    );
}


const mapStateToProps = (state) => {
    return { authTokenURL: state.authTokenURL };
};

export default connect(mapStateToProps, {
    setUserClimbs
})(DBRedirect);
