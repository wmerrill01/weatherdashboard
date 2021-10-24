// event listener for when the user types in the city name
//AND
// event listener for when the user clicks on a city button

var apiKey = "11844fc65296129b6cf4bbaa841fc2e6";
var today = moment().format('l');

//Need to put in local storage of city names

var cityList;
if (JSON.parse(localStorage.getItem("searched-city"))) {
    cityList = JSON.parse(localStorage.getItem("searched-city"))
} else {
    cityList = []
};

for (i = 0; i < cityList.length; i++) {
    var cityInput = $(` <li class="list-group-item row background">${cityList[i]}</li>`);
    $("#search-list").append(cityInput)
};

//Need to show conditions
//temp. humidity. wind speed. UV index.

function conditions(city) {
    var weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    $.ajax({
        url: weatherURL,
        method: "GET"
    
    }).then(function(cityResponse){
        $("#cityInfo").empty();

        var iconPic = cityResponse.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconPic}.png`;
        var currentCity = $(`
            <h2 id="currentCity"> ${cityResponse.name} ${today} <img src="${iconURL}" /></h2>
            <p>Temperature: ${cityResponse.main.temp} °F</p>
            <p>Humidity: ${cityResponse.main.humidity}%</p>
            <p>Wind: ${cityResponse.wind.speed}MPH</p>
        `);
    $("#cityInfo").append(currentCity);


    var lat = cityResponse.coord.lat;
    var lon = cityResponse.coord.lon;
    var weatherURL2 = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    $.ajax({
        url: weatherURL2,
        method: "GET"
    }).then(function(uviResponse){

        var heatIndex = uviResponse.value;
        var heatIndex2 = $(`<p>Heat Index: <span id ="heatIndexColor" class="px-4 py-4 square">${heatIndex}</span></p>`);
        $("#cityInfo").append(heatIndex2);
        if (heatIndex < 2) {
            $("#heatIndexColor").addClass("uvfavorable");
        } else if (heatIndex >=2 && heatIndex <=6) {
            $("#heatIndexColor").addClass("uvmoderate");
        } else if (heatIndex > 6) {
            $("#heatIndexColor").addClass("uvsevere");
        }
    fiveDayForcast(lat, lon);
    })
    })
}
//Need to show 5 day forcast
//Make sure to put function into main function so it all happens at once

function fiveDayForcast(lat, lon) {
    var fiveDayURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    $.ajax({
        url: fiveDayURL,
        medhod: "GET"
    }).then(function(nextResponse){
        $("#next-days").empty();

        for (i=0; i<5; i++) {
            var cityInfo = {
                date: nextResponse.daily[i].dt,
                icon: nextResponse.daily[i].weather[0].icon,
                humidity: nextResponse.daily[i].humidity,
                temp: nextResponse.daily[i].temp.day
            };
            console.log(cityInfo.date);
        var today = moment.unix(cityInfo.date).format("MM/DD/YYYY");
        console.log(today);
        var iconPic = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png">`;

        var fiveDayDiv = `
            <div class="pl-3">
                <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width:12rem">
                    <div class="card-body">
                        <h5>${today}</h5>
                        <p>${iconPic}</p>
                        <p>Temp: ${cityInfo.temp} °F</p>
                        <p>Humidity: ${cityInfo.humidity} %</p>
                    </div>
                </div>
            </div>
            `;
        $("#next-days").append(fiveDayDiv);
        }
    });
}


//Event Listeners
//Need one for search bar and one for previous searches

$("#search-button").on("click", function(e) {
    e.preventDefault();
    var city = $("#search").val().trim();
    conditions(city);
    if (!cityList.includes(city)) {
        cityList.push(city);
        var cityInput = $(` <li class="list-group-item row background">${city}</li>`);
        $("#search-list").append(cityInput);
    };

    localStorage.setItem("searched-city", JSON.stringify(cityList));
    console.log(cityList);
});

$("#search-list li").on("click", function(e) {
    var listCities = $(this).text();
    conditions(listCities);
});