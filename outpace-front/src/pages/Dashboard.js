import React, {useEffect, useRef, useState} from "react";
import {connect, useSelector} from "react-redux";
import Modal from 'react-modal';
import {
    fetchNewActivities,
    postUserActivities,
    getUserActivitiesFromDB, pinActivity, unpinActivities, nameTrip
} from "../utils/functions";
import {useNavigate} from "react-router-dom";
import {setTripActivities, setTripName, setUserActivities, setUsersummary, setUserTrips, setZoomeds} from "../actions";
import Trip from "../components/Trip";
import SmallActivity from "../components/SmallActivity";
import styled from 'styled-components';
import { faStrava } from '@fortawesome/free-brands-svg-icons';
import {faPlus, faArrowLeft, faArrowRight, faRunning, faBicycle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faBan } from '@fortawesome/free-solid-svg-icons';
import WorldMap from "../components/WorldMap";


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


const Dashboard = (props) => {
    const trips = useSelector((state) => state.userTrips);
    let zoomeds = new Array(trips.length).fill(false);
    props.setZoomeds(zoomeds);
    const pinnedActivities = useSelector((state) => state.pinnedActivities)
    const rankedActivities = useSelector((state) => state.distanceRides);
    const strava_id = useSelector((state) => state.userId);
    const userActivities = useSelector((state) => state.userActivities);
    const navigate = useNavigate();
    const scrollContainerRef = React.useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            const { scrollWidth, clientWidth } = scrollContainerRef.current;
            setIsOverflowing(scrollWidth > clientWidth);
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => window.removeEventListener('resize', checkOverflow);
    }, []);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        getUserActivitiesFromDB(strava_id, pinnedActivities.map(activity => activity.id)).then(setActivities);
    }, []);

    async function addToPinnedActivity(id) {
        const data = await pinActivity(id);
        if (data) {
            navigate('/redirectDB');
        }
    }

    async function removePinnedActivities() {
        const data = await unpinActivities(strava_id);
        return data;
    }


    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleButtonClick = () => {
        fetchNewActivities(strava_id).then(async (activities) => {
            console.log("les activités", activities)
            if (activities.data.length > 0) {
                await postUserActivities(activities);
                props.setUsersummary(activities.data);
                navigate("/summary");
            } else {
                console.log("No new activities")
            }
        });
    };

    const handleTripToggleButtonClick = (index) => {
        zoomeds[index] = !zoomeds[index];
        props.setZoomeds(zoomeds);
    };


    const handleTripClick = (index) => {
        props.setTripActivities(trips[index].activities);
        props.setTripName(nameTrip(trips[index]));
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
    const [showDialog, setShowDialog] = useState(false);

    const openDialog = () => {
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
    };

    const confirmRemove = async () => {
        await removePinnedActivities();
        closeDialog();
        navigate('/redirectDB');
    };

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
                    <Trip key={index + zoomeds[index]} trip={trip} index={index} zoomed={zoomeds[index]}
                          onButtonClick={handleTripToggleButtonClick}/>
                    <hr style={{margin: '0'}}/>

                </div>
            ))}
            <div style={{paddingTop: "5em", position: 'relative'}}>
                <h1 style={{textAlign: 'center'}}>Your pinned activities</h1>
                {pinnedActivities?.length > 0 && (
                    <button onClick={openDialog} style={{position: 'absolute', right: '1em', marginBottom: '1em'}}>
                        Remove activities <FontAwesomeIcon icon={faBan}/>
                    </button>
                )}
                <Modal
                    isOpen={showDialog}
                    onRequestClose={closeDialog}
                    contentLabel="Remove Activities Confirmation"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: 'fit-content',
                        height: 'fit-content',
                        margin: 'auto'
                    }}
                >
                    <h2 style={{textAlign: 'center'}}>Do you really want to unpin all activities?</h2>
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        <button onClick={confirmRemove} style={{marginRight: '1em'}}>Yes</button>
                        <button onClick={closeDialog}>No</button>
                    </div>
                </Modal>

                <button onClick={openModal} style={{marginLeft: '1em', marginBottom: '1em'}}>
                    Add activity <FontAwesomeIcon icon={faPlus}/>
                </button>
                <div className='pinnedContainer' ref={scrollContainerRef}
                     style={{padding: "10px", display: 'flex', overflowX: 'auto', backgroundColor: 'whitesmoke'}}>
                    {pinnedActivities?.length > 0 ? (
                        pinnedActivities.map((activity, index) => (
                            <div key={index} style={{flex: '0 0 auto', marginRight: '1em'}}
                                 ref={el => activityRefs.current[index] = el}>
                                <SmallActivity activity={activity}/>
                            </div>
                        ))
                    ) : (
                        <div style={{width: '100%', textAlign: 'center'}}>Your pinned activities will appear here</div>
                    )}
                    {isOverflowing && <LeftArrowButton onClick={scrollLeft} style={{left: 0}}><FontAwesomeIcon
                        icon={faArrowLeft}/></LeftArrowButton>}
                    {isOverflowing && <RightArrowButton onClick={scrollRight} style={{right: 0}}><FontAwesomeIcon
                        icon={faArrowRight}/></RightArrowButton>}
                </div>
                <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                    <h2>Click an activity to add it to the pinned ones</h2>
                    {activities.map((activity, index) => (
                        <div key={index}
                             style={{
                                 backgroundColor: 'whitesmoke',
                                 transition: 'background-color 0.1s ease'
                             }}
                             onMouseOver={e => e.currentTarget.style.backgroundColor = 'lightgrey'}
                             onMouseOut={e => e.currentTarget.style.backgroundColor = 'whitesmoke'}
                             onClick={() => addToPinnedActivity(activity.id)}
                        >
                            {activity.name}
                        </div>
                    ))}
                </Modal>
            </div>
            <WorldMap activities={userActivities}/>
            <h1 style={{textAlign: 'center'}}>Your activities ranked</h1>
            {
                rankedActivities?.map(actObj => (<ActivityRanking
                    crit={actObj.crit}
                    activities={actObj.activities}
                    activityRefs={activityRefs}
                    isOverflowing={isOverflowing}
                    scrollLeft={scrollLeft}
                    scrollRight={scrollRight}
                />))}
            <button onClick={handleButtonClick} style={{marginLeft: '1em', display: 'block', margin: '2em auto'}}>
                Fetch new activities from Strava <FontAwesomeIcon icon={faStrava}/>
            </button>
        </div>

    )
        ;
};

function ActivityRanking({crit, activities}) {
    console.log("crit activity", crit, activities)
    const scrollContainerRef = useRef(null);
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

    return (
        <>
            <div className='rankedContainer' ref={scrollContainerRef}
                 style={{padding: "10px", display: 'flex', overflowX: 'hidden', backgroundColor: 'whitesmoke'}}>
                {activities?.length > 0 ? (
                    activities.map((activity, index) => (
                        <div key={index} style={{flex: '0 0 auto', marginRight: '1em'}}
                             ref={el => activityRefs.current[index] = el}>
                            <SmallActivity activity={activity} crit={crit}/>
                        </div>
                    ))
                ) : (
                    <div style={{width: '100%', textAlign: 'center'}}>Your ranked activities will appear here</div>
                )}
                <LeftArrowButton onClick={scrollLeft} style={{left: 0}}><FontAwesomeIcon
                    icon={faArrowLeft}/></LeftArrowButton>
                <RightArrowButton onClick={scrollRight} style={{right: 0}}><FontAwesomeIcon
                    icon={faArrowRight}/></RightArrowButton>
            </div>
        </>
    );
}



const mapDispatchToProps = {
    setUserTrips,
    setUserActivities,
    setZoomeds,
    setTripActivities,
    setTripName,
    setUsersummary
};

export default connect(null, mapDispatchToProps)(Dashboard);
