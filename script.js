var current = $("#currentDay");
var dateElement = $(".date");
var fiveDayDiv = $("#fiveDayDiv");
var fiveDayHead = $("#fiveDayHead");
var fiveDayBody = $("#fiveDayBody");
var searchBar = $("#searchBar");
var searchButton = $("#searchBtn");
var sidebar = $("#sidebar");
var sidebarData;
var date = moment().format("dddd, MMMM Do YYYY");

function loadData() {
  let data = JSON.parse(localStorage.getItem("sidebar"));
  if (data === null) {
    sidebarData = [];
  } else {
    sidebarData = data;
  }
}

function renderCurrent(city, type, temp, wind, humid, icon) {
  var titleEl = $("<div>");
  titleEl.attr("class", "card-body");
  var bodyEl = $("<div>");
  bodyEl.attr("class", "card-body");
  var typeEl = $("<p>");
  var cityEl = $("<h3>");
  var tempEl = $("<p>");
  var windEl = $("<p>");
  var humidEl = $("<p>");
  var iconEl = $("<img>");
  iconEl.attr("width", "50px");
  iconEl.attr("height", "50px");
  iconEl.attr("src", `http://openweathermap.org/img/wn/${icon}@2x.png`);

  typeEl.text(`${type}`);
  cityEl.text(`${city}`);
  tempEl.text(`${temp} °F`);
  windEl.text(`Wind Speed: ${Math.floor(wind)} MPH`);
  humidEl.text(`Humidity: ${humid}%`);

  current.append(titleEl);
  titleEl.append(cityEl);
  current.append(iconEl);
  current.append(bodyEl);
  bodyEl.append(typeEl);
  bodyEl.append(tempEl);
  bodyEl.append(windEl);
  bodyEl.append(humidEl);
}

function renderFiveDay(day, temp, wind, humid, icon) {
  var dayContainerEl = $("<div>");
  dayContainerEl.attr("class", "card");
  var dayTitle = $("<div>");
  dayTitle.attr("class", "card-body");
  var dayBody = $("<div>");
  dayBody.attr("class", "card-body");
  var dayEl = $("<h5>");
  var iconEl = $("<img>");
  iconEl.attr("width", "50px");
  iconEl.attr("height", "50px");
  iconEl.attr("src", `http://openweathermap.org/img/wn/${icon}@2x.png`);
  var tempEl = $("<p>");
  var windEl = $("<p>");
  var humidEl = $("<p>");

  dayEl.text(day);
  tempEl.text(`${temp} °F`);
  windEl.text(`Wind Speed: ${Math.floor(wind)} MPH`);
  humidEl.text(`Humidity: ${humid}%`);

  fiveDayBody.append(dayContainerEl);
  dayContainerEl.append(dayTitle);
  dayTitle.append(dayEl);
  dayContainerEl.append(iconEl);
  dayContainerEl.append(dayBody);
  dayBody.append(tempEl);
  dayBody.append(windEl);
  dayBody.append(humidEl);
}

async function locationApiCall(city) {
  try {
    await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=2dcc9b82cb61cd0351ef6ccf285ad2a3`
    )
      .then((response) => {
        if (!response.ok) {
          return console.log("locationApiCall failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!data) {
          console.log("No data recorded");
          return;
        }
        let lat = data.coord.lat;
        let lon = data.coord.lon;
        let city = data.name;
        oneWeatherAPI(lon, lat, city);
      });
  } catch (err) {
    console.log(err);
  }
}

async function oneWeatherAPI(lon, lat, city) {
  try {
    await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly&units=imperial&appid=2dcc9b82cb61cd0351ef6ccf285ad2a3`
    )
      .then((response) => {
        if (!response.ok) {
          console.log("404");
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (!data) {
          console.log("No data recorded");
          return;
        }
        console.log(data);
        let temp = data.current.temp;
        let wind = data.current.wind_speed;
        let humid = data.current.humidity;
        let weatherType = data.current.weather[0].main;
        let weatherIcon = data.current.weather[0].icon;
        renderCurrent(city, weatherType, temp, wind, humid, weatherIcon);
        dateElement.text(`${date}`);
        fiveDayHead.text("Five Day Forecast");
        for (let i = 0; i < 5; i++) {
          let dayF = moment.unix(data.daily[i].dt).format("dddd");
          let tempF = data.daily[i].temp.day;
          let windF = data.daily[i].wind_speed;
          let humidF = data.daily[i].humidity;
          let iconF = data.daily[i].weather[0].icon;
          renderFiveDay(dayF, tempF, windF, humidF, iconF);
        }
      });
  } catch (err) {
    console.log(err);
  }
}

var searchHandler = function (event) {
  event.preventDefault();
  if (searchBar.val().length === 0) {
    return window.alert("Please enter a city into the search bar.");
  }
  try {
    fiveDayHead.text("");
    fiveDayBody.empty();
    current.empty();
    locationApiCall(searchBar.val());
  } catch (err) {
    console.log(err);
  }
};

searchButton.on("click", searchHandler);
