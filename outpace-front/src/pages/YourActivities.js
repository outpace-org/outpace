import {React} from "react";
import {useSelector} from "react-redux";
import Activity from "../components/Activity";
import {getLastActivityTimestamp, getUserActivitiesAfter} from "../utils/functions";

async function fetchNewActivities(strava_id) {
    const data = await getLastActivityTimestamp(strava_id);
    let mTimestamp = data.last_date;
    let token = data.token;
    const activities = await getUserActivitiesAfter(strava_id, token, mTimestamp);
    console.log(activities)
}

const YourActivities = () => {
    const activities = useSelector((state) => state.userClimbs);
    const strava_id = useSelector((state) => state.userId);
    const handleButtonClick = () => {
        fetchNewActivities(strava_id);
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
