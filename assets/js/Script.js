
/**
 * API CALLS
 */
const getCoordAPI = ["https://api.opencagedata.com/geocode/v1/json?q=", "&key=9200b5e569074d4da0c2aedc85e11b38"];
const getLocAPI = ["https://api.opencagedata.com/geocode/v1/json?q=", "+", "&key=9200b5e569074d4da0c2aedc85e11b38"]
const getWeatherAPI = ["https://api.openweathermap.org/data/2.5/onecall?lat=", "&lon=", "&appid=fcc8eabc5b233c3946864c660da82fbe&units=imperial&exclude=hourly,minutely"];


/**
 * DOM REFERENCES
 */
const locSearchBox = $(".search-box");
const currentDay = $(".current-day");
const fiveDay = $(".five-day");
const submitButton = $(".submit-button");
const locList = $(".loc-list");
const wdLIST = $(".weatherdata");

/**
 * LOCAL STORAGE ACCESS FOR SAVED LIST
 */

var savedList = []
try {
    if(localStorage.getItem("weatherCityList") !== null){
        savedList = JSON.parse(localStorage.getItem("weatherCityList"));
    }else{
        localStorage.setItem("weatherCityList", JSON.stringify(savedList));
    }
} catch (e) {console.log(e)}




/**
 * 
 * @param {String} string Name of city to Geocode and fetch weather data for
 * @returns Returns weather data object from API 
 */
async function getWeatherDataFromName(string){

    /** HIDES THE PAGE WHILE LOADING */
    $(".block-load").attr("style", "display: flex;");
    $(".content").attr("style", "overflow-y: hidden;");
    //let string = locSearchBox.text();
    try {

        const coordAPIResponse = await fetch(getCoordAPI[0] + string + getCoordAPI[1]);             //fetches COORDINATES from geocoding api
        if(coordAPIResponse.status < 400){                                                          //on good response, parses, gets lat & lon
            const coordAPIData = await coordAPIResponse.json();
            //console.log(coordAPIData);
            const coordData = coordAPIData.results[0].geometry;
            //console.log(coordData);
            //console.log(getWeatherAPI[0] + coordData.lat + getWeatherAPI[1] + coordData.lng + getWeatherAPI[2])
            const weatherAPIResponse = await fetch(getWeatherAPI[0] + coordData.lat + getWeatherAPI[1] + coordData.lng + getWeatherAPI[2]);     //fetches forecast from Weather API
            const weatherAPIData = await weatherAPIResponse.json();                                                                             //Parses into returnable object
            //console.log(weatherAPIData);

            return weatherAPIData;
        
        }else{console.log(coordAPIResponse);}

    } catch (e) {console.log(e)}        //LOG ERRORS FOR DEBUG
}

/**
 * 
 * @param {number} lat Latitude
 * @param {number} lng  Longitude
 * @returns Returns location data from Geolocation, City, State, Country, etc.
 */
async function getNameFromWeatherData(lat, lng){
    try {
        const locAPIResponse = await fetch(getLocAPI[0] + lat + getLocAPI[1] + lng + getLocAPI[2]);
        const locAPIData = locAPIResponse.json();
        //console.log(locAPIData);
        return locAPIData;
    } catch (e) {console.log(e)}        //LOG ERRORS FOR DEBUG
}

/**
 * 
 * @param {Object} weatherDataObj JSON parsed API call response
 */
async function updateChart(weatherDataObj){
    

    let wd = weatherDataObj;
    //console.log(wd);
    let nameData = await getNameFromWeatherData(wd.lat, wd.lon);            //Get City Name From GEOLOC

    for (let i = 0; i < wd.daily.length && i < 6; i++) {                    //Put data into HTML objects
        let element = wd.daily[i];
        let dayTemp;
        if(i === 0){                                                        //Special cases for Current view as opposed to current Day
            dayTemp = wd.current.temp;
        }else{
            dayTemp = element.temp.day;
        }
        let dayDate = moment.unix(element.dt).format("M/D/YY");             //Format Date
        let dayMin = element.temp.min;                                      //Pulling data into objects
        let dayMax = element.temp.max;
        let dayHumid = element.humidity;
        // let dayWeather = element.weather[0].main; //UNUSED
        let dayWeatherDesc = element.weather[0].description;
        let dayPrecip = 0;
        try{
        if(element.rain){dayPrecip = element.rain;}
        }catch(e){console.log(e);}
        //console.log(dayDate);
        //console.log(dayDate, dayTemp, dayMin, dayMax, dayWeather, dayWeatherDesc, dayPrecip)

        // let thisCard = wdLIST.eq(i);
        //console.log(thisCard);

        $(".date").eq(i).text(dayDate);
        $(".weather-logo").eq(i).attr("src", `https://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`).attr("alt", dayWeatherDesc); //FETCH ICON FROM API

        if(i === 0){
            $(".weather-logo").eq(i).attr("src", `https://openweathermap.org/img/wn/${wd.current.weather[0].icon}@4x.png`).attr("alt", dayWeatherDesc); //FETCH ICON FROM API HIRES
            $(".date").eq(i).html((nameData.results[0].components.city ?? nameData.results[0].components.country) + "<br>" + dayDate);
            $(".wind").text(wd.current.wind_speed);

            let uv = ""
            if(wd.current.uvi<2){uv = "uv-green";}else if(wd.current.uvi < 5){uv = "uv-yellow"}else{uv = "uv-red"} //ASSIGN UV SEVERITY RATINGS
            $(".uvi").text("\n UVI: " + Math.round(wd.current.uvi * 10)/10).attr("id", uv);
        }
        $(".humidity").eq(i).text(dayHumid + "%RH")
        $(".temperature").eq(i).html(Math.round(dayTemp) + "&deg;F");
        $(".temp-high").eq(i).html(Math.round(dayMax) + "&deg;");
        $(".temp-low").eq(i).html(Math.round(dayMin) + "&deg;");
        $(".precipitation").eq(i).text("Precipitation: " + Math.round(dayPrecip*10)/10 + '"');
        if(dayPrecip<.15){$(".precipitation").eq(i).attr("style", "visibility: hidden;")}else{$(".precipitation").eq(i).attr("style", "")} //HIDES PRECIP IF IT'S NOT RAINING

    }
    
    $(".block-load").attr("style", "display: none;");
    $(".content").attr("style", "overflow-y: scroll;");                     //STOP HIDING THE PAGE

    switch(wd.current.weather[0].icon){                                     //CSS PER CURRENT WEATHER CONDITION
        case "01d": 
            $("body").attr("class", "sunny");
        break;
        case "02d": 
            $("body").attr("class", "sunny");
        break; 
        case "01n": 
            $("body").attr("class", "sunny");
        break; 
        case "02n":
            $("body").attr("class", "sunny");
        break;
        case "03d":
            $("body").attr("class", "cloudy");
        break;
        case "04d":
            $("body").attr("class", "cloudy");
        break;
        case "03n":
            $("body").attr("class", "cloudy");
        break; 
        case "04n":
            $("body").attr("class", "cloudy");
        break;
        case "09d":
            $("body").attr("class", "rainy");
        break;
        case "09n":
            $("body").attr("class", "rainy");
        break;
        case "10d":
            $("body").attr("class", "rainy");
        break;
        case "10n":
            $("body").attr("class", "rainy");
        break;
        case "11d":
            $("body").attr("class", "rainy");
        break;
        case "11n":
            $("body").attr("class", "rainy");
        break;
        default:
            $("body").attr("class", "cloudy");
        break;
    }
}


/**
 * Renders the saved list into the side bar
 */
function renderList() {
    locList.html("");
    for (let j = 0; j < savedList.length; j++) {
        const element = savedList[j];
        let newLi = $("<li>").text(element);
        locList.append(newLi);
    }
}


submitButton.on("click", async function(e){
    //console.log(locSearchBox.val());
    let wd = await getWeatherDataFromName(locSearchBox.val());
    let nameData = await getNameFromWeatherData(wd.lat, wd.lon);
    //console.log(nameData);
    updateChart(wd)
    let nameDataComponents = nameData.results[0].components;
    let nameFormatted;
    if(nameDataComponents.country_code === 'us' && nameDataComponents.city){
        nameFormatted = nameDataComponents.city + ", " + nameDataComponents.state_code + " USA";
    }else if(nameDataComponents.city){
        nameFormatted = nameDataComponents.city + ", " + nameDataComponents.country;
    }else if(nameDataComponents.country_code === 'us'){
        nameFormatted = nameDataComponents.state_code + " USA";
    }else{
        nameFormatted = nameDataComponents.country;
    }
    //console.log(nameFormatted)
    
    if(!savedList.includes(nameFormatted)){
        savedList.unshift(nameFormatted);
        let newLi = $("<li>").text(nameFormatted);
        locList.prepend(newLi);
        localStorage.setItem("weatherCityList", JSON.stringify(savedList));
    }
    locSearchBox.val("");
});

locList.on("click", async function(e){                  //Clickable list
    //console.log(e.target.tagName)
    if(e.target.tagName === "LI"){
        let wd = await getWeatherDataFromName($(e.target).text());
        await updateChart(wd);
    }
});

renderList();
async function renderInit() { //initial render of Seattle as city. 
    let wd = await getWeatherDataFromName("Seattle"); //TODO: Implement the last looked up item as the starting page
    await updateChart(wd);

}

renderInit()