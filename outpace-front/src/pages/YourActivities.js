import {React} from "react";
import {useSelector} from "react-redux";
import Activity from "../components/Activity";
import {getLastActivityTimestamp, getUserActivitiesAfter, postUserActivities, reloadToken} from "../utils/functions";
import {useNavigate} from "react-router-dom";

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

const YourActivities = () => {
    const activities = useSelector((state) => state.userClimbs);
    const strava_id = useSelector((state) => state.userId);
    const navigate = useNavigate();
    const handleButtonClick = () => {
        fetchNewActivities(strava_id).then(async (activities) => {
            await postUserActivities(activities);
            navigate("/redirectDB");
        });
    };

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
        </div>
    );
};

export default YourActivities;
