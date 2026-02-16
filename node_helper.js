const NodeHelper = require("node_helper");
const Log = require("logger");
const HTTPFetcher = require("../../js/http_fetcher");

module.exports = NodeHelper.create({
  fetchers: {},

  start () {
    Log.info(`Starting node helper for: ${this.name}`);
  },

  /**
   * socketNotificationReceived
   * Handle socket notifications from the module frontend
   */
  socketNotificationReceived (notification, payload) {
    if (notification === "FETCH_WEATHER_ALERTS") {
      this.fetchWeatherAlerts(payload);
    } else if (notification === "STOP_FETCHER") {
      this.stopFetcher(payload.identifier);
    }
  },

  /**
   * Fetch weather alerts data from API using HTTPFetcher
   * @param {object} config - Configuration object containing url, identifier, etc.
   */
  fetchWeatherAlerts (config) {
    const {url, identifier, type, requestHeaders} = config;

    // Stop existing fetcher for this identifier if any
    if (this.fetchers[identifier]) {
      this.fetchers[identifier].clearTimer();
    }

    const options = {
      reloadInterval: 0, // We handle the interval in the frontend
      logContext: "MMM-WeatherAlerts"
    };

    if (requestHeaders) {
      options.headers = {};
      requestHeaders.forEach((header) => {
        options.headers[header.name] = header.value;
      });
    }

    const fetcher = new HTTPFetcher(url, options);

    fetcher.on("response", async (response) => {
      try {
        let data;
        if (type === "xml") {
          data = await response.text();
        } else {
          data = await response.json();
        }

        // Send data back to frontend
        this.sendSocketNotification("WEATHER_ALERTS_DATA", {
          identifier,
          data,
          type
        });
      } catch (error) {
        Log.error(`Error parsing response: ${error.message}`);
        this.sendSocketNotification("FETCH_ERROR", {
          identifier,
          error: error.message
        });
      }
    });

    fetcher.on("error", (errorInfo) => {
      Log.error(`Error fetching weather alerts: ${errorInfo.message}`);
      this.sendSocketNotification("FETCH_ERROR", {
        identifier,
        error: errorInfo.message,
        translationKey: errorInfo.translationKey
      });
    });

    this.fetchers[identifier] = fetcher;

    // Start a single fetch (not periodic)
    fetcher.startPeriodicFetch();
  },

  stopFetcher (identifier) {
    if (this.fetchers[identifier]) {
      this.fetchers[identifier].clearTimer();
      delete this.fetchers[identifier];
    }
  }
});
