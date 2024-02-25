import React from "react";
import { connect, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserTrips } from "../actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBicycle, faRunning } from "@fortawesome/free-solid-svg-icons";
import { getUserDashboardFromDB } from "../utils/functions";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let navigate;

const goDashboard = async (strava_id) => {
  const pendingDash = await getUserDashboardFromDB(strava_id);
  if (pendingDash.ready) {
    navigate("/redirectDB");
  } else {
    console.log("pending");
    toast.info("Dashboard not yet ready", {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });
  }
};

const Summary = (props) => {
  const activities = useSelector((state) => state.usersummary);
  const strava_id = useSelector((state) => state.userId);
  navigate = useNavigate();
  let totalBike = 0;
  let totalRun = 0;

  activities?.forEach((activity) => {
    try {
      totalBike += activity.type === "Ride";
      totalRun += activity.type === "Run";
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <div style={{ paddingTop: "5em" }}>
      <h3 style={{ textAlign: "center" }}>Activities detected</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100vh", // This makes the div take up the full viewport height
          paddingBottom: "20em",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ marginRight: "4em", textAlign: "center" }}>
            <FontAwesomeIcon icon={faBicycle} size="2x" />
            <p>{totalBike}</p>
          </div>
          <div
            style={{
              height: "10em",
              borderLeft: "1px solid black",
              marginBottom: "2em",
            }}
          ></div>
          <div style={{ marginLeft: "4em", textAlign: "center" }}>
            <FontAwesomeIcon icon={faRunning} size="2x" />
            <p>{totalRun}</p>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={() => goDashboard(strava_id)}>
            Go to my dashboard
          </button>
        </div>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  setUserTrips,
};
export default connect(null, mapDispatchToProps)(Summary);
