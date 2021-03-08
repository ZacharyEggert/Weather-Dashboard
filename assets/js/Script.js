const getCoordAPI = ["https://api.opencagedata.com/geocode/v1/json?q=", "&key=9200b5e569074d4da0c2aedc85e11b38"];
const getLocAPI = ["https://api.opencagedata.com/geocode/v1/json?q=", "+", "&key=9200b5e569074d4da0c2aedc85e11b38"]
const getWeatherAPI = ["https://api.openweathermap.org/data/2.5/onecall?lat=", "&lon=", "&appid=fcc8eabc5b233c3946864c660da82fbe&units=imperial"];

const locSearchBox = $(".search-box");
const currentDay = $(".current-day");
const fiveDay = $(".five-day");
const submitButton = $(".submit-button");
const locList = $(".loc-list");

var savedList = []

try {
    
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

            const weatherAPIResponse = await fetch(getWeatherAPI[0] + coordData.lat + getWeatherAPI[1] + coordData.lng + getWeatherAPI[2]);
            const weatherAPIData = await weatherAPIResponse.json();
            console.log(weatherAPIData);

            return weatherAPIData;
        
        }else{console.log(coordAPIResponse);}

    } catch (e) {console.log(e)}
}

async function getNameFromWeatherData(lat, lng){
    try {
        const locAPIResponse = await fetch(getLocAPI[0] + lat + getLocAPI[1] + lng + getLocAPI[2]);
        const locAPIData = locAPIResponse.json();
        console.log(locAPIData);
        
        return locAPIData;

        
    } catch (e) {console.log(e)}
}

function updateChart(weatherDataObj){

}


submitButton.on("click", async function(e){
    console.log(locSearchBox.val())
    let wd = await getWeatherDataFromName(locSearchBox.val());
    let nameData = await getNameFromWeatherData(wd.lat, wd.lon);
    console.log(nameData);
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
        locList.append(newLi);
    }
    locSearchBox.val("");
})

locList.on("click", function(e){
    console.log(e.target.tagName)
    if(e.target.tagName === "LI"){
        let wd = getWeatherDataFromName($(e.target).text());
        
    }
})