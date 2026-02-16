/* global Module, OpenWeatherMapProvider, moment */

/**
 * WeatherAlertObject class - Data model for weather alerts
 */
class WeatherAlertObject {
	constructor() {
		this.description = null;
		this.end = null;
		this.event = null;
		this.senderName = null;
		this.start = null;
		this.tags = null;
		this.colorcode = null;
		this.parsedDescription = null;
	}

	/**
	 * Clone to simple object to prevent mutating.
	 */
	simpleClone() {
		const toFlat = ["date", "sunrise", "sunset", "start", "end"];
		const clone = { ...this };
		for (const prop of toFlat) {
			clone[prop] = clone?.[prop]?.valueOf() ?? clone?.[prop];
		}
		return clone;
	}
}

Module.register("MMM-WeatherAlerts", {
  defaults: {
    provider: "weatherapi", // weatherapi or openweathermap
    roundTemp: false,
    type: "alerts", // alerts (only with OpenWeatherMap /onecall endpoint)
    units: config.units,
    tempUnits: config.units,
    windUnits: config.units,
    updateInterval: 10 * 60 * 1000, // every 10 minutes
    animationSpeed: 1000,
    timeFormat: config.timeFormat,
    showPeriod: true,
    showPeriodUpper: false,
    lang: config.language,
    initialLoadDelay: 0, // 0 seconds delay
    appendLocationNameToHeader: false,
    calendarClass: "calendar",
    tableClass: "small",
    colored: false, // currently only supports NOAA NWS alert color-coding
    maxNumberOfAlerts: 0, // set to 0 for no alert limit
    showEndTime: true,
    alertTimeFormat: "relative", // relative or absolute
    alertDateFormat: "M/DD", // only used if alertTimeFormat is 'absolute'
    showAlertDescription: true,
    staticAlertDescription: false,
    alertDescriptionScrollDelay: 85,
    alertDescription: {
      showHeader: true,
      showWhat: true,
      showWhere: true,
      showWhen: true,
      showImpacts: true,
      showAdditionalDetails: true,
      showPrecautionaryActions: true,
      showOther: true,
    },
  },

  // requiresVersion: "2.22.0", // Required version of MagicMirror

  // Module properties.
  weatherAlertProvider: null,

  // Can be used by the provider to display location of event if nothing else is specified
  firstEvent: null,

  // Queue for pending fetch requests
  fetchDataResolvers: [],

  // Define required scripts.
  getStyles: function () {
    return ["font-awesome.css", "MMM-WeatherAlerts.css"];
  },

  // Return the scripts that are necessary for the weather module.
  getScripts: function () {
    return ["moment.js", "weatherapi.js", "openweathermap.js"];
  },

  // Override getHeader method.
  getHeader: function () {
    if (this.config.appendLocationNameToHeader && this.weatherAlertProvider) {
      if (this.data.header)
        return (
          this.data.header + " " + this.weatherAlertProvider.fetchedLocation()
        );
      else return this.weatherAlertProvider.fetchedLocation();
    }
    if (this.weatherAlertProvider?.currentWeatherAlertsObject?.length) {
      return this.data.header ? this.data.header : "";
    } else {
      return "";
    }
  },

  start: function () {
    moment.locale(this.config.lang);

    if (this.config.useKmh) {
      Log.warn(
        "You are using the deprecated config values 'useKmh'. Please switch to windUnits!"
      );
      this.windUnits = "kmh";
    } else if (this.config.useBeaufort) {
      Log.warn(
        "You are using the deprecated config values 'useBeaufort'. Please switch to windUnits!"
      );
      this.windUnits = "beaufort";
    }

    // Initialize the weather provider based on config
    if (this.config.provider === "weatherapi") {
      this.weatherAlertProvider = new WeatherAPIProvider(this.config, this);
      Log.info("Weather alert provider initialized: WeatherAPI.com");
    } else if (this.config.provider === "openweathermap") {
      this.weatherAlertProvider = new OpenWeatherMapProvider(this.config, this);
      Log.info("Weather alert provider initialized: OpenWeatherMap");
    } else {
      Log.error("Unknown weather provider: " + this.config.provider + ". Using WeatherAPI.com as fallback.");
      this.weatherAlertProvider = new WeatherAPIProvider(this.config, this);
    }

    // Schedule the first update.
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  // Override notification handler.
  notificationReceived: function (notification, payload, sender) {
    if (notification === "CALENDAR_EVENTS") {
      const senderClasses = sender.data.classes.toLowerCase().split(" ");
      if (
        senderClasses.indexOf(this.config.calendarClass.toLowerCase()) !== -1
      ) {
        this.firstEvent = null;
        for (let event of payload) {
          if (event.location || event.geo) {
            this.firstEvent = event;
            Log.debug("First upcoming event with location: ", event);
            break;
          }
        }
      }
    } else if (notification === "INDOOR_TEMPERATURE") {
      this.indoorTemperature = this.roundValue(payload);
      this.updateDom(300);
    } else if (notification === "INDOOR_HUMIDITY") {
      this.indoorHumidity = this.roundValue(payload);
      this.updateDom(300);
    }
  },

  // Handle socket notifications from node_helper
  socketNotificationReceived: function (notification, payload) {
    if (notification === "WEATHER_ALERTS_DATA") {
      // Only process if this is for our module instance
      if (payload.identifier === this.identifier) {
        // Resolve the promise with the data
        if (this.fetchDataResolvers.length > 0) {
          const { resolve } = this.fetchDataResolvers.shift();

          // Parse XML if needed
          if (payload.type === "xml") {
            const parser = new DOMParser();
            const data = parser.parseFromString(payload.data, "text/xml");
            resolve(data);
          } else {
            resolve(payload.data);
          }
        }
      }
    } else if (notification === "FETCH_ERROR") {
      // Only process if this is for our module instance
      if (payload.identifier === this.identifier) {
        Log.error("Error fetching weather alerts:", payload.error);
        // Reject the promise with the error
        if (this.fetchDataResolvers.length > 0) {
          const { reject } = this.fetchDataResolvers.shift();
          reject(new Error(payload.error));
        }
      }
    }
  },

  // Add a resolver for a pending fetch request
  addFetchDataResolver: function (resolve, reject) {
    this.fetchDataResolvers.push({ resolve, reject });
  },

  // Build the DOM for weather alerts
  getDom: function () {
    const wrapper = document.createElement("div");
    const alerts = this.weatherAlertProvider?.currentWeatherAlerts();

    if (!alerts || alerts.length === 0) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    // Determine number of alerts to show
    const numAlerts = this.config.maxNumberOfAlerts
      ? Math.min(alerts.length, this.config.maxNumberOfAlerts)
      : alerts.length;

    const alertsToShow = alerts.slice(0, numAlerts);

    // Create table
    const table = document.createElement("table");
    table.className = `${this.config.tableClass} alert-table`;

    alertsToShow.forEach((alert) => {
      // Alert event row
      const eventRow = document.createElement("tr");
      eventRow.className = this.config.colored ? "colored" : "bright";

      const eventCell = document.createElement("td");
      eventCell.className = `align-left ${this.getAlertColorCode(alert.event)}`;
      eventCell.innerHTML = `<span>${alert.event}</span>`;
      eventRow.appendChild(eventCell);

      // End time cell
      if (this.config.showEndTime) {
        const timeCell = document.createElement("td");
        timeCell.className = "bright light align-right";

        if (this.config.alertTimeFormat === "relative") {
          timeCell.textContent = this.translate("ends") + " " + alert.end.fromNow();
        } else {
          timeCell.textContent = this.translate("until") + " " +
            alert.end.format(this.config.alertDateFormat) + " " +
            this.translate("at") + " " + this.formatTime(alert.end);
        }

        eventRow.appendChild(timeCell);
      }

      table.appendChild(eventRow);

      // Description row
      if (this.config.showAlertDescription) {
        const descRow = document.createElement("tr");
        const descCell = document.createElement("td");
        descCell.colSpan = 2;

        if (this.config.staticAlertDescription) {
          descCell.className = "static-description";
          descCell.innerHTML = `<span>${alert.description}</span>`;
        } else {
          const marquee = document.createElement("marquee");
          marquee.setAttribute("scrolldelay", this.config.alertDescriptionScrollDelay);
          marquee.innerHTML = `<span>${alert.description}</span>`;
          descCell.appendChild(marquee);
        }

        descRow.appendChild(descCell);
        table.appendChild(descRow);
      }
    });

    wrapper.appendChild(table);
    return wrapper;
  },

  // What to do when the weather alert provider has new information available?
  updateAvailable: function () {
    const alerts = this.weatherAlertProvider.currentWeatherAlerts();
    Log.log(`New weather alert information available. Found ${alerts?.length || 0} alert(s).`);

    if (alerts && alerts.length > 0) {
      Log.log("Alert details:", alerts.map(a => ({ event: a.event, start: a.start, end: a.end })));
    } else {
      Log.log("No active alerts for this location. Module will remain hidden.");
    }

    this.updateDom(0);
    this.scheduleUpdate();

    // if (this.weatherAlertProvider.currentWeather()) {
    // 	this.sendNotification("CURRENTWEATHER_TYPE", { type: this.weatherAlertProvider.currentWeather().weatherType.replace("-", "_") });
    // }

    const notificationPayload = {
      currentWeatherAlerts:
        this.weatherAlertProvider?.currentWeatherAlertsObject?.map((ar) =>
          ar.simpleClone()
        ) ?? [],
      locationName: this.weatherAlertProvider?.fetchedLocationName,
      providerName: this.weatherAlertProvider.providerName,
    };

    //need to add alerts to the notification payload...
    this.sendNotification("WEATHER_ALERTS_UPDATED", notificationPayload);
  },

  scheduleUpdate: function (delay = null) {
    let nextLoad = this.config.updateInterval;
    if (delay !== null && delay >= 0) {
      nextLoad = delay;
    }

    setTimeout(() => {
      switch (this.config.type.toLowerCase()) {
        case "alerts":
          this.weatherAlertProvider.fetchCurrentWeatherAlerts();
          break;

        default:
          // Log.error(`Invalid type ${this.config.type} configured (must be one of 'current', 'hourly', 'daily' or 'forecast')`);
          Log.error(
            `Invalid type ${this.config.type} configured (must be one of 'alerts')`
          );
      }
    }, nextLoad);
  },

  roundValue: function (temperature) {
    const decimals = this.config.roundTemp ? 0 : 1;
    const roundValue = parseFloat(temperature).toFixed(decimals);
    return roundValue === "-0" ? 0 : roundValue;
  },

  // Format time based on config
  formatTime: function (date) {
    if (this.config.timeFormat !== 24) {
      if (this.config.showPeriod) {
        if (this.config.showPeriodUpper) {
          return date.format("h:mm A");
        } else {
          return date.format("h:mm a");
        }
      } else {
        return date.format("h:mm");
      }
    }
    return date.format("HH:mm");
  },

  // Generate CSS class name from alert event
  getAlertColorCode: function (value) {
    if (!value[0].match(/[a-z]/i)) {
      // add a leading '_' if the event does not start with a letter
      return "_" + value.toLowerCase().replaceAll(" ", "-");
    } else {
      return value.toLowerCase().replaceAll(" ", "-");
    }
  },
});
