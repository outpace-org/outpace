import React from "react";
import {Map, GeoJson} from "pigeon-maps";
import {centerZoomFromLocations, convertToKm, formatNumber, mapboxProvider} from "../utils/functions";
import {faRunning, faBicycle, faLevelUpAlt} from '@fortawesome/free-solid-svg-icons';
import {faStrava} from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


var polyline = require('@mapbox/polyline');


function SmallActivity({activity, crit}) {
    var coordinates = [];
    try {
        coordinates = polyline.decode(activity.summary_polyline).map(([lng, lat]) => [lat, lng]);
    } catch (error) {
        console.error(error);
        coordinates = polyline.decode(activity.map.summary_polyline).map(([lng, lat]) => [lat, lng]);
    }
    const mid = coordinates[parseInt(coordinates.length / 2)];
    const mapWidth = window.innerWidth * 0.3;
    const mapHeight = window.innerHeight * 0.2;
    const {center, zoom} = centerZoomFromLocations(coordinates, mapWidth, mapHeight);
    const logo = activity.type === "Run" ? faRunning : faBicycle;
    let displayValue;
    if (crit) {
        displayValue = crit === "distance" ? `${formatNumber(convertToKm(activity[crit]))}km` : `${formatNumber(activity[crit])}m`;
    }
    console.log("mid", mid, "center", center)
    return (<div>
            <h5>
                <FontAwesomeIcon icon={logo} style={{marginRight: '.5em'}}/>
                {crit ? (<>
                        {activity.name}: <span style={{fontSize: '0.8em'}}>
    {displayValue}
                        {crit === "total_elevation_gain" &&
                            <FontAwesomeIcon icon={faLevelUpAlt} style={{marginLeft: '.5em'}}/>}
</span>

                    </>) : (activity.name)}
            </h5>            <Map width={mapWidth} height={mapHeight} defaultCenter={[center[1], center[0]]}
                                  defaultZoom={zoom}
                                  provider={mapboxProvider} twoFingerDrag={false} mouseEvents={false}>
            <GeoJson
                data={{
                    type: 'FeatureCollection', features: [{
                        type: 'Feature', geometry: {
                            type: 'LineString', coordinates,
                        }, properties: {
                            prop0: 'value0', prop1: 0.0,
                        },
                    },],
                }}
                styleCallback={(feature, hover) => {
                    if (feature.geometry.type === 'LineString') {
                        return {strokeWidth: '2', stroke: 'black'}
                    }
                    return {fill: '#d4e6ec99', strokeWidth: '1', stroke: 'white', r: '20'}
                }}
            />
        </Map>
        </div>);
}

export default SmallActivity;
