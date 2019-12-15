//Dependencies
let express = require("express");
let session = require('express-session');
let morgan = require('morgan');
let passport = require('./config/passport');

//Setting up port and requiring models for syncing
let PORT = process.env.PORT || 8880;
let db = require("./models");

//Creating express app and configuring needed middleware.
let app = express();
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static("public"));
//app.use(morgan('dev'));

//Set Handlebars.
let exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// We need to use sessions to keep track of our user's login status
app.use(session({
    secret: "surveysupersecret",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);
require("./routes/test-routes.js")(app);

//Sync sequelize models then start Express.
db.sequelize.sync({
        //force: true //Use this only to wipe the database clean!
    })
    .then(function () {
        app.listen(PORT, function () {
            console.log("App listening on PORT " + PORT);
        });
    });