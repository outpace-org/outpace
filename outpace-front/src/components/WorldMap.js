import React from "react";
import {Map, GeoJson} from "pigeon-maps";
import {mapboxProviderDark} from "../utils/functions";

function compare( a, b ) {
    if ( a[1] < b[1] ){
        return -1;
    }
    if ( a[1] > b[1] ){
        return 1;
    }
    return 0;
}

function WorldMap({data}) {
    const geoJson = require('world-geojson');
    const dataSorted = data.sort(compare).reverse();
    const maxi = dataSorted[0][1];
    const geoColors = dataSorted?.map(countryVal => [countryVal[0] === "United States" ?
        geoJson.forCountry("USA") : geoJson.forCountry(countryVal[0]),
        Math.floor(255*countryVal[1]/maxi)]);
    console.log("For the USA", geoJson.forCountry("United States"));
    const mapWidth = window.innerWidth * 0.6;
    const mapHeight = mapWidth;
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h3>Your heatmap</h3>
            <Map width={mapWidth} height={mapHeight} defaultCenter={[0, 0]} defaultZoom={3} provider={mapboxProviderDark}>
                {geoColors?.map(geoColor => (
                    <GeoJson
                        data={geoColor[0]}
                        //styleCallback={() => ({ fill: `rgb(255, ${255-geoColor[1]}, ${255-geoColor[1]})` })}
                        styleCallback={() => ({ fill: `rgb(255, 0, 0, ${(geoColor[1]/255)*.8+0.2})` })}
                    />
                ))}
            </Map>
        </div>
    );
}

export default WorldMap;
