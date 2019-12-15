// Requiring path to so we can use relative routes to our HTML files
var path = require("path");
let db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app)
{
    app.get("/", function(req, res)
    {
        res.redirect("/home");
    });

    app.get("/home", function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            let hbsObject = { user: req.user.username };
            res.render("home", hbsObject);
        }
        else
        {
            res.redirect("login");
        }
    });

    app.get("/makesurvey", function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            let hbsObject = { user: req.user.username };
            res.render("makeSurvey", hbsObject);
        }
        else
        {
            res.redirect("login");
        }
    });

    app.get("/takesurvey/:id?", function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            let hbsObject = { user: req.user.username, id: req.params.id };
            res.render("takeSurvey", hbsObject);
        }
        else
        {
            res.redirect("../login");
        }
    });

    app.get("/viewsurvey/:id?", function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            let hbsObject = { user: req.user.username, id: req.params.id };
            res.render("viewSurvey", hbsObject);
        }
        else
        {
            res.redirect("login");
        }
    });

    app.get("/usersettings", function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            let hbsObject = { user: req.user.username };
            res.render("userSettings", hbsObject);
        }
        else
        {
            res.redirect("login");
        }
    });

    /*********************************** Authentication Routes ***********************************/

    app.get("/login", function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            res.render("home");
        }
        else
        {
            res.render("login");
        }
    });

    app.get("/signup", function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            res.render("home");
        }
        else
        {
            res.render("signup");
        }
    });

    //Here we've add our isAuthenticated middleware to this route.
    //If a user who is not logged in tries to access this route they
    //will be redirected to the signup page
    app.get("/home", isAuthenticated, function(req, res)
    {
        res.render("login");
    });
};
