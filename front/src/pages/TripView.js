import { React } from "react";
import { connect, useSelector } from "react-redux";
import Activity from "../components/Activity";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const TripView = (props) => {
  const activities = useSelector((state) => state.tripActivities);
  const name = useSelector((state) => state.tripName);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div style={{ padding: "10px", paddingTop: "5em" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={handleBackClick}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h1
          style={{
            textAlign: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {name}
        </h1>
      </div>
      {activities?.map((activity, index) => (
        <div key={index}>
          <Activity activity={activity} index={index} />
        </div>
      ))}
    </div>
  );
};

const mapDispatchToProps = {};

export default connect(null, mapDispatchToProps)(TripView);
