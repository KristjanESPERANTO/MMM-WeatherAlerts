# MMM-WeatherAlerts

This is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror).

Displays active weather alerts as provided by weather APIs. Module will not be visible when no alerts are active.

## Supported Weather Providers

### WeatherAPI.com ⭐ (Recommended)
- **Coverage:** Worldwide
- **Cost:** FREE (up to 1,000,000 calls/month)
- **API Key:** [Get free API key](https://www.weatherapi.com/signup.aspx)
- **Alerts:** Government weather alerts from USA, UK, Europe and worldwide
- **Status:** ✅ **Fully tested and working**

### OpenWeatherMap (Legacy)
- **Coverage:** Worldwide
- **Cost:** PAID subscription required for One Call API 3.0
- **API Key:** [Get API key](https://home.openweathermap.org/)
- **Note:** Requires [One Call API 3.0 subscription](https://openweathermap.org/api/one-call-3) with alerts enabled (paid)
- **Status:** ⚠️ **Untested** - Requires paid subscription tier that includes weather alerts.

## Example

![Example image 1](/images/MMM-WeatherAlerts-default_example.png)

![Example image 2](/images/MMM-WeatherAlerts-example2.gif)

## Installation

### Requirements

- MagicMirror² instance
- Weather API key:
  - **WeatherAPI.com** (recommended): [Free signup](https://www.weatherapi.com/signup.aspx) - 1M calls/month free
  - **OpenWeatherMap**: [Get API key](https://home.openweathermap.org/) - Requires paid One Call API 3.0 subscription

### Install Module

To install this module via CLI, navigate into `~/MagicMirror/modules` and type the following commands:

```bash
git clone https://github.com/gjonesme/MMM-WeatherAlerts
```

## Update

```bash
cd ~/MagicMirror/modules/MMM-WeatherAlerts
```

## Configuration

To use this module, add it to the modules array in the config/config.js file:

### WeatherAPI.com (Recommended)

```js
  {
    module: "MMM-WeatherAlerts",
    position: "top_right",
    header: "Weather Alerts",
    config: {
      provider: "weatherapi",  // Use WeatherAPI.com
      lat: 52.52,              // Your latitude
      lon: 13.41,              // Your longitude
      apiKey: "YOUR_API_KEY"  // Get free key from weatherapi.com
    },
  },
```

### OpenWeatherMap (Alternative)

```js
  {
    module: "MMM-WeatherAlerts",
    position: "top_right",
    header: "Weather Alerts",
    config: {
      provider: "openweathermap",  // Use OpenWeatherMap
      lat: 52.52,                   // Your latitude
      lon: 13.41,                   // Your longitude
      apiKey: "YOUR_API_KEY"       // Requires paid subscription
    },
  },
```

### Configuration Options


The following properties can be configured:

<table width="75%">
	<!-- limted by github markup... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="66%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>provider</code></td>
			<td>Which weather API provider to use.<br>
				<br><b>Possible values:</b> <code>'weatherapi'</code> or <code>'openweathermap'</code>
				<br><b>Default value:</b> <code>'weatherapi'</code>
				<br>
				<br><b>Note:</b> WeatherAPI.com is recommended (free, worldwide, 1M calls/month). OpenWeatherMap requires paid subscription.
			</td>
		</tr>
		<tr>
			<td><code>weatherEndpoint</code></td>
			<td>The OpenWeatherMap API endPoint (only used when provider is 'openweathermap').<br>
				<br><b>Possible values:</b> <code>'/onecall'</code>
				<br><b>Default value:</b> <code>'/onecall'</code>
				<br>
				<br><b>Note:</b> Must be set to <code>'/onecall'</code> in order to access alert info.
			</td>
		</tr>
		<tr>
			<td><code>type</code></td>
			<td>Which type of weather data should be displayed.<br>
				<br><b>Possible values:</b> <code>'alerts'</code>
				<br><b>Default value:</b> <code>'alerts'</code>
			</td>
		</tr>
		<tr>
			<td><code>lat</code></td>
			<td>Latitude of the location used for weather information.<br>
				<br><b>Example:</b> <code>"38.9332"</code>
				<br><b>Default value:</b> <code>0</code>
				<br>
				<br>Note: Latitude and longitude are REQUIRED since weatherEndpoint is set to '/onecall'.
			</td>
		</tr>
		<tr>
			<td><code>lon</code></td>
			<td>Longitude of the location used for weather information.<br>
				<br><b>Example:</b> <code>"-119.9844"</code>
				<br><b>Default value:</b> <code>0</code>
				<br>
				<br>Note: Latitude and longitude are REQUIRED since weatherEndpoint is set to '/onecall'.
			</td>
		</tr>
		<tr>
			<td><code>apiKey</code></td>
			<td>Your weather API key.<br>
				<br><b>WeatherAPI.com:</b> Free signup at <a href="https://www.weatherapi.com/signup.aspx">weatherapi.com</a> (1M calls/month free)
				<br><b>OpenWeatherMap:</b> Requires paid <a href="https://openweathermap.org/api/one-call-3">One Call API 3.0 subscription</a>
				<br>
				<br>This value is <b>REQUIRED</b>
			</td>
		</tr>
		<tr>
			<td><code>updateInterval</code></td>
			<td>How often does the content need to be fetched? (milliseconds)<br>
				<br><b>Possible values:</b> <code>1000</code> - <code>86400000</code>
				<br><b>Default value:</b> <code>600000</code> (10 minutes)
			</td>
		</tr>
    		<tr>
			<td><code>animationSpeed</code></td>
			<td>Speed of update animation. (milliseconds)<br>
				<br><b>Possible values:</b> <code>0</code> - <code>5000</code>
				<br><b>Default value:</b> <code>1000</code> (1 second)
			</td>
		</tr>
    		<tr>
			<td><code>timeFormat</code></td>
			<td>Use 12 or 24 hour format.<br>
				<br><b>Possible values:</b> <code>12</code> or <code>24</code>
				<br><b>Default value:</b> uses value of config.timeFormat
			</td>
		</tr>
    		<tr>
			<td><code>showPeriod</code></td>
			<td>Show the period (am/pm) with 12 hour format.<br>
				<br><b>Possible values:</b> <code>true</code> or <code>false</code>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>
    		<tr>
			<td><code>showPeriodUpper</code></td>
			<td>Show the period (am/pm) with 12 hour format as uppercase.<br>
				<br><b>Possible values:</b> <code>true</code> or <code>false</code>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>
    		<tr>
			<td><code>lang</code></td>
			<td>The language of the days if using moment.js formatting that displays day name.
				<br>
				<br><b>Possible values:</b> <code>en</code>, <code>es</code>, etc...
				<br><b>Default value:</b> uses value of config.language
			</td>
		</tr>
    		<tr>
			<td><code>initialLoadDelay</code></td>
			<td>The initial delay before loading. If you have multiple modules that use the same API key, you might want to delay one of the requests. (Milliseconds)<br>
				<br><b>Possible values:</b> <code>1000</code>-<code>5000</code>
				<br><b>Default value:</b> <code>0</code>
			</td>
		</tr>
    		<tr>
			<td><code>appendLocationNameToHeader</code></td>
			<td>If set to <code>true</code>, the returned location name will be appended to the header of the module, if the header is enabled. This is mainly interesting when using calender based weather.<br>
				<br><b>Possible values:</b> <code>true</code> or <code>false</code>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>
    		<tr>
			<td><code>calendarClass</code></td>
			<td>The class for the calender module to base the event based weather information on.<br>
				<br><b>Default value:</b> <code>calendar</code>
			</td>
		</tr>
    		<tr>
			<td><code>tableClass</code></td>
			<td>The class for the weather alerts table.<br>
				<br><b>Possible values:</b> <code>xsmall</code>, <code>small</code>, <code>medium</code>, <code>large</code>, <code>xlarge</code>
				<br><b>Default value:</b> <code>small</code>
			</td>
		</tr>
    		<tr>
			<td><code>colored</code></td>
      			<td>If set to <code>true</code>, the alert "event" will be color coded.<br>
				<br><b>Possible values:</b> <code>true</code> or <code>false</code>
				<br><b>Default value:</b> <code>false</code>
        			<br><b>Note:</b> color coded events are currently only implemented for <a href="https://www.weather.gov/bro/mapcolors">NOAA NWS alerts</a>.
			</td>
		</tr>
		<tr>
			<td><code>maxNumberOfAlerts</code></td>
			<td>Sets a maximum number of alerts that can be displayed.
				<br><b>Possible values:</b> <code>0</code> - <code>10</code>
				<br><b>Default value:</b> <code>0</code>
        			<br><b>Note:</b> <code>0</code> means unlimited alerts may be shown.
			</td>
		</tr>
    		<tr>
			<td><code>showEndTime</code></td>
      			<td>If set to <code>true</code>, the scheduled alert end time will be displayed.<br>
				<br><b>Possible values:</b> <code>true</code> or <code>false</code>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>
    		<tr>
			<td><code>alertTimeFormat</code></td>
      			<td>If set to <code>relative</code>, displays the alert's scheduled end-time using moment.js <code>.fromNow()</code> function.<br>
				<br><b>Possible values:</b> <code>relative</code> or <code>absolute</code>
				<br><b>Default value:</b> <code>relative</code>
			</td>
		</tr>
    		<tr>
			<td><code>alertDateFormat</code></td>
			<td>Defines how alert scheduled end-time will be displayed when timeFormat is set to absolute.<br>
        			<br><b>Possible values: See <a href="https://momentjs.com/docs/#/displaying/">moment.js format documentation</a>.
				<br><b>Default value:</b> <code>"M/DD"</code>
			</td>
		</tr>
    		<tr>
			<td><code>showAlertDescription</code></td>
      			<td>If set to <code>false</code>, alert description will be hidden<br>
				<br><b>Possible values:</b> <code>true</code> or <code>false</code>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>
   		<tr>
			<td><code>staticAlertDescription</code></td>
      			<td>If set to <code>true</code> alert description will be shown as block of text; if set to <code>false</code> alert description will be a single line ticker/marquee;<br>
				<br><b>Possible values:</b> <code>true</code> or <code>false</code>
				<br><b>Default value:</b> <code>false</code>
			</td>
	    	</tr>
		<tr>
			<td><code>alertDescriptionScrollDelay</code></td>
      			<td>Sets text scroll delay (in milliseconds) of alert decription ticker/marquee when <code>staticAlertDescription</code> is set to <code>false</code>.<br>
				<br><b>Possible values:</b> Minimum of <code>60</code>
				<br><b>Default value:</b> <code>85</code>
        			<br><b>Note:</b> The lower the value, the faster the alert description text will move.
			</td>
		</tr>

  </tbody>
</table>

## Other Notes and Considerations

This module is set to only display when a weather alert is active/available from the weather API. If no alerts are active, then the module will not be visible.

If your location does not currently have an active weather alert, then you can test the module by changing your lat/lon to a location with an active alert:
- **USA:** The U.S. pretty much always has some [active alerts](https://alerts.weather.gov/cap/us.php?x=1)
- **Europe/UK:** Check your local weather service for active warnings
- **Worldwide:** WeatherAPI.com provides government-issued alerts globally

### Testing Without Active Alerts

If you want to verify the module is working but your location has no alerts:
1. Change `lat`/`lon` to a location with active alerts (e.g., Florida in hurricane season)
2. Check the browser console for "Found X alert(s)" messages
3. Verify API calls are successful (no errors in logs)

### Provider Comparison

- **Use WeatherAPI.com** if you want: Free worldwide coverage, easy setup, no payment required
- **Use OpenWeatherMap** if you already have: A paid One Call API 3.0 subscription with alerts enabled

**Note:** OpenWeatherMap support is legacy/untested in current version due to paid subscription requirement. We recommend using WeatherAPI.com.


