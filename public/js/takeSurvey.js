let debug = true; //Print extra stuff when debugging.
let username;     //Logged in user.
let id;           //Survey ID number.
let surveyData;   //Initial survey data.
let userSurveys = [];

//The number of table rows during the last poll.
let lastComments  = 0;
let lastResponses = 0;

//Boolean to indicate the survey has expired.
let isExpired = false;

//Google Maps variables.
let markers = [];
let map;

//Update the remaining survey time and disable expired surveys.
let updateTime = function()
{
    let endTime       = surveyData.survey[0].stopTime;
    let utcEndMoment  = moment(endTime, "YYYY-MM-DD HH:mm:ss");
    let thisMoment    = moment();

    //Convert the stored UTC time to local time.
    let offset  = moment().utcOffset();
    endMoment   = moment(utcEndMoment).add(offset, "minutes");

    if(thisMoment > endMoment)
    {
        isExpired = true;
        $("#this-time").text("Expired");

        //Disable all the radio buttons.
        $("#questions-div input:radio").attr('disabled',true);
        $(".question-clear-btn").prop('disabled', true);
        $(".question-block").addClass("disabled");
        return;
    }

    //Calculate remaining time for the survey.
    let remaining    = endMoment.diff(thisMoment);
    let remainString = moment.utc(remaining).format("HH:mm:ss");
    $("#this-time").text(remainString);
}

//Figure out how many surveys have not been read.
let calcUnread = function()
{
    let unread = 0;
    for(let i = 0; i < userSurveys.length; i++)
    {
        if(!userSurveys[i].isRead)
        {
            unread++;
        }
    }
    $("#unread-div").text(unread);
}

let getSurveys = function() 
{
    //Get the logged in username.
    username = $(".navbar-user").attr("data-username");

    //Grab all the surveys the user is a part of.
    $.get("/api/usersurveys/" + username)
    .then(function(data)
    {
        if(debug)console.log(data);
        userSurveys = data;

        //Calculate how many unread surveys there are.
        calcUnread();
    })
    .fail(function(err)
    {
        throw err;
    });
}

// function to add a marker to google map
function addMarker(selectionObject)
{
    // creates a marker and adds it to google maps
    let thisMarker = new google.maps.Marker
    ({
            position: { lat: selectionObject.lat, lng: selectionObject.lng },
            map: map,
            title: selectionObject.name,
    });

    markers.push(thisMarker);
}

//Initialize Google maps and add the markers.
let geoInitialize = function()
{
    let choices = surveyData.data.choices;
    let lat  = 0;
    let lng  = 0;
    let zoom = 9;
    let validLat = 0;
    let validLng = 0;

    //average all the latitudes and longitudes to find center of map.
    for(let i = 0; i < choices.length; i++)
    {
        if(choices[i].latitude !== null)
        {
            lat += choices[i].latitude;
            validLat++;
        }

        if(choices[i].longitude !== null)
        {
            lng += choices[i].longitude;
            validLng++;
        }
    }

    lat /= validLat;
    lng /= validLng;

    //Make sure there is valid coordinates to center the map.
    if(isNaN(lat) || isNaN(lng))
    {
        lat  = 0;
        lng  = 0;
        zoom = 0;
    }
    
    console.log("Lat: " + lat + ", Lon: " + lng);

    //Create a map.
    map = new google.maps.Map(document.getElementById('map'),
    {
        center: { lat: lat, lng: lng },
       	zoom: zoom
    });

    //Add choice markers to map.
    for(let i = 0; i < choices.length; i++)
    {
        if(choices[i].isGoogle)
        {
            addMarker(
            {
                lat:  choices[i].latitude,
                lng:  choices[i].longitude,
                name: choices[i].description
            })
        }
    }
}

//Load all the questions and their options to the page.
let showQuestions = function()
{
    let questions = surveyData.data.questions;
    let choices   = surveyData.data.choices;

    for(let i = 0; i < questions.length; i++)
    {
        //Create the main question block div.
        let questionDiv = $("<div>");
        questionDiv.addClass("question-block");
        questionDiv.attr("id", "question-" + questions[i].id);

        //Add the question text to the question block div.
        let questionText = $("<div>");
        questionText.addClass("question-text");
        questionText.text(questions[i].question);
        questionDiv.append(questionText);

        //Create an options block to hold all the options.
        let choicesBlock = $("<div>");
        choicesBlock.addClass("options-block");
        questionDiv.append(choicesBlock);

        //Get all the choices for the current question.
        let choicesArray = choices.filter(function(value)
        {
            return questions[i].id === value.SurveyQuestionId;
        });

        //Create the individual choice divs for the question.
        for(let j = 0; j < choicesArray.length; j++)
        {
            let choiceDiv = $("<div>");
            choiceDiv.addClass("choice-div");

            let radioBtn = $("<input>");
            radioBtn.attr("name", "data-question" + questions[i].id);
            radioBtn.attr("type", "radio");
            radioBtn.attr("id", "radio-choice-" + choicesArray[j].id);
            radioBtn.addClass("radio-btn");
            radioBtn.addClass("data-question" + questions[i].id);
            choiceDiv.append(radioBtn);

            //Event listener for the radio buttons.
            radioBtn.on("click", function()
            {
                //Delete any existing selections for this question.
                $.ajax("/api/deleteresponse/" + username + "/" + questions[i].id,
                {
                    type: "DELETE"
                }).then(function()
                {
                    //Post the new response.
                    $.ajax("/api/addresponse",
                    {
                        type: "POST",
                        data:
                        { 
                            username:       username,
                            surveyId:       id,
                            questionId:     questions[i].id,
                            surveyChoiceId: choicesArray[j].id
                        }
                    })
                    .then(function(data)
                    {
                        lastResponses--;
                        if(debug)console.log("Response Id: " + data.id);
                    });
                });
            });

            let choiceTextSpan  = $("<span>");
            choiceTextSpan.text(choicesArray[j].description);
            choiceDiv.append(choiceTextSpan);

            let responseNum = $("<span>");
            responseNum.addClass("response-num");
            responseNum.attr("id", "data-choice-" + choicesArray[j].id);
            responseNum.text(" (0)");
            choiceDiv.append(responseNum);

            choicesBlock.append(choiceDiv);
        }

        btnDiv = $("<div>");
        btnDiv.addClass("btn-div");
        questionDiv.append(btnDiv);

        clearBtn = $("<button>");
        clearBtn.addClass("btn btn-primary question-clear-btn");
        clearBtn.attr("id", "clr-btn-" + questions[i].id);
        clearBtn.attr("question", questions[i].id);
        clearBtn.append("Clear");
        btnDiv.append(clearBtn);

        //Clear button listener.
        clearBtn.on("click", function()
        {
            // Send the DELETE request.
            $.ajax("/api/deleteresponse/" + username + "/" + questions[i].id,
            {
                type: "DELETE"
            }).then(function()
            {
                $(".data-question" + questions[i].id).prop('checked', false);
                if(debug)console.log("Selection Cleared.");
            });
        });

        updateTime(); //Make sure to immediately disable expired surveys.
        $("#questions-div").append(questionDiv);
    }
}

//Check for new survey responses and update the survey if necessary.
let updateSurveyResponses = function()
{
    $.get("/api/numresponses/" + id)
    .then(function(data)
    {
        //Always force an update.
        lastResponses--;

        //Check if there are any new responses.
        if(data.responseCount != lastResponses)
        {
            if(debug)console.log("Updating Responses");

            //Update the response count.
            lastResponses = data.responseCount;

            $.get("/api/surveyresponses/" + id)
            .then(function(data)
            {
                if(debug)console.log(data);

                let choices = surveyData.data.choices;

                //Loop through all the survey choices and the the responses for each one.
                for(let i = 0; i < choices.length; i++)
                {
                    let responseArray = data.filter(function(element)
                    {
                        //console.log("Survey Choice ID: " + element.SurveyChoiceId);
                        return element.SurveyChoiceId === choices[i].id;
                    })

                    if(debug)console.log("Updating Tally");
                    if(debug)console.log(responseArray);
                    if(debug)console.log("Choices Array");
                    if(debug)console.log(choices);

                    //Update the number of responses on the current choice.
                    //$("#data-choice-" + (i + 1)).text("(" + responseArray.length + ")");
                    $("#data-choice-" + choices[i].id).text("(" + responseArray.length + ")");
                }

                //Update the radio buttons that have been selected by the current user.
                for(let i = 0; i < data.length; i++)
                {
                    if(data[i].username === username)
                    {
                        $("#radio-choice-" + data[i].SurveyChoiceId).prop("checked", true);
                        console.log(data[i]);
                    }
                }
            })
            .fail(function(err)
            {
                throw err;
            });
        }
    })
    .fail(function(err)
    {
        throw err;
    });
}

//Display the survey when the page first loads.
let buildSurvey = function()
{
    if(debug)console.log(surveyData.survey[0]);
    if(debug)console.log(surveyData.data);

    //Display the survey title.
    $("#survey-title").text(surveyData.survey[0].surveyTitle);

    //Update the time remaining.
    updateTime();
    setInterval(function(){updateTime()}, 1000);

    //Setup Google Maps and add markers.
    geoInitialize();

    //Show the questions and choices.
    showQuestions();

    //Update the survey responses.
    updateSurveyResponses();
    setInterval(function(){updateSurveyResponses()}, 1000);
}

let getSurveyData = function()
{
    //Grab the initial survey data.
    $.get("/api/initialsurveydata/" + id)
    .then(function(data)
    {
        $.get("/api/survey/" + id)
        .then(function(dbSurvey)
        {
            surveyData =
            {
                survey: dbSurvey,
                data: data
            };
            
            //Put the initial survey data on the display.
            buildSurvey();
        })
        .fail(function(err)
        {
            throw err;
        });
    })
    .fail(function(err)
    {
        throw err;
    });
}

let chatAutoScroll = function()
{
    $('#comments-div').stop().animate(
    {
        scrollTop: $('#comments-div')[0].scrollHeight
    }, 800);
}

//Check if there are any new comments.  If so, update them on the page.
let updateComments = function()
{
    $.get("/api/numcomments/" + id)
    .then(function(dbComments)
    {
        let numComments = dbComments.commentCount;
            
        //Check to see if there are any new comments since last check.
        if(numComments > lastComments)
        {
            $.get("/api/surveycomments/" + id)
            .then(function(dbComment)
            {
                if(debug)console.log(dbComment);

                for(let i = lastComments; i < dbComment.length; i++)
                {
                    let username = dbComment[i].username;
                    let comment = dbComment[i].comment;
                    let commentText = $("<div>");
                    commentText.attr("contenteditable", "true");
                    commentText.addClass("mx-2");
                    commentText.html("<b>" + username + ": </b>" + comment + "<br>");
                    $("#comments-div").append(commentText);
                }

                chatAutoScroll();
                lastComments = numComments;
            })
            .fail(function(err)
            {
                throw err;
            });
        }
    })
    .fail(function(err)
    {
        throw err;
    });
}

//Send a user comment to the server.
let sendComment = function(event)
{
    event.preventDefault();

    let comment = $("#comment-text").val().trim();

    //Exit if there is a blank comment.
    if(comment === "")return;

    $("#comment-text").val("");

    //Send the POST request.
    $.ajax("/api/postcomment",
    {
        type: "POST",
        data:
        { 
            username: username,
            comment:  comment,
            surveyId: id
        }
    })
    .then(function(data)
    {
        if(debug)console.log("Comment Id:" + data.id);
    });
}

$(document).ready(function()
{
    $("#comment-btn").on("click", sendComment);
    id = $(".navbar-user").attr("data-survey");
    getSurveys();
    getSurveyData();
    updateComments();
    setInterval(function(){getSurveys()}, 3000);
    setInterval(function(){updateComments()}, 1000);
});