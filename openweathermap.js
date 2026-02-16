/* eslint-disable-next-line no-unused-vars */
class OpenWeatherMapProvider {
  constructor (config, delegate) {
    this.config = {...this.getDefaults(), ...config};
    this.delegate = delegate;
    this.currentWeatherAlertsObject = [];
    this.fetchedLocationName = "";
  }

  getDefaults () {
    return {
      apiVersion: "3.0",
      apiBase: "https://api.openweathermap.org/data/",
      weatherEndpoint: "/onecall",
      lat: 0,
      lon: 0,
      apiKey: "",
      lang: "en",
      type: "alerts"
    };
  }

  /**
   * Fetch current weather alerts from OpenWeatherMap
   */
  fetchCurrentWeatherAlerts () {
    this.fetchData(this.getUrl())
      .then((data) => {
        let currentWeatherAlerts;
        if (this.config.weatherEndpoint === "/onecall") {
          currentWeatherAlerts =
            this.generateWeatherAlertObjectsFromOnecall(data).alerts;
          this.setFetchedLocation(`${data.timezone}`);
        } else {
          Log.info(`Alerts can only be fetched from /onecall endpoint, found endpoint ${this.config.weatherEndpoint}`);
        }
        this.setCurrentWeatherAlerts(currentWeatherAlerts);
      })
      .catch((error) => {
        Log.error("Could not load data ... ", error);
      })
      .finally(() => this.updateAvailable());
  }

  /**
   * Fetch data via node_helper
   */
  fetchData (url, requestHeaders, type = "json") {
    const {mockData} = this.config;
    if (mockData) {
      const data = mockData.substring(1, mockData.length - 1);
      return Promise.resolve(JSON.parse(data));
    }

    return new Promise((resolve, reject) => {
      this.delegate.addFetchDataResolver(resolve, reject);
      this.delegate.sendSocketNotification("FETCH_WEATHER_ALERTS", {
        url,
        requestHeaders,
        type,
        identifier: this.delegate.identifier
      });
    });
  }

  /**
   * Build the complete API URL
   */
  getUrl () {
    return (
      this.config.apiBase +
      this.config.apiVersion +
      this.config.weatherEndpoint +
      this.getParams()
    );
  }

  /**
   * Generate URL parameters for the API request
   */
  getParams () {
    let params = "?";
    if (this.config.weatherEndpoint === "/onecall") {
      params += `lat=${this.config.lat}`;
      params += `&lon=${this.config.lon}`;
      params += "&exclude=minutely";
    } else if (this.config.lat && this.config.lon) {
      params += `lat=${this.config.lat}&lon=${this.config.lon}`;
    } else if (this.config.locationID) {
      params += `id=${this.config.locationID}`;
    } else if (this.config.location) {
      params += `q=${this.config.location}`;
    } else if (this.delegate.firstEvent && this.delegate.firstEvent.geo) {
      params += `lat=${this.delegate.firstEvent.geo.lat}&lon=${this.delegate.firstEvent.geo.lon}`;
    } else if (this.delegate.firstEvent && this.delegate.firstEvent.location) {
      params += `q=${this.delegate.firstEvent.location}`;
    } else {
      this.delegate.hide(this.config.animationSpeed, {
        lockString: this.delegate.identifier
      });
      return "";
    }

    params += "&units=metric";
    params += `&lang=${this.config.lang}`;
    params += `&APPID=${this.config.apiKey}`;

    return params;
  }

  /**
   * Generate WeatherAlertObjects from OnCall API data
   */
  generateWeatherAlertObjectsFromOnecall (data) {
    if (this.config.weatherEndpoint === "/onecall") {
      return this.fetchOnecall(data);
    }
    Log.info("must use onecall API");
    return {alerts: []};
  }

  /**
   * Parse OnCall forecast information
   */
  fetchOnecall (data) {
    const alerts = [];
    if (Object.hasOwn(data, "alerts")) {
      for (const alert of data.alerts) {
        const weatherAlert = new WeatherAlertObject();
        weatherAlert.description = alert.description;
        weatherAlert.end = moment
          .unix(alert.end)
          .utcOffset(data.timezone_offset / 60);
        weatherAlert.event = alert.event;
        weatherAlert.parsedDescription = this.parseWeatherAlertDescription(alert.description);
        weatherAlert.senderName = alert.sender_name;
        weatherAlert.start = moment
          .unix(alert.start)
          .utcOffset(data.timezone_offset / 60);
        weatherAlert.tags = alert.tags;

        alerts.push(weatherAlert);
      }
    }

    return {alerts};
  }

  /**
   * Parse weather alert description into structured components
   */
  parseWeatherAlertDescription (description) {
    const parsedDescription = {
      header: "",
      changes: "",
      what: "",
      where: "",
      when: "",
      impacts: "",
      additionalDetails: "",
      precautionaryActions: "",
      other: ""
    };

    for (const section of description.split("*")) {
      switch (section.split("...")[0]) {
        case "":
          parsedDescription.header += section;
          break;
        case " CHANGES":
          parsedDescription.changes += section;
          break;
        case " WHAT":
          parsedDescription.what += section;
          break;
        case " WHERE":
          parsedDescription.where += section;
          break;
        case " WHEN":
          parsedDescription.when += section;
          break;
        case " IMPACTS":
          parsedDescription.impacts += section;
          break;
        case " ADDITIONAL DETAILS":
          parsedDescription.additionalDetails += section;
          break;
        case " PRECAUTIONARY / PREPAREDNESS ACTIONS":
          parsedDescription.precautionaryActions += section;
          break;
        default:
          if (section === description.split("*")[0]) {
            parsedDescription.header += section;
          } else {
            parsedDescription.other += section;
          }
      }
    }

    return parsedDescription;
  }

  /**
   * Get current weather alerts
   */
  currentWeatherAlerts () {
    return this.currentWeatherAlertsObject;
  }

  /**
   * Get fetched location name
   */
  fetchedLocation () {
    return this.fetchedLocationName || "";
  }

  /**
   * Set current weather alerts
   */
  setCurrentWeatherAlerts (currentWeatherAlertsObject) {
    this.currentWeatherAlertsObject = currentWeatherAlertsObject;
  }

  /**
   * Set fetched location name
   */
  setFetchedLocation (name) {
    this.fetchedLocationName = name;
  }

  /**
   * Notify delegate that new data is available
   */
  updateAvailable () {
    this.delegate.updateAvailable();
  }
}
