// Function that takes a location, gets data from the server, and returns JSON
async function getData(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=ELWXXUDU2MYPSJF56WRYZ8SFD&contentType=json`;
  const response = await fetch(url, { mode: "cors" });

  // Check if the response was successful
  if (!response.ok) {
    throw new Error("Cannot find this location"); // Error "thrown" to .catch()
  }

  // Convert the response to JSON and log it
  const data = await response.json();
  console.log(data);
  return data;
}

// Function to print an error message
function handleError(err) {
  console.log(`Error: ${err.message}`);
}

// Higher-order function that returns a function wrapped with error handling
function makeSafe(fn, errorHandler) {
  return function (...args) {
    return fn(...args).catch(errorHandler);
  };
}

// Create a safe version of getData
const safeData = makeSafe(getData, handleError);

// Call the safeData function with a location argument
safeData("ndon");
