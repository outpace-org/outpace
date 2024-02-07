import {React} from "react";
import {connect, useSelector} from "react-redux";
import Activity from "../components/Activity";
import {useNavigate} from "react-router-dom";
import {setUserTrips} from "../actions";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBicycle, faRunning} from '@fortawesome/free-solid-svg-icons';
import {
    fetchNewActivities,
    getUserActivitiesFromDB,
    getUserDashboardFromDB,
    postUserActivities
} from "../utils/functions";


let navigate;

const goDashboard = async (strava_id) => {
    const pendingDash = await getUserDashboardFromDB(strava_id);
    if (pendingDash)
        console.log("pending")
    else
        navigate("/redirectDB");
};


const Summary = (props) => {
    const activities = useSelector((state) => state.usersummary);
    const strava_id = useSelector((state) => state.userId);
    navigate = useNavigate();
    let totalBike = 0;
    let totalRun = 0;

    activities?.forEach(activity => {
        try {
            totalBike += activity.type === "Ride";
            totalRun += activity.type === "Run";
        } catch (error) {
            console.error(error);
        }
    });


    return (
        <div style={{paddingTop: "5em"}}>
            <h3 style={{textAlign: 'center'}}>Activities detected</h3>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100vh', // This makes the div take up the full viewport height
                paddingBottom: "20em"
            }}>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{marginRight: '4em', textAlign: 'center'}}>
                        <FontAwesomeIcon icon={faBicycle} size="2x"/>
                        <p>{totalBike}</p>
                    </div>
                    <div style={{height: '10em', borderLeft: '1px solid black', marginBottom: '2em'}}></div>
                    <div style={{marginLeft: '4em', textAlign: 'center'}}>
                        <FontAwesomeIcon icon={faRunning} size="2x"/>
                        <p>{totalRun}</p>
                    </div>
                </div>
                <div style={{textAlign: "center"}}>
                    <button onClick={() => goDashboard(strava_id)}>
                        Go to my dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = {
    setUserTrips
};
export default connect(null, mapDispatchToProps)(Summary);

