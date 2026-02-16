/* global moment, Log */

class WeatherAPIProvider {
	constructor(config, delegate) {
		this.config = Object.assign({}, this.getDefaults(), config);
		this.delegate = delegate;
		this.currentWeatherAlertsObject = [];
		this.fetchedLocationName = "";
	}

	getDefaults() {
		return {
			apiBase: "https://api.weatherapi.com/v1/",
			weatherEndpoint: "forecast.json",
			lat: 0,
			lon: 0,
			apiKey: "",
			lang: "en",
			type: "alerts"
		};
	}

	/**
	 * Fetch current weather alerts from WeatherAPI.com
	 */
	fetchCurrentWeatherAlerts() {
		this.fetchData(this.getUrl())
			.then((data) => {
				const currentWeatherAlerts = this.generateWeatherAlertObjectsFromForecast(data).alerts;
				this.setFetchedLocation(`${data.location.name}, ${data.location.region}, ${data.location.country}`);
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
	fetchData(url, type = "json", requestHeaders = undefined) {
		const mockData = this.config.mockData;
		if (mockData) {
			const data = mockData.substring(1, mockData.length - 1);
			return Promise.resolve(JSON.parse(data));
		}

		return new Promise((resolve, reject) => {
			this.delegate.addFetchDataResolver(resolve, reject);
			this.delegate.sendSocketNotification("FETCH_WEATHER_ALERTS", {
				url: url,
				type: type,
				requestHeaders: requestHeaders,
				identifier: this.delegate.identifier
			});
		});
	}

	/**
	 * Build the complete API URL
	 */
	getUrl() {
		return this.config.apiBase + this.config.weatherEndpoint + this.getParams();
	}

	/**
	 * Generate URL parameters for the API request
	 */
	getParams() {
		let params = "?";
		params += "key=" + this.config.apiKey;

		// WeatherAPI.com uses lat,lon as q parameter
		params += "&q=" + this.config.lat + "," + this.config.lon;

		// Request alerts and disable AQI
		params += "&alerts=yes";
		params += "&aqi=no";

		// 1 day forecast (minimum required for alerts)
		params += "&days=1";

		// Language support
		if (this.config.lang && this.config.lang !== "en") {
			params += "&lang=" + this.config.lang;
		}

		return params;
	}

	/**
	 * Generate WeatherAlertObjects from WeatherAPI.com forecast data
	 */
	generateWeatherAlertObjectsFromForecast(data) {
		const alerts = [];

		if (data.alerts && data.alerts.alert && Array.isArray(data.alerts.alert)) {
			for (const alert of data.alerts.alert) {
				const weatherAlert = new WeatherAlertObject();

				// Map WeatherAPI.com alert fields to our WeatherAlertObject
				weatherAlert.event = alert.event || alert.headline || "Weather Alert";
				weatherAlert.description = alert.desc || alert.instruction || "";
				weatherAlert.senderName = this.extractSenderFromNote(alert.note);
				weatherAlert.start = moment(alert.effective);
				weatherAlert.end = moment(alert.expires);

				// Additional WeatherAPI.com specific fields
				weatherAlert.headline = alert.headline;
				weatherAlert.severity = alert.severity;
				weatherAlert.urgency = alert.urgency;
				weatherAlert.areas = alert.areas;
				weatherAlert.certainty = alert.certainty;
				weatherAlert.category = alert.category;
				weatherAlert.instruction = alert.instruction;

				// Parse description for structured components
				weatherAlert.parsedDescription = this.parseWeatherAlertDescription(alert);

				alerts.push(weatherAlert);
			}
		}

		return { alerts: alerts };
	}

	/**
	 * Extract sender name from note field
	 * Example: "Alert for Calhoun; Richland (South Carolina) Issued by the National Weather Service"
	 */
	extractSenderFromNote(note) {
		if (!note) return "Weather Agency";

		const issuedByMatch = note.match(/Issued by (.*)/i);
		if (issuedByMatch && issuedByMatch[1]) {
			return issuedByMatch[1].trim();
		}

		return note;
	}

	/**
	 * Parse weather alert into structured components
	 * WeatherAPI.com provides structured data, so we organize it differently than OpenWeatherMap
	 */
	parseWeatherAlertDescription(alert) {
		const parsedDescription = {
			header: alert.headline || "",
			what: alert.event || "",
			where: alert.areas || "",
			when: `${moment(alert.effective).format("LLL")} - ${moment(alert.expires).format("LLL")}`,
			impacts: "",
			additionalDetails: alert.desc || "",
			precautionaryActions: alert.instruction || "",
			severity: alert.severity || "",
			urgency: alert.urgency || "",
			certainty: alert.certainty || "",
			other: ""
		};

		// Extract IMPACTS section from description if present
		if (alert.desc) {
			const impactsMatch = alert.desc.match(/\*\s*IMPACTS[:\s]+(.*?)(?=\*|$)/is);
			if (impactsMatch && impactsMatch[1]) {
				parsedDescription.impacts = impactsMatch[1].trim();
			}
		}

		return parsedDescription;
	}

	/**
	 * Get current weather alerts
	 */
	currentWeatherAlerts() {
		return this.currentWeatherAlertsObject;
	}

	/**
	 * Get fetched location name
	 */
	fetchedLocation() {
		return this.fetchedLocationName || "";
	}

	/**
	 * Set current weather alerts
	 */
	setCurrentWeatherAlerts(currentWeatherAlertsObject) {
		this.currentWeatherAlertsObject = currentWeatherAlertsObject;
	}

	/**
	 * Set fetched location name
	 */
	setFetchedLocation(name) {
		this.fetchedLocationName = name;
	}

	/**
	 * Notify delegate that new data is available
	 */
	updateAvailable() {
		this.delegate.updateAvailable();
	}
}
