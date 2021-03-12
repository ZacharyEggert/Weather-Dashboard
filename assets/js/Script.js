const getCoordAPI = ["https://api.opencagedata.com/geocode/v1/json?q=", "&key=9200b5e569074d4da0c2aedc85e11b38"];
const getLocAPI = ["https://api.opencagedata.com/geocode/v1/json?q=", "+", "&key=9200b5e569074d4da0c2aedc85e11b38"]
const getWeatherAPI = ["https://api.openweathermap.org/data/2.5/onecall?lat=", "&lon=", "&appid=fcc8eabc5b233c3946864c660da82fbe&units=imperial&exclude=hourly,minutely"];

const locSearchBox = $(".search-box");
const currentDay = $(".current-day");
const fiveDay = $(".five-day");
const submitButton = $(".submit-button");
const locList = $(".loc-list");

const wdLIST = $(".weatherdata");

var savedList = []

try {
    if(localStorage.getItem("weatherCityList") !== null){
        savedList = JSON.parse(localStorage.getItem("weatherCityList"));
    }else{
        localStorage.setItem("weatherCityList", JSON.stringify(savedList));
    }
} catch (e) {console.log(e)}

async function getWeatherDataFromName(string){

    //let string = locSearchBox.text();
    try {

        const coordAPIResponse = await fetch(getCoordAPI[0] + string + getCoordAPI[1]);
        if(coordAPIResponse.status < 400){
            const coordAPIData = await coordAPIResponse.json();
            //console.log(coordAPIData);
            const coordData = coordAPIData.results[0].geometry;
            //console.log(coordData);
            //console.log(getWeatherAPI[0] + coordData.lat + getWeatherAPI[1] + coordData.lng + getWeatherAPI[2])
            const weatherAPIResponse = await fetch(getWeatherAPI[0] + coordData.lat + getWeatherAPI[1] + coordData.lng + getWeatherAPI[2]);
            const weatherAPIData = await weatherAPIResponse.json();
            //console.log(weatherAPIData);

            return weatherAPIData;
        
        }else{console.log(coordAPIResponse);}

    } catch (e) {console.log(e)}
}

async function getNameFromWeatherData(lat, lng){
    try {
        const locAPIResponse = await fetch(getLocAPI[0] + lat + getLocAPI[1] + lng + getLocAPI[2]);
        const locAPIData = locAPIResponse.json();
        //console.log(locAPIData);
        
        return locAPIData;

        
    } catch (e) {console.log(e)}
}

function updateChart(weatherDataObj){
    let wd = weatherDataObj;
    //console.log(wd)

    for (let i = 0; i < wd.daily.length && i < 6; i++) {
        let element = wd.daily[i];
        let dayTemp;
        if(i === 0){
            dayTemp = wd.current.temp;
        }else{
            dayTemp = element.temp.day;
        }
        let dayDate = moment.unix(element.dt).format("M/D/YY");
        let dayMin = element.temp.min;
        let dayMax = element.temp.max;
        let dayWeather = element.weather[0].main;
        let dayWeatherDesc = element.weather[0].description;
        let dayPrecip = 0;
        try{
        if(element.rain){dayPrecip = element.rain;}
        }catch(e){console.log(e);}
        //console.log(dayDate);
        //console.log(dayDate, dayTemp, dayMin, dayMax, dayWeather, dayWeatherDesc, dayPrecip)

        let thisCard = wdLIST.eq(i);
        //console.log(thisCard);

        $(".date").eq(i).text(dayDate);
        $(".weather-logo").eq(i).attr("src", `http://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`).attr("alt", dayWeatherDesc);

        if(i === 0){$(".weather-logo").eq(i).attr("src", `http://openweathermap.org/img/wn/${wd.current.weather[0].icon}@4x.png`).attr("alt", dayWeatherDesc);}

        $(".temperature").eq(i).html(Math.round(dayTemp) + "&deg;F");
        $(".temp-high").eq(i).html(Math.round(dayMax) + "&deg;");
        $(".temp-low").eq(i).html(Math.round(dayMin) + "&deg;");
        $(".precipitation").eq(i).text(dayPrecip + '" of rain');
        if(dayPrecip<.25){$(".precipitation").eq(i).attr("style", "display: none;")}else{$(".precipitation").eq(i).attr("style", "display: inline;")}

    }

    switch(wd.current.weather[0].icon){
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
    $(".block-load").attr("style", "display: flex;");
    let wd = await getWeatherDataFromName(locSearchBox.val());
    let nameData = await getNameFromWeatherData(wd.lat, wd.lon);
    //console.log(nameData);
    updateChart(wd)
    $(".block-load").attr("style", "display: none;");
    let nameDataComponents = nameData.results[0].components;
    let nameFormatted;
    if(nameDataComponents.country_code === 'us'){
        nameFormatted = nameDataComponents.city + ", " + nameDataComponents.state_code + " USA";
    }else{
        nameFormatted = nameDataComponents.city + ", " + nameDataComponents.country;
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

locList.on("click", async function(e){
    //console.log(e.target.tagName)
    if(e.target.tagName === "LI"){
        let wd = await getWeatherDataFromName($(e.target).text());
        updateChart(wd);
    }
});

renderList();
async function renderInit() {
    let wd = await getWeatherDataFromName("Seattle");
    updateChart(wd)
    $(".block-load").attr("style", "display: none;");
}

renderInit()