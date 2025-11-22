 // Name: Faith Newbold
 // Description: Creating a hunting log
 
 //   Function to get Location. Returns a promise that resolves into {lat, long}
      function getLocation() {
        // Create a new promise
        let locationPromise = new Promise((resolve, reject) => {
          // Access the current position of the user:
          navigator.geolocation.getCurrentPosition((pos) => {
            // Grab the lat and long
            let long = pos.coords.longitude;
            let lat = pos.coords.latitude;
            // If you can get those values: resolve with an object or reject if not
            resolve({ lat, long });
          }, reject);
        });
        //   return the promise
        return locationPromise;
      }


// Write your code here:

// call loadLogs() once the page loads so previously saved logs are shown automatically
$(document).ready(function() {
  loadLogs();

  // use jquery to create a submit event for the form
  // on form submit event, call event.preventDefault
  $("#tripForm").on("submit", async function (event) {
    event.preventDefault();

    // create FormData instance from the form and extract date and notes
    const formData = new FormData(event.target);
    const date = formData.get("tripDate");
    const notes = formData.get("notes");

    // call get location to obtain lat and long
    try{
      const {lat, long} = await getLocation();

      // build API URL
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=sunrise,sunset&current=temperature_2m&timezone=auto&forecast_days=1&temperature_unit=fahrenheit`

      // fetch weather using axios
      const weather = await axios.get(url);
      const data = weather.data;

      const sunriseTime = data.daily.sunrise[0];
      const sunsetTime = data.daily.sunset[0];
      const temperature = data.current?.temperature_2m ?? data.current_weather?.temperature ?? null;

      // construct a logEntry object
      const entry = {
        latitude: lat,
        longitude: long,
        date,
        sunriseTime,
        sunsetTime,
        notes,
        temperature
      };

      // save the entry to local storage under the key huntingLogs
      // if it exists, JSON.parse(), push new entry, JSON.stringify, and save
      // if it doesn't exist, create a new arrat containing the entry and save it
      const existing = JSON.parse(localStorage.getItem("hunting logs")) || [];
      existing.push(entry);
      localStorage.setItem("huntingLogs", JSON.stringify(existing));

      // call loadLogs to refresh the UI
      loadLogs();

      event.target.reset();
    } catch (err) {
      console.log(err);
      alert("Could not save log.");
    };
  })
})

    // TODO 2 - loadLogs()

    // read huntingLogs value from local storage
    function loadLogs() {
      const container = $("#logContainer");
      // if it exists, parse it into an array
      const logs = JSON.parse(localStorage.getItem("huntingLogs")) || [];

      container.empty();

      // if the array is empty, render a friendly "no logs" message
      if (logs.length === 0) {
        container.html("<p>No logs saved yet.</p>");
        return;
      };

      // iterate over the array and build HTML for each log item
      let html = "";

      logs.forEach((log, index) => {
        html += `
          <div class="log-item">
            <h3>Log #${index + 1} - ${log.date}</h3>
            <p><strong>Latitude:</strong> ${log.latitude}</p>
            <p><strong>Longitude:</strong> ${log.longitude}</p>
            <p><strong>Sunrise:</strong> ${log.sunriseTime}</p>
            <p><strong>Sunset:</strong> ${log.sunsetTime}</p>
            <p><strong>Temperature:</strong> ${log.temperature}</p>
            <p><strong>Notes:</strong> ${log.notes}</p>
            <hr>
          </div>
        `;
      });

      // use jquery to set the container's html
      container.html(html);
    };
