import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const About = () => {
  return (
    <div className="black-body d-flex justify-content-center align-items-center content-body text-center content-body">
      <div className="container flex-fill mt-5 fixed-container">
        <h5>View this project and more.</h5>
        <FontAwesomeIcon icon={faGithub} style={{ marginRight: ".5em" }} />
        <a href="https://github.com/toma-demagn">@toma.demagn</a>
      </div>
    </div>
  );
};

export default About;
