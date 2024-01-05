import React from "react";
import { Link } from "react-router-dom";
import info from '../assets/info.png';


const Navbar = () => {
    return (
        <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link className="navbar-brand nav-title purple-text" to="/">
                    Outpace
                </Link>
                <div className="navbar-nav ml-auto">
                    <Link
                        className="navbar-brand nav-title purple-text"
                        to="/about"
                    >
                        <img src={info} alt="info" style={{width: "1.3em"}}/>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;