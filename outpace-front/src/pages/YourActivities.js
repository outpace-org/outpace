import {React} from "react";
import {connect, useSelector} from "react-redux";
import Activity from "../components/Activity";
import {
    getLastActivityTimestamp,
    getUserActivitiesAfter,
    getUserTripsFromDB,
    postUserActivities,
    reloadToken
} from "../utils/functions";
import {useNavigate} from "react-router-dom";
import {setUserTrips} from "../actions";

async function fetchNewActivities(strava_id) {
    const data = await getLastActivityTimestamp(strava_id);
    let mTimestamp = data.last_date;
    const expired = true;
    let token = data.token;
    if (expired) {
        const newTokenData = await reloadToken(strava_id);
        console.log("getting new token for ", strava_id);
        token = newTokenData.access_token;
    }
    const activities = await getUserActivitiesAfter(strava_id, token, mTimestamp);
    return activities;
}

const YourActivities = (props) => {
    const activities = useSelector((state) => state.userClimbs);
    const strava_id = useSelector((state) => state.userId);
    const navigate = useNavigate();
    const handleButtonClick = () => {
        fetchNewActivities(strava_id).then(async (activities) => {
            await postUserActivities(activities);
            navigate("/redirectDB");
        });
    };

    function handleButtonClick2() {
        getUserTripsFromDB(strava_id).then(async (trips) => {
            console.log("Your trips were", trips);
            props.setUserTrips(trips);
            navigate("/yourTrips")
        })
    }

    return (
        <div style={{padding: "10px"}}>
            <h1>Activities</h1>
            {activities?.map((activity) => (
                <Activity key={activity.strava_id} activity={activity}/>
            ))}
            <div style={{textAlign: "center"}}>
                <button onClick={handleButtonClick}>
                    Reload my activities from Strava
                </button>
            </div>
            <div style={{textAlign: "center"}}>
                <button onClick={handleButtonClick2}>
                    Go to my trips
                </button>
            </div>
        </div>
    );
};

const mapDispatchToProps = {
    setUserTrips
};

export default connect(null, mapDispatchToProps)(YourActivities);

