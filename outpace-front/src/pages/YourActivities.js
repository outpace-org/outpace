import { React } from "react";
import { useSelector } from "react-redux";
import Activity from "../components/Activity";

const YourActivities = () => {
  /*const userProfile = useSelector((state) => state.userProfile);
    if (!userProfile) {
        window.location = '/';
    }*/

  //const climbs = useSelector((state) => state.userClimbs);
  const activities = useSelector((state) => state.userClimbs);
  console.log(activities, typeof(activities));
  console.log("The activities", activities)
  return (
    <div style={{ padding: "10px" }}>
      <h1>Activities</h1>
      {activities?.map((activity) => (
        <Activity key={activity.strava_id} activity={activity} />
      ))}
    </div>
  );
};

export default YourActivities;
