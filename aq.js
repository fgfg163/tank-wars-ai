require("babel-register");
require("babel-polyfill");
global.fetch = require("node-fetch");
require("./aq_client_mode");
