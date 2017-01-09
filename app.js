var express = require('express')
  , http = require('http')
  , bodyParser = require('body-parser')
  , DataStore = require('nedb')
    //gestion des uploads
  , fs = require('fs')
    //gestion de l'authentification par jeton
  , jwt = require('jwt-simple')
  , _ = require('underscore')

  , app = express()
  , http_port = 3000
    //fichier stockage releves
  , relevesDb = new DataStore({ filename: 'db/relevesDb.nedb'})
  , tarifsDb = new DataStore({ filename: 'db/tarifsDb.nedb'})
  , facturesDb = new DataStore({ filename: 'db/facturesDb.nedb'})
  , facturesEauDb = new DataStore({ filename: 'db/facturesEauDb.nedb'})
  , relevesFioulDb = new DataStore({ filename: 'db/relevesFioulDb.nedb'})
  , facturesFioulDb = new DataStore({ filename: 'db/facturesFioulDb.nedb'})
;

app.use(express.static(__dirname + '/app'));
app.use(bodyParser());

app.set('jwtTokenSecret', '123456ABCDEF');

// Lancer l'application une fois la base charge
relevesDb.loadDatabase(function (err) {
    app.listen(http_port);
    console.log("Listening on " + http_port);
});

tarifsDb.loadDatabase();
facturesDb.loadDatabase();
facturesEauDb.loadDatabase();
relevesFioulDb.loadDatabase();
facturesFioulDb.loadDatabase();

//gestion de la couche DAO pour les releves d'electricite
var releveElectriciteDao = require("dao/releveElectriciteDao");
var releveElectriciteDaoInstance = new releveElectriciteDao(app, relevesDb);

//gestion de la couche DAO pour les tarifs d'electricite
var tarifElectriciteDao = require("dao/tarifElectriciteDao");
var tarifElectriciteDaoInstance = new tarifElectriciteDao(app, tarifsDb);

//gestion de la couche DAO pour les factures d'electricite
var factureElectriciteDao = require("dao/factureElectriciteDao");
var factureElectriciteDaoInstance = new factureElectriciteDao(app, facturesDb);

//gestion de la couche DAO pour les factures d'eau
var factureEauDao = require("dao/factureEauDao");
var factureEauDaoInstance = new factureEauDao(app, facturesEauDb);

//gestion de la couche DAO pour les releves de fioul
var releveFioulDao = require("dao/releveFioulDao");
var releveFioulDaoInstance = new releveFioulDao(app, relevesFioulDb);

//gestion de la couche DAO pour les factures de fioul
var factureFioulDao = require("dao/factureFioulDao");
var factureFioulDaoInstance = new factureFioulDao(app, facturesFioulDb);


//upload de fichier
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
app.post('/upload', multipartMiddleware, function(req, resp) {
    console.log(req.body, req.files);
    //sauvearde le fichier dans le repertoire app/upload

    // get the temporary location of the file
    console.log(req.files.file);
    //console.log(req.files[1]);

    var thefile = req.files.file;
    var tmp_path = thefile.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = '.\\app\\upload\\' + thefile.name;
    //var target_path = 'C:\\Users\\thomas\\Documents\\projet_angular\\' + thefile.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
        });
    });

    // don't forget to delete all req.files when done
});
app.get('/upload', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(
        'You can only post to "/upload". Visit <a href="Index.html">Index</a> for more usage options. '
    );
});



//gestion de l'authentification

var tokens = [];

function requiresAuthentication(request, response, next) {
    if (request.headers.access_token) {
        var token = request.headers.access_token;
        if (_.where(tokens, token).length > 0) {
            var decodedToken = jwt.decode(token, app.get('jwtTokenSecret'));
            if (new Date(decodedToken.expires) > new Date()) {
                next();
                return;
            } else {
                removeFromTokens();
                response.end(401, "Your session is expired");
            }
        }
    }
    response.end(401, "No access token found in the request");
}

function removeFromTokens(token) {
    for (var counter = 0; counter < tokens.length; counter++) {
        if (tokens[counter] === token) {
            tokens.splice(counter, 1);
            break;
        }
    }
}

app.get('/', function(request, response) {
    response.sendfile("index.html");
});

app.post('/api/login', function(request, response) {
    var userName = request.body.userName;
    var password = request.body.password;

    if (userName === "admin" && password === "admin") {
        var expires = new Date();
        expires.setDate((new Date()).getDate() + 5);
        var token = jwt.encode({
            userName: userName,
            expires: expires
        }, app.get('jwtTokenSecret'));
        tokens.push(token);
        response.send(200, { access_token: token, userName: userName });
    } else {
        response.send(401, "Invalid credentials");
    }
});

app.post('/api/logout', requiresAuthentication, function(request, response) {
    var token= request.headers.access_token;
    removeFromTokens(token);
    response.send(200);
});