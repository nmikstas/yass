// Requiring path to so we can use relative routes to our HTML files
let db = require("../models");
var passport = require("../config/passport");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

/*************************************** Testing Routes **************************************/

module.exports = function(app)
{
    app.get("/test/createusers", function(req, res)
    {
        res.render("testing/createUsers");
    });

    app.get("/test/deleteusers", function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            res.render("testing/deleteUsers");
        }
        else
        {
            res.render("login");
        }
    });

    app.get("/test/getusers", isAuthenticated, function(req, res)
    {
        // If the user already has an account send them to the members page
        if (req.user)
        {
            db.User.findAll(
            {
            })
            .then(function(data)
            {
                res.json(data);
            });
        }
        else
        {
            res.redirect("login");
        }
    });

    app.delete("/test/delete/:id", isAuthenticated, function(req, res)
    {
        console.log("ID to delete: " + req.params.id);
        
        db.User.destroy(
        {
            where:
            {
                id: req.params.id
            }
        })
        .then(function(dbUser)
        {
            res.json(dbUser);
        })
        .catch(function(error)
        {
            throw error;
        });
    });
};