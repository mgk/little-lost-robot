var express = require("express");
var fs = require("fs");
var path = require("path");
var marked = require("marked");

var server = express();

function list(path, regex) {
	var ids = [];
	function walk(fname) {
		var stats = fs.lstatSync(fname);
		var m;
		if (stats.isDirectory()) {
			var children = fs.readdirSync(fname);
			for (var i = 0; i < children.length; ++i) {
				walk(fname + "/" + children[i]);
			}
		}
		else if (m = fname.match(regex)) {
			ids.push(m[1]);
		}
	}
	walk(path);
	return ids;
}

server.use("/mazes", function(req, res) {
	res.jsonp(list("mazes", /^mazes\/([_a-z0-9/]+)\.json$/i));
});
server.use("/robots", function(req, res) {
	res.jsonp(list("robots", /^robots\/([_a-z0-9/]+)\.js$/i));
});
server.use("/maze/:id", function(req, res) { 
	var fname = __dirname + "/mazes/" + req.params.id + ".json";
	res.jsonp(JSON.parse(fs.readFileSync(fname, "utf8")));
});
server.use("/robot/:id", function(req, res) { 
	var fname = __dirname + "/robots/" + req.params.id + ".js";
	var obj = fs.readFileSync(fname, "utf8");
	var cb = req.query.callback;
	if (cb) {
		obj = "/**/ typeof " + cb + " === 'function' && " + cb + "(" + obj + ")";
	}
	res.set("Content-Type", "text/javascript").send(obj);
});
server.use("/:path.md", function(req, res) { 
	var fname = __dirname + "/" + req.params.path + ".md";
	var md = marked(fs.readFileSync(fname, "utf8"));
    res.set("Content-Type", "text/html").send(md);
});
server.use("/", express.static(__dirname));

server.listen(3003);
