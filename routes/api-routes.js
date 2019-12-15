//Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
let bcrypt = require("bcryptjs");

//Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

//Get Google places configured and running.
require("dotenv").config();
var keys = require("../keys.js");
const googleMapsClient = require('@google/maps').createClient(
{
    key: keys.google.key
});

module.exports = function(app)
{
    /****************************** Add additional API routes here. ******************************/

    //Get all the surveys that the specified user is a part of.
    app.get("/api/usersurveys/:username", isAuthenticated, function(req, res)
    {
        if (req.user)
        {
            //Get all the surveys the current user belongs to.
            db.SurveyTaker.findAll(
            {
                where:
                {
                    Username: req.params.username
                },
                include: 
                [{
                    //Get the survey description for each survey.
                    model: db.Survey,
                    include:
                    [{
                        //Get the owner of the survey.
                        model: db.User,
                        attributes: ["username", "id"]
                    }]
                }]
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

    //Delete a survey taker from a survey. ID is row in surveytakers table.
    app.delete("/api/deletesurveytaker/:id", isAuthenticated, function(req, res)
    {
            
        db.SurveyTaker.destroy(
        {
            where:
            {
                id: req.params.id
            }
        })
        .then(function(dbSurveyTaker)
        {
            res.json(dbSurveyTaker);
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //Mark a survey as read. ID is row in surveytakers table.
    app.put("/api/markasread/:id", isAuthenticated, function(req, res)
    {
        db.SurveyTaker.update(
        {
            isRead: true
        },
        {
            where:
            {
                id: req.params.id
            }
        })
        .then(function(data)
        {
            res.json(data);
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //Mark a survey as starred or unstarred. ID is row in surveytakers table.
    app.put("/api/star/:id/:true?", isAuthenticated, function(req, res)
    {
        let param = req.params.true;
        let isTrue;

        if(param == "true")
        {
            isTrue = true;
        }
        else
        {
            isTrue = false;
        }

        db.SurveyTaker.update(
        {
            isStarred: isTrue
        },
        {
            where:
            {
                id: req.params.id
            }
        })
        .then(function(dbBurger)
        {
            res.json(dbBurger);
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //Get all the users.
    app.get("/api/allusers", isAuthenticated, function(req, res)
    {
        db.User.findAll(
        {
            attributes: ["username", "id"]
        })
        .then(function(data)
        {
            res.json(data);
        });
    });

    //Google Places API
    app.get("/api/places/:query/:radius", isAuthenticated, function(req, res)
    {
        let query   = req.params.query;
        let radius  = parseInt(req.params.radius);
        
        googleMapsClient.places(
        {
            query: query,
            radius: radius
        },
        function(err, response)
        {
            if (!err)
            {
                res.json(response.json.results);
                console.log(response.json.results);
            }
            else
            {
                console.log(err);
            }
        });
    });

    //Get initial survey data.
    app.get("/api/initialsurveydata/:id", isAuthenticated, function(req, res)
    {
        let surveyId = parseInt(req.params.id);

        //Get all the survey questions.
        db.SurveyQuestion.findAll(
        {
            where:
            {
                SurveyId: surveyId
            }
        })
        .then(function(dbSurveyQuestion)
        {
            //Get all the survey choices.
            db.SurveyChoice.findAll(
            {
                where:
                {
                    surveyId: surveyId
                }
            })
            .then(function(dbSurveyChoice)
            {
                //Get all the survey responses.
                db.SurveyResponse.findAll(
                {
                    where:
                    {
                        surveyId: surveyId
                    }
                })
                .then(function(dbSurveyResponse)
                {
                    //Get all the survey comments.
                    db.SurveyComment.findAll(
                    {
                        where:
                        {
                            SurveyId: surveyId
                        }
                    })
                    .then(function(dbSurveyComment)
                    {
                        let surveyData =
                        {
                            questions: dbSurveyQuestion,
                            choices:   dbSurveyChoice,
                            responses: dbSurveyResponse,
                            comments:  dbSurveyComment
                        };

                        res.json(surveyData);
                    })
                    .catch(function(error)
                    {
                        throw error;
                    });
                })
                .catch(function(error)
                {
                    throw error;
                });                
            })
            .catch(function(error)
            {
                throw error;
            });
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //Get survey comments.
    app.get("/api/surveycomments/:id", isAuthenticated, function(req, res)
    {
        let surveyId = parseInt(req.params.id);

        db.SurveyComment.findAll(
        {
            where:
            {
                SurveyId: surveyId
            }
        })
        .then(function(data)
        {
            res.json(data);
        });
    });

    //Get survey responses.
    app.get("/api/surveyresponses/:id", isAuthenticated, function(req, res)
    {
        let surveyId = parseInt(req.params.id);

        db.SurveyResponse.findAll(
        {
            where:
            {
                surveyId: surveyId
            }
        })
        .then(function(data)
        {
            res.json(data);
        });
    });

    //Get survey data.
    app.get("/api/survey/:id", isAuthenticated, function(req, res)
    {
        let surveyId = parseInt(req.params.id);

        db.Survey.findAll(
        {
            where:
            {
                id: surveyId
            }
        })
        .then(function(data)
        {
            res.json(data);
        });
    });

    //Post a comment.
    app.post("/api/postcomment", isAuthenticated, function(req, res)
    {
        db.SurveyComment.create(
        {
            username: req.body.username,
            comment:  req.body.comment,
            SurveyId: req.body.surveyId
        })
        .then(function(result)
        {
            res.json(result);
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //Get the number of comments for a specific survey.
    app.get("/api/numcomments/:id", isAuthenticated, function(req, res)
    {
        let surveyId = parseInt(req.params.id);

        db.SurveyComment.findAll(
        {
            where:
            {
                SurveyId: surveyId
            }
        })
        .then(function(data)
        {
            res.json({commentCount: data.length });
        });
    });

    //Get all the responses for a survey.
    app.get("/api/surveyresponses/:id", isAuthenticated, function(req, res)
    {
        let surveyId = parseInt(req.params.id);

        db.SurveyResponse.findAll(
        {
            where:
            {
                surveyId: surveyId
            }
        })
        .then(function(data)
        {
            res.json(data);
        });
    });

    //Get the number of responses for a survey.
    app.get("/api/numresponses/:id", isAuthenticated, function(req, res)
    {
        let surveyId = parseInt(req.params.id);

        db.SurveyResponse.findAll(
        {
            where:
            {
                surveyId: surveyId
            }
        })
        .then(function(data)
        {
            res.json({ responseCount: data.length });
        });
    });

    //Clear response for username and question.
    app.delete("/api/deleteresponse/:username/:question", isAuthenticated, function(req, res)
    {
        db.SurveyResponse.destroy(
        {
            where:
            {
                username:   req.params.username,
                questionId: req.params.question
            }
        })
        .then(function(dbSurveyTaker)
        {
            res.json(dbSurveyTaker);
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //Add a response to a survey.
    app.post("/api/addresponse", isAuthenticated, function(req, res)
    {
        db.SurveyResponse.create(
        {
            username:       req.body.username,
            surveyId:       req.body.surveyId,
            questionId:     req.body.questionId,
            SurveyChoiceId: req.body.surveyChoiceId
        })
        .then(function(result)
        {
            res.json(result);
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //post a new distribution list for a user.
    app.post("/api/addlist", isAuthenticated, function(req, res)
    {
        db.DistributionList.create(
        {
            username: req.body.username,
            list:   req.body.list,
            title:  req.body.title
        })
        .then(function(result)
        {
            res.json(result);
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //Get all distribution lists for a user.
    app.get("/api/getdistros/:username", isAuthenticated, function(req, res)
    {
        db.DistributionList.findAll(
        {
            where:
            {
                username: req.params.username
            }
        })
        .then(function(data)
        {
            res.json(data);
        });
    });

    //Delete a distribution list for a user.
    app.delete("/api/deletedistro/:id", isAuthenticated, function(req, res)
    {
        db.DistributionList.destroy(
        {
            where:
            {
                id: req.params.id
            }
        })
        .then(function(dbDistro)
        {
            res.json(dbDistro);
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    //Get a user's email notification setting.
    app.get("/api/getnotification/:username", isAuthenticated, function(req, res)
    {
        db.User.findOne(
        {
            where:
            {
                username: req.params.username
            },
            attributes: ["username", "allowNotifications"]
        })
        .then(function(data)
        {
            res.json(data);
        });
    });

    //Change a user's email notification setting.
    app.put("/api/putnotification/:username/:true?", isAuthenticated, function(req, res)
    {
        let param = req.params.true;
        let isTrue;

        if(param == "true")
        {
            isTrue = true;
        }
        else
        {
            isTrue = false;
        }

        db.User.update(
        {
            allowNotifications: isTrue
        },
        {
            where:
            {
                username: req.params.username
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

    //Change a user's password.
    app.put("/api/putpassword/:username/:password", isAuthenticated, function(req, res)
    {
        let password = req.params.password;
        password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

        db.User.update(
        {
            password: password
        },
        {
            where:
            {
                username: req.params.username
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

    //Change a user's email.
    app.put("/api/putemail/:username/:email", isAuthenticated, function(req, res)
    {
        db.User.update(
        {
            email: req.params.email
        },
        {
            where:
            {
                username: req.params.username
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
    
    /************************** Post a new survey functions and routes ***************************/

    //Add choices.
    let addChoices = function(questionChoices, questionId, surveyId, index)
    {
        if(index < questionChoices.length)
        {
            let lat = null;
            let lng = null;

            if(typeof questionChoices[index].latLong !== 'undefined')
            {
                lat = questionChoices[index].latLong.lat;
                lng = questionChoices[index].latLong.lng;
            }

            db.SurveyChoice.create(
            {
                description:      questionChoices[index].surveyOption,
                selectedCount:    0,
                isGoogle:         questionChoices[index].isGoogle,
                latitude:         lat,
                longitude:        lng,
                surveyId:         surveyId,
                data0:            null,
                data1:            null,
                data2:            null,
                data3:            null,
                data4:            null,
                data5:            null,
                data6:            null,
                data7:            null,
                data8:            null,
                data9:            null,
                SurveyQuestionId: questionId
            })
            .then(function(result)
            {
                index++;
                addChoices(questionChoices, questionId, surveyId, index);
            })
            .catch(function(error)
            {
                throw error;
            });   
        }
        else
        {
            console.log("Done adding survey question options.");
        }
    }

    //Add questions.
    let addQuestions = function(surveyData, surveyId, index)
    {
        if(index < surveyData.questions.length)
        {
            db.SurveyQuestion.create(
            {
                question: surveyData.questions[index].questionName1,
                SurveyId: surveyId
            })
            .then(function(result)
            {
                let questionId = result.dataValues.id;
                addChoices(surveyData.questions[index++].questionOptions,
                    questionId, surveyId, 0);
                addQuestions(surveyData, surveyId, index);
            })
            .catch(function(error)
            {
                throw error;
            });   
        }
        else
        {
            console.log("Done adding survey questions.");
        }
    }

    //Add comments.
    let addcomments = function(surveyData, surveyId, index)
    {
        if((typeof surveyData.comments !== 'undefined') && (index < surveyData.comments.length))
        {
            
            db.SurveyComment.create(
            {
                username: surveyData.comments[index].userName,
                comment:  surveyData.comments[index++].userComment,
                SurveyId: surveyId
            })
            .then(function(result)
            {
                addcomments(surveyData, surveyId, index);
            })
            .catch(function(error)
            {
                throw error;
            });   
        }
        else
        {
            console.log("Done adding survey comments.");
            addQuestions(surveyData, surveyId, 0)
        }
    }

    //Add survey takers.
    let addSurveyTakers = function(surveyData, surveyId, index)
    {
        if(index < surveyData.users.length)
        {
            db.SurveyTaker.create(
            {
                username:  surveyData.users[index++],
                isRead:    false,
                isStarred: false,
                SurveyId:  surveyId
            })
            .then(function(result)
            {
                addSurveyTakers(surveyData, surveyId, index);
            })
            .catch(function(error)
            {
                throw error;
            });   
        }
        else
        {
            console.log("Done adding survey takers.");
            addcomments(surveyData, surveyId, 0);
        }
    }

    //add new survey route.
    app.post("/api/newsurvey", isAuthenticated, function(req, res)
    {
        db.User.findOne(
        {
            where:
            {
                username: req.body.owner
            }
        })
        .then(function(userData)
        {
            db.Survey.create(
            {
                surveyTitle: req.body.name,
                startTime:   req.body.start,
                stopTime:    req.body.end,
                UserId:      userData.id    
            })
            .then(function(result)
            {
                let surveyId = result.dataValues.id;
                addSurveyTakers(req.body, surveyId, 0);
                //console.log("*******************************");
                //console.log(result);
                //console.log("*******************************");
                res.json(result);
            })
            .catch(function(error)
            {
                throw error;
            });
        })
        .catch(function(error)
        {
            throw error;
        });
    });

    /*********************************** Authentication Routes ***********************************/
    
    //Using the passport.authenticate middleware with our local strategy.
    //If the user has valid login credentials, send them to the members page.
    //Otherwise the user will be sent an error
    app.post("/api/login", passport.authenticate("local"), 
    function(req, res)
    {
        res.json(req.user);
    });

    //Route for signing up a user. The user's password is automatically hashed and
    //stored securely thanks to how we configured our Sequelize User Model. If the
    //user is created successfully, proceed to log the user in, otherwise send back
    //an error.
    app.post("/api/signup", function(req, res)
    {
        db.User.create(
        {
            username:           req.body.username,
            email:              req.body.email,
            password:           req.body.password,
            allowNotifications: true,
            surveyCount:        0,
            unreadSurveys:      0
        })
        .then(function()
        {
            res.redirect(307, "/api/login");
        })
        .catch(function(err)
        {
            res.status(401).json(err);
        });
    });

    //Route for logging user out
    app.get("/logout", function(req, res)
    {
        req.logout();
        res.redirect("/");
    });

    //Route for getting some data about our user to be used client side
    app.get("/api/user_data", isAuthenticated, function(req, res)
    {
        if (!req.user)
        {
            //The user is not logged in, send back an empty object
            res.json({});
        } 
        else
        {
            // Otherwise send back the user's email and id
            // Sending back a password, even a hashed password, isn't a good idea
            res.json(
            {
                username: req.user.username,
                email: req.user.email,
                id: req.user.id
            });
        }     
    });
};
