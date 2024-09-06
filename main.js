// Get today's date
const now = new Date();

// Select DOM elements
const form = document.querySelector("form");
const input = document.querySelector("input");
const toggleButton = document.querySelector(".toggle");

let isCelsius = true; // Global variable to track the current temperature unit

function updateCurrentWeather(data) {
  // Current main
  document.querySelector("#location").textContent = data.address;
  document.querySelector("#short-desc").textContent =
    data.currentConditions.conditions;
  document.querySelector("#current-temp").textContent = `${Math.round(
    parseFloat(data.currentConditions.temp)
  )}°C`;
  document.querySelector("#current-temp").classList.add("temperature");
  document.querySelector(
    "#current-feel"
  ).textContent = `Feels like: ${Math.round(
    parseFloat(data.currentConditions.feelslike)
  )}°C`;
  document.querySelector("#current-feel").classList.add("temperature");
  document.querySelector(
    ".description"
  ).textContent = `Current conditions: ${data.currentConditions.conditions}; Chance of rain: ${data.currentConditions.precipprob}%`;

  // Middle section
  document.querySelector("#sunrise").textContent = data.days[0].sunrise.slice(
    0,
    5
  );
  document.querySelector("#sunset").textContent = data.days[0].sunset.slice(
    0,
    5
  );
  document.querySelector(
    "#chance-rain"
  ).textContent = `${data.days[0].precipprob}%`;
  document.querySelector("#humidity").textContent = `${parseFloat(
    data.days[0].humidity.toFixed(0)
  )}%`;
  document.querySelector("#wind").textContent = `${parseFloat(
    data.days[0].windspeed
  ).toFixed(0)}kph`;
  document.querySelector("#feels-like").textContent = `${parseFloat(
    data.days[0].feelslikemax.toFixed(0)
  )}°C/${parseFloat(data.days[0].feelslikemin.toFixed(0))}°C`;
  document.querySelector("#feels-like").classList.add("temperature");
  document.querySelector("#precip").textContent = `${parseFloat(
    data.days[0].precip.toFixed(0)
  )}mm`;
  document.querySelector("#pressure").textContent = `${parseFloat(
    data.days[0].pressure.toFixed(0)
  )}mb`;
  document.querySelector("#vis").textContent = `${parseFloat(
    data.days[0].visibility.toFixed(0)
  )}km`;
  document.querySelector("#uv").textContent = parseFloat(
    data.days[0].uvindex.toFixed(0)
  );
}

function getNext24Hours(data) {
  const timezoneOffsetMinutes = data.tzoffset * 60; // Assuming tzoffset is in hours

  const now = new Date();
  const currentUTCOffsetMinutes = now.getTimezoneOffset(); // Current local offset in minutes (browser)
  const currentHour =
    now.getUTCHours() +
    currentUTCOffsetMinutes / 60 +
    timezoneOffsetMinutes / 60;

  // Normalize the current hour to ensure it's between 0 and 23
  const normalizedCurrentHour = (currentHour + 24) % 24;

  // Combine today's and tomorrow's hourly data
  const combinedHourlyData = [...data.days[0].hours, ...data.days[1].hours];

  // Filter and slice to get the next 24 hours
  const next24Hours = combinedHourlyData
    .filter((hour, index) => {
      const hourUTC = new Date(hour.datetimeEpoch * 1000).getUTCHours(); // Convert the epoch to UTC hour
      const hourLocal = (hourUTC + timezoneOffsetMinutes / 60 + 24) % 24; // Adjust to local time using the timezone offset

      // Include hours from the current hour today and tomorrow
      return hourLocal >= normalizedCurrentHour || index >= 24;
    })
    .slice(0, 24);

  return next24Hours;
}

function buildDailyWeatherGrid(next24Hours) {
  const container = document.querySelector(".daily");
  container.innerHTML = "";

  // Build time row
  const timeRow = buildRow(next24Hours, getCurrentTime);
  container.appendChild(timeRow);

  // Build icon row
  const iconRow = buildRow(next24Hours, getIcon);
  container.appendChild(iconRow);

  // Build temperature row
  const tempRow = buildRow(next24Hours, getCurrentTemp);
  container.appendChild(tempRow);
}

function buildRow(rowData, getDataFunction) {
  const rowDiv = document.createElement("div");
  rowDiv.className = "daily-row";

  rowData.forEach((hour) => {
    const gridDiv = document.createElement("div");
    gridDiv.className = "daily-div";
    const content = getDataFunction(hour);
    if (content instanceof HTMLElement) {
      gridDiv.appendChild(content);
    } else {
      gridDiv.textContent = content;
    }
    rowDiv.appendChild(gridDiv);
  });
  return rowDiv;
}

function getCurrentTime(hour) {
  return hour.datetime.slice(0, 5);
}

function getCurrentTemp(hour) {
  const temp = document.createElement("span");
  temp.textContent = `${Math.round(parseFloat(hour.temp))}°C`;
  temp.classList.add("temperature");
  return temp;
}

function getIcon(hour) {
  return displayIcon(hour.icon);
}

function displayIcon(condition) {
  let icon = document.createElement("img");
  icon.className = "icon";
  switch (condition) {
    case "snow":
      icon.src = "./weather_icons/snow.png";
      break;
    case "rain":
      icon.src = "/weather_icons/rain.png";
      break;
    case "fog":
      icon.src = "./weather_icons/fog.png";
      break;
    case "wind":
      icon.src = "./weather_icons/wind.png";
      break;
    case "cloudy":
      icon.src = "/weather_icons/cloudy.png";
      break;
    case "partly-cloudy-day":
      icon.src = "./weather_icons/partly-cloudy-day.png";
      break;
    case "partly-cloudy-night":
      icon.src = "./weather_icons/partly-cloudy-night.png";
      break;
    case "clear-day":
      icon.src = "./weather_icons/clear-day.png";
      break;
    case "clear-night":
      icon.src = "./weather_icons/clear-night.png";
      break;
  }
  return icon;
}

function buildWeeklyOverviewGrid(data) {
  const container = document.querySelector(".weekly-overview");
  container.innerHTML = "";

  // Build header row
  const headerRow = document.createElement("div");
  headerRow.className = "weekly-header-row";
  ["Day", "", "Chance of rain", "Humidity", "Temperature (H/L)"].forEach(
    (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      headerRow.appendChild(div);
    }
  );
  container.appendChild(headerRow);

  // Build data rows
  data.days.slice(1, 8).forEach((day) => {
    const weeklyRow = document.createElement("div");
    weeklyRow.className = "weekly-row";

    // Day name
    weeklyRow.appendChild(createDiv(getDay(day.datetime)));

    // Icon
    const iconDiv = document.createElement("div");
    iconDiv.appendChild(displayIcon(day.icon));
    weeklyRow.appendChild(iconDiv);

    // Rain Probability
    weeklyRow.appendChild(createDiv(`${Math.round(day.precipprob)}%`));

    // Humidity
    weeklyRow.appendChild(createDiv(`${Math.round(day.humidity)}%`));

    // Max and Min Temperature
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `<span class="temperature">${Math.round(
      day.tempmax
    )}°C /</span> <span class="temperature">${Math.round(
      day.tempmin
    )}°C</span>`;
    weeklyRow.appendChild(tempDiv);

    container.appendChild(weeklyRow);
  });
}

function getDay(dateString) {
  const date = new Date(dateString);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

function createDiv(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const searchLocation = input.value;
  try {
    const data = await safeData(searchLocation);

    updateCurrentWeather(data);
    const next24Hours = getNext24Hours(data);
    buildDailyWeatherGrid(next24Hours);
    buildWeeklyOverviewGrid(data);

    form.reset();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  updateTemperatures();
}

function updateTemperatures() {
  const temperatureElements = document.querySelectorAll(".temperature");
  temperatureElements.forEach((el) => {
    let currentTemp;
    if (el.id === "current-feel") {
      // Extract the number from "Feels like: X°C/F"
      currentTemp = parseFloat(el.textContent.split(": ")[1]);
    } else {
      currentTemp = parseFloat(el.textContent);
    }

    let newTemp;
    if (isCelsius) {
      newTemp = fahrenheitToCelsius(currentTemp);
    } else {
      newTemp = celsiusToFahrenheit(currentTemp);
    }

    if (el.id === "current-feel") {
      el.textContent = `Feels like: ${Math.round(newTemp)}°${
        isCelsius ? "C" : "F"
      }`;
    } else {
      el.textContent = `${Math.round(newTemp)}°${isCelsius ? "C" : "F"}`;
    }
  });
}

toggleButton.addEventListener("click", toggleTemperatureUnit);

async function getData(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=ELWXXUDU2MYPSJF56WRYZ8SFD&contentType=json`;
  const response = await fetch(url, { mode: "cors" });

  if (!response.ok) {
    throw new Error("Cannot find this location");
  }

  const data = await response.json();
  console.log(data);
  return data;
}

function handleError(err) {
  alert(`Error: ${err.message}`);
}

function makeSafe(fn, errorHandler) {
  return function (...args) {
    return fn(...args).catch(errorHandler);
  };
}

const safeData = makeSafe(getData, handleError);

// Fetch London weather data on page load
(async function () {
  try {
    const data = await safeData("London");

    updateCurrentWeather(data); // Update the current weather section
    const next24Hours = getNext24Hours(data); // Get the next 24 hours of data
    buildDailyWeatherGrid(next24Hours); // Build the grid for the 24-hour forecast
    buildWeeklyOverviewGrid(data); // Build the weekly overview
  } catch (error) {
    console.error("Error fetching London weather data:", error);
  }
})();
