require("babel-register");
require("babel-polyfill");
global.fetch = require("node-fetch");
require("./client_mode");
