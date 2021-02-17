const fs = require("fs");
const fetch = require("node-fetch");
const inquirer = require("inquirer");
const APItoken = "15eb11ca03254a04af057045bba814e4";

const saveLocation = location =>
	fs.writeFileSync("app-setup.json", JSON.stringify({ location }));
const getNearestStations = (lat, lng) => {
	let radius = 0.5;
	return fetch(
		`https://airapi.airly.eu/v1/sensors/current?southwestLat=${lat -
			radius}&southwestLong=${lng - radius}&northeastLat=${lat +
			radius}&northeastLong=${lng + radius}`,
		{
			headers: {
				Accept: "application/json",
				apikey: APItoken
			}
		}
	)
		.then(response => response.json())
		.then(response =>
			response.map(
				station =>
					`${station.address.route}, ${station.address.locality}, ${
						station.address.country
					}, Station ID: ${station.id}`
			)
		)
		.catch(err => console.log(err));
};

const runSetup = () => {
	const locationFromIp = "http://freegeoip.net/json/";
	fetch(locationFromIp)
		.then(response => response.json())
		.then(response => {
			const airPollutionUrl = `https://airapi.airly.eu/v1/nearestSensor/measurements?latitude=${
				response.latitude
			}&longitude=${response.longitude}&maxDistance=10000`;
			return fetch(airPollutionUrl, {
				headers: {
					Accept: "application/json",
					apikey: APItoken
				}
			});
		})
		.then(response => response.json())
		.then(response => {
			inquirer
				.prompt([
					{
						name: "isLocationValid",
						type: "list",
						message: `Is ${response.address.route}, ${
							response.address.locality
						}, ${response.address.country} near your location?`,
						choices: ["Yes", "No"],
						default: "No"
					}
				])
				.then(answers => {
					if (answers.isLocationValid === "Yes")
						saveLocation(
							`${response.address.route}, ${response.address.locality}, ${
								response.address.country
							}, Station ID: ${response.id}`
						);
					else if (answers.isLocationValid === "No") {
						const stations = getNearestStations(
							response.location.latitude,
							response.location.longitude
						).then(stations => {
							inquirer
								.prompt([
									{
										name: "station",
										type: "list",
										message: `Which station is near your location?`,
										choices: stations
									}
								])
								.then(answers => saveLocation(answers.station));
						});
					}
				});
		})
		.catch(err => console.log(err));
};

module.exports = {
	saveLocation,
	getNearestStations,
	runSetup
};
