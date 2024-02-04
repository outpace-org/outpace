import React from "react";
import Home from "../pages/Home";
import StravaRedirect from "../pages/StravaRedirect";
import Navbar from "../components/Navbar";
import About from "../pages/About"
import NotFound from "../pages/NotFound";
import YourActivities from "../pages/YourActivities";
import DBRedirect from "../pages/DBRedirect";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import YourTrips from "../pages/YourTrips";

class AppRouter extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Navbar />
                <div className="main">
                    <Routes>
                        <Route path="/" element={<Home/>} exact={true} />
                        <Route path="/redirect" element={<StravaRedirect/>} />
                        <Route path="/redirectDB" element={<DBRedirect/>} />
                        <Route path="/redirect/exchange_token" element={<StravaRedirect/>} />
                        <Route path="/yourclimbs" element={<YourActivities/>} />
                        <Route path="/yourtrips" element={<YourTrips/>} />
                        <Route path="/about" element={<About/>} />
                    </Routes>
                </div>
            </BrowserRouter>
        );
    }
}
export default AppRouter;
