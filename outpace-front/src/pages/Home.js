import React from 'react';
import loginButton from '../assets/login.png';
import manLogo from '../assets/man.png';
import roadLogo from '../assets/road.png';

import {
    getStravaId,
    getUserActivitiesFromDB
} from '../utils/functions';
import { useNavigate } from 'react-router-dom';


const { REACT_APP_CLIENT_ID } = process.env;

 const URL = 'http://localhost:3000/redirect';

const scope = 'read,activity:read_all';

const Home = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        var strava_id = getStravaId;
        var goToAuth = false;
        strava_id = undefined;
        if (strava_id === undefined) {
            console.log("strava_id is not set.");
            goToAuth = true;
        } else {
            console.log("strava_id is set with the value: " + strava_id);
        }
        if (goToAuth){
            window.location = `http://www.strava.com/oauth/authorize?client_id=${REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${URL}/exchange_token&approval_prompt=force&scope=${scope}`;
        } else {
            navigate('/redirectDB');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center text-center content-body">
    <div className="mt-5">
        <div class="row">
            <div class="column">
                <img src={manLogo} style={{width: "10em"}}></img>
            </div>
            <div class="column">
                <img src={roadLogo} style={{width: "10em"}}></img> 
            </div>
        </div>
        <h2 className="bold-poppins-small mt-3 mb-3">
            Create your athlete CV !
        </h2>
            
        <img
            src={loginButton}
            onClick={handleLogin}
            alt="login"
            className="login-button"
            style={{width: "15e,"}}
        ></img>
    </div>
</div>

    );
};


export default Home;
