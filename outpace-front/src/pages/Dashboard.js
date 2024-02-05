import React, {useEffect, useRef, useState} from "react";
import {connect, useSelector} from "react-redux";
import Modal from 'react-modal';
import {
    fetchNewActivities,
    postUserActivities,
    getUserActivitiesFromDB
} from "../utils/functions";
import {useNavigate} from "react-router-dom";
import {setUserActivities, setUserTrips} from "../actions";
import Trip from "../components/Trip";
import SmallActivity from "../components/SmallActivity";
import styled from 'styled-components';
import { faPlus, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


const Dashboard = (props) => {
    const trips = useSelector((state) => state.userTrips);
    const rankedDistanceRides = useSelector((state) => state.distanceRides)
    const strava_id = useSelector((state) => state.userId);
    const navigate = useNavigate();
    const scrollContainerRef = React.useRef(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        getUserActivitiesFromDB(strava_id, rankedDistanceRides.map(activity => activity.id)).then(setActivities);
    }, []);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleButtonClick = () => {
        fetchNewActivities(strava_id).then(async (activities) => {
            await postUserActivities(activities);
            navigate("/redirectDB");
        });
    };

    const handleTripClick = (index) => {
        props.setUserActivities(trips[index].activities);
        navigate("/trip_view")
    };

    const activityRefs = useRef([]);

    const scrollLeft = () => {
        if (activityRefs.current[0]) {
            const marginRight = parseFloat(window.getComputedStyle(activityRefs.current[0]).marginRight);
            const activityWidth = activityRefs.current[0].offsetWidth + marginRight;
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollLeft - activityWidth,
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (activityRefs.current[0]) {
            const marginRight = parseFloat(window.getComputedStyle(activityRefs.current[0]).marginRight);
            const activityWidth = activityRefs.current[0].offsetWidth + marginRight;
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollLeft + activityWidth,
                behavior: 'smooth'
            });
        }
    };

    const LeftArrowButton = styled.button`
        position: absolute;
        transform: translateY(130%) translateX(30%);
        background-color: rgba(211, 211, 211, 0.75);
        border: none;
        border-radius: 5px;
        width: 5em;
        height: 5em;

        &:hover {
            background-color: rgba(128, 128, 128, 0.75);
        }
    `;
    const RightArrowButton = styled.button`
        position: absolute;
        transform: translateY(130%) translateX(-30%);
        background-color: rgba(211, 211, 211, 0.75);
        border: none;
        border-radius: 5px;
        width: 5em;
        height: 5em;

        &:hover {
            background-color: rgba(128, 128, 128, 0.75);
        }
    `;

    return (
        <div style={{paddingTop: "5em", paddingBottom: "5em", overflowX: 'hidden'}}>
            <h1 style={{textAlign: 'center'}}>Your Big Trips</h1>
            {trips?.map((trip, index) => (
                <div key={index}
                     onClick={() => handleTripClick(index)}
                     style={{
                         backgroundColor: 'white',
                         transition: 'background-color 0.1s ease'
                     }}
                     onMouseOver={e => e.currentTarget.style.backgroundColor = 'whitesmoke'}
                     onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                >
                    {index === 0 && <hr style={{margin: '0'}}/>}
                    <Trip trip={trip} index={index}/>
                    <hr style={{margin: '0'}}/>

                </div>
            ))}
            <div style={{paddingTop: "5em", position: 'relative'}}>
                <h1 style={{textAlign: 'center'}}>Your rides ranked</h1>
                <button onClick={openModal} style={{marginLeft: '1em'}}>
                    Add activity <FontAwesomeIcon icon={faPlus}/>
                </button>
                <div className='scrollContainer' ref={scrollContainerRef}
                     style={{padding: "10px", display: 'flex', overflowX: 'auto', backgroundColor: 'whitesmoke'}}>
                    {rankedDistanceRides?.map((activity, index) => (
                        <div key={index} style={{flex: '0 0 auto', marginRight: '1em'}}
                             ref={el => activityRefs.current[index] = el}>
                            <SmallActivity activity={activity} crit="distance"/>
                        </div>
                    ))}
                    <LeftArrowButton onClick={scrollLeft} style={{left: 0}}><FontAwesomeIcon
                        icon={faArrowLeft}/></LeftArrowButton>
                    <RightArrowButton onClick={scrollRight} style={{right: 0}}><FontAwesomeIcon
                        icon={faArrowRight}/></RightArrowButton>


                </div>
                <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                    {activities.map((activity, index) => (
                        <div key={index}
                             style={{
                                 backgroundColor: 'whitesmoke',
                                 transition: 'background-color 0.1s ease'
                             }}
                             onMouseOver={e => e.currentTarget.style.backgroundColor = 'lightgrey'}
                             onMouseOut={e => e.currentTarget.style.backgroundColor = 'whitesmoke'}
                        >
                            {activity.name}
                        </div>
                    ))}
                </Modal>
            </div>

        </div>

    )
        ;
};

const mapDispatchToProps = {
    setUserTrips,
    setUserActivities
};

export default connect(null, mapDispatchToProps)(Dashboard);

