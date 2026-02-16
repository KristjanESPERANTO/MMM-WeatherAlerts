/* global Class */

const WeatherAlertProvider = Class.extend({
  // Weather Provider Properties
  providerName: null,
  defaults: {},

  /*
   * The following properties have accessor methods.
   * Try to not access them directly.
   */
  currentWeatherObject: null,
  weatherForecastArray: null,
  weatherHourlyArray: null,
  fetchedLocationName: null,

  /*
   * The following properties will be set automatically.
   * You do not need to overwrite these properties.
   */
  config: null,
  delegate: null,
  providerIdentifier: null,

  /*
   * Weather Provider Methods
   * All the following methods can be overwritten, although most are good as they are.
   */

  // Called when a weather provider is initialized.
  init (config) {
    this.config = config;
    Log.info(`Weather alert provider: ${this.providerName} initialized.`);
  },

  // Called to set the config, this config is the same as the weather module's config.
  setConfig (config) {
    this.config = config;
    Log.info(
      `Weather alert provider: ${this.providerName} config set.`,
      this.config
    );
  },

  // Called when the weather provider is about to start.
  start () {
    Log.info(`Weather alert provider: ${this.providerName} started.`);
  },

  /*
   * This method should start the API request to fetch the current weather.
   * This method should definitely be overwritten in the provider.
   */
  fetchCurrentWeatherAlerts () {
    Log.warn(`Weather alert provider: ${this.providerName} does not subclass the fetchCurrentWeatherAlerts method.`);
  },

  // This returns a WeatherAlerts object for the current weather alerts.
  currentWeatherAlerts () {
    return this.currentWeatherAlertsObject;
  },

  // This returns the name of the fetched location or an empty string.
  fetchedLocation () {
    return this.fetchedLocationName || "";
  },

  // Set the currentWeatherAlerts and notify the delegate that new information is available.
  setCurrentWeatherAlerts (currentWeatherAlertsObject) {
    // We should check here if we are passing a WeatherAlert
    this.currentWeatherAlertsObject = currentWeatherAlertsObject;
  },

  // Set the fetched location name.
  setFetchedLocation (name) {
    this.fetchedLocationName = name;
  },

  // Notify the delegate that new weather is available.
  updateAvailable () {
    this.delegate.updateAvailable(this);
  },

  /**
   * A convenience function to make requests via the node_helper.
   *
   * @param {string} url the url to fetch from
   * @param {string} type what contenttype to expect in the response, can be "json" or "xml"
   * @param {Array.<{name: string, value:string}>} requestHeaders the HTTP headers to send
   * @param {Array.<string>} expectedResponseHeaders the expected HTTP headers to recieve
   * @returns {Promise} resolved when the fetch is done
   */
  fetchData (
    url,
    type = "json",
    requestHeaders = undefined,
    expectedResponseHeaders = undefined
  ) {
    const {mockData} = this.config;
    if (mockData) {
      const data = mockData.substring(1, mockData.length - 1);
      return Promise.resolve(JSON.parse(data));
    }

    // Create a promise that will be resolved when data comes back from node_helper
    return new Promise((resolve, reject) => {
      // Store the resolver functions so they can be called when data arrives
      this.delegate.addFetchDataResolver(resolve, reject);

      // Send request to node_helper
      this.delegate.sendSocketNotification("FETCH_WEATHER_ALERTS", {
        url,
        type,
        requestHeaders,
        identifier: this.delegate.identifier
      });
    });
  }
});

/**
 * Collection of registered weather providers.
 */
WeatherAlertProvider.providers = [];

/**
 * Static method to register a new weather provider.
 *
 * @param {string} providerIdentifier The name of the weather provider
 * @param {object} providerDetails The details of the weather provider
 */
WeatherAlertProvider.register = function register (
  providerIdentifier,
  providerDetails
) {
  WeatherAlertProvider.providers[providerIdentifier.toLowerCase()] =
    WeatherAlertProvider.extend(providerDetails);
};

/**
 * Static method to initialize a new weather provider.
 *
 * @param {string} providerIdentifier The name of the weather provider
 * @param {object} delegate The weather module
 * @returns {object} The new weather provider
 */
WeatherAlertProvider.initialize = function initialize (
  providerIdentifier,
  delegate
) {
  const normalizedIdentifier = providerIdentifier.toLowerCase();

  const provider = new WeatherAlertProvider.providers[normalizedIdentifier]();
  const config = {...provider.defaults, ...delegate.config};

  provider.delegate = delegate;
  provider.setConfig(config);

  provider.providerIdentifier = providerIdentifier;
  if (!provider.providerName) {
    provider.providerName = providerIdentifier;
  }

  return provider;
};
