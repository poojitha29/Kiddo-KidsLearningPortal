var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    port = parseInt(process.env.PORT, 10) || 4567;

//app.get("/planets", function (req, res) {
//  res.redirect("/planet.html");
//});
//app.get("/worldmapin3D", function(req,res){
//  res.redirect("/map3d.html");
//});
//app.get("/interactiveMap", function(req,res){
//  res.redirect("/d3map.html");
//});

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

console.log("Simple static server listening at http://localhost:" + port);
app.listen(port);
