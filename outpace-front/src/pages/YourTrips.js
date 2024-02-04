import Trip from '../components/Trip';
import {useSelector} from "react-redux";

const YourTrips = () => {
    const trips = useSelector((state) => state.userTrips);

    console.log("Got the trips", trips)
    return (
        <div style={{padding: "10px"}}>
            <h1>Trips</h1>
            {trips?.map((trip, index) => (
                <div key={index}>
                    <h2>Trip #{index + 1}</h2>
                    <Trip trip={trip} />
                </div>
            ))}
        </div>
    );
};

export default YourTrips;