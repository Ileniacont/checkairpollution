const fs = require("fs");
const setup = require("./setup");
const pollution = require("./pollution");

// If there is a setup file, check pollution, else run setup
fs.existsSync("app-setup.json") ? pollution.checkPollution() : setup.runSetup();
