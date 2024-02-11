import React, {useEffect, useRef, useState} from "react";
import {connect, useSelector} from "react-redux";
import Modal from 'react-modal';
import {
    fetchNewActivities,
    postUserActivities,
    getUserActivitiesFromDB, pinActivity, unpinActivities, nameTrip, formatNumber, convertToKm, shortenText,
    putDashboardToken, getDashboardURL
} from "../utils/functions";
import {useNavigate} from "react-router-dom";
import {
    setExternal,
    setTripActivities,
    setTripName,
    setUserActivities,
    setUsersummary,
    setUserTrips,
    setZoomeds
} from "../actions";
import Trip from "../components/Trip";
import SmallActivity from "../components/SmallActivity";
import styled from 'styled-components';
import { faStrava } from '@fortawesome/free-brands-svg-icons';
import {
    faPlus,
    faArrowLeft,
    faArrowRight,
    faRunning,
    faBicycle,
    faShareAlt,
    faCheck,
    faLevelUpAlt
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan} from '@fortawesome/free-solid-svg-icons';
import WorldMap from "../components/WorldMap";
import {ToastContainer, toast, Slide} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FabComponent } from '@syncfusion/ej2-react-buttons';



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

let name;


const Dashboard = (props) => {
    const trips = useSelector((state) => state.userTrips);
    const external = useSelector((state) => state.externalOrigin);
    name = useSelector((state) => state.userName);
    if (!external) {
        name = "Your";
    } else {
        name = `${name}'s`
    }
    console.log("external", external, "name", name)
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
            const {scrollWidth, clientWidth} = scrollContainerRef.current;
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
                console.log("No new activities");
                toast.info('No new activities to add', {
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
        });
    };

    const handleShareClick = async () => {
        putDashboardToken(strava_id).then(async (dashboard) => {
            console.log("dash", dashboard);
            if (dashboard.token) {
                await navigator.clipboard.writeText(getDashboardURL(dashboard.token));
                toast.info(<><FontAwesomeIcon icon={faCheck} />Link copied to clipboard</>, {
                    position: "top-center",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Slide,
                });
            } else {
                toast.error(<><FontAwesomeIcon icon={"face-sad-cry"}/>There was a problem with your share link</>, {
                    position: "top-center",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Slide,
                });

            }
        })
    }

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
        <div style={{paddingTop: "5em", overflowX: 'hidden'}}>
            <h1 style={{textAlign: 'center'}}>{name} Big Trips</h1>
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
            <div style={{paddingTop: "2em", position: 'relative'}}>
                <h1 style={{textAlign: 'center'}}>{name} pinned activities</h1>
                {!external && pinnedActivities?.length > 0 && (
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

                {!external && <button onClick={openModal} style={{marginLeft: '1em', marginBottom: '1em'}}>
                    Add activity <FontAwesomeIcon icon={faPlus}/>
                </button>}
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
                        <div style={{width: '100%', textAlign: 'center'}}>{name} pinned activities will appear here</div>
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
            <h1 style={{paddingTop: '2em', textAlign: 'center'}}>{name} activities ranked</h1>
            <div style={{display: 'flex', justifyContent: 'space-between', backgroundColor: 'whitesmoke'}}>
                {rankedActivities?.map((actObj, index) => (
                    <div style={{
                        flex: '1',
                        borderRight: index < rankedActivities.length - 1 ? '1px solid #000' : 'none',
                        paddingRight: '1em'
                    }}>
                        <ActivityRanking
                            crit={actObj.crit}
                            activities={actObj.activities}
                            activityRefs={activityRefs}
                            isOverflowing={isOverflowing}
                            scrollLeft={scrollLeft}
                            scrollRight={scrollRight}
                        />
                    </div>
                ))}
            </div>

            {!external && <button onClick={handleButtonClick} style={{marginLeft: '1em', display: 'block', margin: '2em auto'}}>
                Fetch new activities from Strava <FontAwesomeIcon icon={faStrava}/>
            </button>}
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
            {!external && <FabComponent id='fab' style={{backgroundColor: "#0800ff"}}
                           onClick={handleShareClick}><FontAwesomeIcon icon={faShareAlt}/></FabComponent>}
        </div>

    )
        ;
};

function ActivityRanking({crit, activities}) {
    return (
        <div className='rankedContainer'
             style={{
                 padding: "10px",
                 display: 'flex',
                 flexDirection: 'column',
                 overflowX: 'hidden',
             }}>
            <FontAwesomeIcon icon={activities[0].type === "Run" ? faRunning : faBicycle}
                             style={{paddingBottom: '0.5em', textAlign: 'center'}}/>
            {activities?.length > 0 ? (
                activities.map((activity, index) => (
                    <div key={index} style={{marginTop: '1em'}}>
                    <h6>
                            {crit ? (<>
                                {shortenText(activity.name, 22)}: <span style={{fontSize: '0.8em'}}>
    {crit === "distance" ? `${formatNumber(convertToKm(activity[crit]))}km` : `${formatNumber(activity[crit])}m`}
                                {crit === "total_elevation_gain" &&
                                    <FontAwesomeIcon icon={faLevelUpAlt} style={{marginLeft: '.5em'}}/>}
                        </span>

                            </>) : (shortenText(activity.name, 30))}
                        </h6>
                    </div>
                ))
            ) : (
                <div style={{width: '100%', textAlign: 'center'}}>{name} ranked activities will appear here</div>
            )}
        </div>
    );
}


const mapDispatchToProps = {
    setUserTrips,
    setUserActivities,
    setZoomeds,
    setTripActivities,
    setTripName,
    setExternal,
    setUsersummary
};

export default connect(null, mapDispatchToProps)(Dashboard);

