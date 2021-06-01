import '../assets/sass/main.scss'
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoicGVkcm9kbmNuIiwiYSI6ImNrb2pwYTFraDBibGUydnFmcGt3eTFiazYifQ.-7gTuVZmfUJIlnDy8iQErQ';


window.addEventListener("load", () => {
    loadMapView();
});

/**
*
*
*/

let markersPositions;
let mapPosition;
let view;
let map;
let weather;


/**
*
*
*/

/**
*
*
*/


const loadMarkers = () => {
    const localStorageMarkers = localStorage.getItem("markers");
    if (localStorageMarkers == null){
        markersPositions= [];
    } else {
        markersPositions = JSON.parse(localStorageMarkers);
    }
}

const loadMapInfo = () => {
    const localStoragePosition = localStorage.getItem("map-info");
    if (localStoragePosition == null){
        mapPosition = {
            center: [0,0],
            zoom: 2
        };
    } else {
        mapPosition = JSON.parse(localStoragePosition);
    }
}



/**
*
*
*/


const loadMapView = () => {
    view = "map";
    loadMarkers();
    loadMapInfo();
    renderMapViewHeader();
    renderMapViewMain();
    renderMapViewFooter();
}



/**
*
*
*/



const renderMapViewHeader = () => {
    const header = document.querySelector(".header");
    header.innerHTML = `<h2 class="busca">Busca y haz click para ver el tiempo</h2>`;
}


/**
*
*
*/


const renderMapViewMain = () => {
    const main = document.querySelector(".main");
    main.innerHTML = '<div id="mi_super_mapa"></div>';
    renderMap();
    renderMarkers();
    initMapEvents();
}


/**
*
*
*/

const renderMapViewFooter = () => {
    const footer = document.querySelector(".footer");
    footer.innerHTML = '<span class ="title_position">Ir a mi ubicación</span>';
    //
    footer.addEventListener("click", () =>{
        flyToLocation();
    });
}


/**
*
*
*/


const renderMap = () => {
    map = new mapboxgl.Map({
        container: 'mi_super_mapa', 
        style: 'mapbox://styles/mapbox/streets-v11',
        center: mapPosition.center, 
        zoom: mapPosition.zoom 
    });
}


/**
*
*
*/


const renderMarkers = () => {
    markersPositions.forEach(m => {
        console.log(m);
        new mapboxgl.Marker().setLngLat([m.coord.lon, m.coord.lat]).addTo(map);     
    })

}


/**
*
*
*/


const flyToLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        //
            map.flyTo({
                center: [lng, lat], 
                zoom: 9
            })
    });
}


/**
*
*
*/

const initMapEvents = () => {
    map.on("move", (ev) => {
        const center = ev.target.getCenter();
        const zoom = ev.target.getZoom();
        const storingObj = {
            lat: center.lat,
            lng: center.lng,
            zoom: zoom
        };
        localStorage.setItem("map-info", JSON.stringify(storingObj));

    });

    map.on("click", async(ev) => {
        loadSingleView(ev.lngLat);
    });
}



/**
*
*
*/



const loadSingleView = async(lngLat)=> {
    view = "single";
    loadSpinner();
    await fetchData(lngLat);

    unloadSpinner();
    renderSingleViewHeader();
    renderSingleViewMain();
    renderSingleViewFooter();

}



/**
*
*
*/



const loadSpinner = () => {
    const spinner = document.querySelector(".spinner");
    spinner.classList.add("opened");
}

const unloadSpinner = () => {
    const spinner = document.querySelector(".spinner");
    spinner.classList.remove("opened");
}



/**
*
*
*/


const fetchData = async(lngLat) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lngLat.lat}&lon=${lngLat.lng}&appid=b92eb8a2e5fe79e7ea0cfcf4ebb3d1b8`;
    weather = await fetch(url).then(d => d.json()).then(d => d);
    console.log(weather);
}


/**
*
*
*/


const renderSingleViewHeader = () => {
    const header = document.querySelector(".header");
    header.innerHTML = `<h2 class="name"><button><span class ="fa fa-chevron-left"></span></button>${weather.name}</h2>`;
    
    const buttonBack = header.querySelector("button");
    buttonBack.addEventListener("click", ()=> {
        loadMapView();
    })
    //
}


const renderSingleViewMain = () => {
    const main = document.querySelector(".main");
    main.innerHTML = `
    <div class ="weather_container">
    <div class ="weather_element">
    <div class ="fa fa-cloud fa-2x"></div>
    <div class ="weather_element_info">${weather.clouds.all}/100</div>
    <div class ="weather_element_title">Clouds</div>
    </div>
    <div class ="weather_element">
    <div class ="fa fa-thermometer-half fa-2x"></div>
    <div class ="weather_element_info">${Math.round(weather.main.feels_like - 273.15)} ºC</div>
    <div class ="weather_element_title">Feels like</div>
    </div>
    <div class ="weather_element">
    <div class ="fa fa-thermometer-half fa-2x"></div>
    <div class ="weather_element_info">${Math.round(weather.main.temp - 273.15)} ºC</div>
    <div class ="weather_element_title">Temperature</div>
    </div>
    <div class ="weather_element">
    <div class ="fa fa-thermometer-full fa-2x"></div>
    <div class ="weather_element_info">${Math.round(weather.main.temp_max - 273.15)} ºC</div>
    <div class ="weather_element_title">Max Temperature</div>
    </div>
    <div class ="weather_element">
    <div class ="fa fa-thermometer-empty fa-2x"></div>
    <div class ="weather_element_info">${Math.round(weather.main.temp_min - 273.15)} ºC</div>
    <div class ="weather_element_title">Min Temperature</div>
    </div>
    <div class ="weather_element">
    <div class ="fa fa-tint fa-2x"></div>
    <div class ="weather_element_info">${weather.main.humidity} %</div>
    <div class ="weather_element_title">Humidity</div>
    </div>
    <div class ="weather_element">
    <div class ="fa fa-arrow-down fa-2x"></div>
    <div class ="weather_element_info">${weather.main.pressure} mb</div>
    <div class ="weather_element_title">Pressure</div>
    </div>
    </div>`;
}


const renderSingleViewFooter = () => {
    const footer = document.querySelector(".footer");
    footer.innerHTML = '<span class ="fa fa-save"></span><span class ="title_save">Save place</span>';
    
    footer.addEventListener("click", () => {
        saveMarker();
        loadMapView();
    });
    
}


/**
*
*
*/


const saveMarker = () => {
    markersPositions.push(weather);
    localStorage.setItem("markers", JSON.stringify(markersPositions));
    mapPosition = {
        center:[weather.coord.lon, weather.coord.lat],
        zoom: 11
    }
    const storingObj = {
        lat: weather.coord.lat,
        lng: weather.coord.lon,
        zoom: 11
    };
    localStorage.setItem("map-info", JSON.stringify(storingObj));
}