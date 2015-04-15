var express = require("express");
var server = express();
server.use("/", express.static(__dirname + "/www"));
server.listen(3003);
