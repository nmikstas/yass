let debug = true;
let userSurveys;
let surveyInterval;

//A function to append divs in other divs.
let appendDiv = function(parentDiv, childDiv)
{
    parentDiv.append(childDiv);
}

//Show the user their surveys.
let showSurveys = function()
{
    //Divs used while viewing all surveys.
    let activeDiv  = $("<div>");
    let expiredDiv = $("<div>");
    let starredDiv = $("<div>");
    let futureDiv  = $("<div>");

    let radioValue = $("input[name='survey-type']:checked").val();
    if(debug)console.log(radioValue);

    //Clear out any old surveys.
    $("#surveys-div").empty();

    //Check if on "All Surveys" tab.
    if(radioValue === "all")
    {
        //Add headers for all the different types of surveys.
        activeDiv.addClass("survey-header");
        activeDiv.append("<h1>Active Surveys</h1>");
        $("#surveys-div").append(activeDiv);

        expiredDiv.addClass("survey-header");
        expiredDiv.append("<h1>Expired Surveys</h1>");
        $("#surveys-div").append(expiredDiv);

        starredDiv.addClass("survey-header");
        starredDiv.append("<h1>Starred Surveys</h1>");
        $("#surveys-div").append(starredDiv);

        futureDiv.addClass("survey-header");
        futureDiv.append("<h1>Future Surveys</h1>");
        $("#surveys-div").append(futureDiv);
    }

    //Loop through all the surveys and build the common blocks needed.
    for(let i = 0; i < userSurveys.length; i++)
    {
        //Get the relevant data from the survey object.
        let surveyId        = userSurveys[i].SurveyId;
        let surveyTakerId   = userSurveys[i].id;
        let startTime       = userSurveys[i].Survey.startTime;
        let endTime         = userSurveys[i].Survey.stopTime;
        let utcStartMoment  = moment(startTime, "YYYY-MM-DD HH:mm:ss");
        let utcEndMoment    = moment(endTime,   "YYYY-MM-DD HH:mm:ss");
        let thisMoment      = moment();
        let surveyTitle     = userSurveys[i].Survey.surveyTitle;
        let surveyOwner     = userSurveys[i].Survey.User.username;
        let surveyIsRead    = userSurveys[i].isRead;
        let surveyIsStarred = userSurveys[i].isStarred;

        //Convert the stored UTC time to local time.
        let offset  = moment().utcOffset();
        startMoment = moment(utcStartMoment).add(offset, "minutes");
        endMoment   = moment(utcEndMoment).add(offset, "minutes");

        //Create the main survey div.
        let surveyDiv = $("<div>");
        surveyDiv.attr("id", "survey-div" + surveyTakerId);
        surveyDiv.addClass("survey-div");
        surveyDiv.append("<div class=\"survey-title\">" + surveyTitle + "</div>");

        //Always add the owner to the survey.
        let ownerDiv = $("<div>");
        ownerDiv.append("<b>Owner: </b>");
        ownerDiv.addClass("survey-info-div");
        ownerDiv.append(surveyOwner);
        surveyDiv.append(ownerDiv);

        //Create a start time div for certain surveys.
        let startTimeDiv  = $("<div>");
        startTimeDiv.append("<b>Start Time: </b>");
        startTimeDiv.addClass("survey-info-div");
        startTimeDiv.append(moment(startMoment).format("YYYY-MM-DD HH:mm:ss"));

        //Create an end time div for certain surveys.
        let endTimeDiv  = $("<div>");
        endTimeDiv.append("<b>End Time: </b>");
        endTimeDiv.addClass("survey-info-div");
        endTimeDiv.append(moment(endMoment).format("YYYY-MM-DD HH:mm:ss"));

        //Calculate remaining time for the survey.
        let remaining = endMoment.diff(thisMoment);
        let remainString = moment.utc(remaining).format("HH:mm:ss");

        //Create a remaining time div for certain surveys.
        let remainDiv = $("<div>");
        remainDiv.append("<b>Time Remaining: </b>");
        remainDiv.addClass("survey-info-div");
        remainDiv.append(remainString);

        //Create an "Take Survey" button for active surveys.
        let surveyBtn = $("<button>");
        surveyBtn.append("Take Survey");
        surveyBtn.addClass("survey-btn btn btn-primary");

        //Event handler for "Entered Survey" button.
        surveyBtn.on("mousedown", function()
        {
            //Send the PUT request.
            $.ajax("/api/markasread/" + surveyTakerId,
            {
                type: "PUT"
            })
            .then(function()
            {
                if(debug)console.log("Take Survey: " + surveyId);
                window.location.assign("/takesurvey/" +  surveyId);
            });
        })

        //Create a Delete button for all surveys/
        let deleteBtn = $("<button>");
        deleteBtn.append("Delete");
        deleteBtn.addClass("survey-btn btn btn-danger");
        
        //Event handler for Delete button.
        deleteBtn.on("mousedown", function()
        {
            if (confirm("Are you sure you want to remove this survey from your queue?"))
            {
                //Send the DELETE request.
                $.ajax("/api/deletesurveytaker/" + surveyTakerId,
                {
                    type: "DELETE" 
                })
                .then(function()
                {
                    userSurveys.splice(i, 1); //Keep artifacts from refreshing to the page.
                    $("#survey-div" + surveyTakerId).remove();
                    console.log(surveyDiv);
                    if(debug)console.log("deleted survey taker: " + surveyTakerId);
                });
            }
        })

        //Create a "New" div for unread surveys.
        let newDiv = $("<div>");
        newDiv.append("<b>*NEW!*</b>");
        newDiv.addClass("new-div");

        //Create an "View Survey" button for expired surveys.
        let viewBtn = $("<button>");
        viewBtn.append("View Survey");
        viewBtn.addClass("survey-btn btn btn-primary");

        //Event handler for "Entered Survey" button.
        viewBtn.on("mousedown", function()
        {
            //Send the PUT request.
            $.ajax("/api/markasread/" + surveyTakerId,
            {
                type: "PUT"
            })
            .then(function()
            {
                if(debug)console.log("View Survey: " + surveyId);
                window.location.assign("/takesurvey/" +  surveyId);
            });
        })

        //Create an "Star Survey" button for expired surveys.
        let starBtn = $("<button>");
        starBtn.append("Star Survey");
        starBtn.addClass("survey-btn btn btn-success");

        //Event handler for "Star Survey" button.
        starBtn.on("mousedown", function()
        {
            //Send the PUT request.
            $.ajax("/api/star/" + surveyTakerId + "/true",
            {
                type: "PUT"
            })
            .then(function()
            {
                if(debug)console.log("Star Survey: " + surveyTakerId);
                runHome();
            });
        })

        //Create an "Unstar Survey" button for expired surveys.
        let unstarBtn = $("<button>");
        unstarBtn.append("Unstar Survey");
        unstarBtn.addClass("survey-btn btn btn-success");

        //Event handler for "Star Survey" button.
        unstarBtn.on("mousedown", function()
        {
            //Send the PUT request.
            $.ajax("/api/star/" + surveyTakerId + "/false",
            {
                type: "PUT"
            })
            .then(function()
            {
                if(debug)console.log("Unstar Survey: " + surveyTakerId);
                runHome();
            });
        })
        
        switch(radioValue)
        {
            case "active":  //Active surveys.
                if(endMoment > thisMoment && startMoment < thisMoment)
                {
                    //Add appropriate survey divs.
                    surveyDiv.append(endTimeDiv);
                    surveyDiv.append(remainDiv);
                    surveyDiv.append(surveyBtn);
                    surveyDiv.append(deleteBtn);

                    //Check if the user has read this survey before.
                    if(!surveyIsRead)
                    {
                        surveyDiv.append(newDiv);
                    }

                    //Finally, add survey to the home page.
                    appendDiv($("#surveys-div"), surveyDiv);
                }
                break;

            case "expired": //Expired surveys.
                if(endMoment < thisMoment && !surveyIsStarred)
                {
                    //Add appropriate survey divs.
                    surveyDiv.append(endTimeDiv);
                    surveyDiv.append(viewBtn);
                    surveyDiv.append(starBtn);
                    surveyDiv.append(deleteBtn);

                    //Check if the user has read this survey before.
                    if(!surveyIsRead)
                    {
                        surveyDiv.append(newDiv);
                    }

                    //Finally, add survey to the home page.
                    appendDiv($("#surveys-div"), surveyDiv);
                }
                break;

            case "starred": //Starred surveys.
                if(endMoment < thisMoment && surveyIsStarred)
                {
                    //Add appropriate survey divs.
                    surveyDiv.append(endTimeDiv);
                    surveyDiv.append(viewBtn);
                    surveyDiv.append(unstarBtn);
                    surveyDiv.append(deleteBtn);

                    //Check if the user has read this survey before.
                    if(!surveyIsRead)
                    {
                        surveyDiv.append(newDiv);
                    }

                    //Finally, add survey to the home page.
                    appendDiv($("#surveys-div"), surveyDiv);
                }
                break;

            case "future":  //Future surveys.
                if(startMoment > thisMoment)
                {
                    //Add appropriate survey divs.
                    surveyDiv.append(startTimeDiv);
                    surveyDiv.append(deleteBtn);

                    //Check if the user has read this survey before.
                    if(!surveyIsRead)
                    {
                        surveyDiv.append(newDiv);
                    }

                    //Finally, add survey to the home page.
                    appendDiv($("#surveys-div"), surveyDiv);
                }
                break;

            case "all": //All surveys.
                /******************************** Active Surveys *********************************/
                if(endMoment > thisMoment && startMoment < thisMoment)
                {
                    //Add appropriate survey divs.
                    surveyDiv.append(endTimeDiv);
                    surveyDiv.append(remainDiv);
                    surveyDiv.append(surveyBtn);
                    surveyDiv.append(deleteBtn);

                    //Check if the user has read this survey before.
                    if(!surveyIsRead)
                    {
                        surveyDiv.append(newDiv);
                    }

                    //Finally, add survey to the home page.
                    appendDiv(activeDiv, surveyDiv);
                }

                /******************************** Expired Surveys ********************************/
                else if(endMoment < thisMoment && !surveyIsStarred)
                {
                    //Add appropriate survey divs.
                    surveyDiv.append(endTimeDiv);
                    surveyDiv.append(viewBtn);
                    surveyDiv.append(starBtn);
                    surveyDiv.append(deleteBtn);

                    //Check if the user has read this survey before.
                    if(!surveyIsRead)
                    {
                        surveyDiv.append(newDiv);
                    }

                    //Finally, add survey to the home page.
                    appendDiv(expiredDiv, surveyDiv);
                }

                /******************************** Starred Surveys ********************************/
                else if(endMoment < thisMoment && surveyIsStarred)
                {
                    //Add appropriate survey divs.
                    surveyDiv.append(endTimeDiv);
                    surveyDiv.append(viewBtn);
                    surveyDiv.append(unstarBtn);
                    surveyDiv.append(deleteBtn);

                    //Check if the user has read this survey before.
                    if(!surveyIsRead)
                    {
                        surveyDiv.append(newDiv);
                    }

                    //Finally, add survey to the home page.
                    appendDiv(starredDiv, surveyDiv);
                }

                /******************************** Future Surveys *********************************/
                else if(startMoment > thisMoment)
                {
                     //Add appropriate survey divs.
                     surveyDiv.append(startTimeDiv);
                     surveyDiv.append(deleteBtn);

                    //Check if the user has read this survey before.
                    if(!surveyIsRead)
                    {
                        surveyDiv.append(newDiv);
                    }

                    //Finally, add survey to the home page.
                    appendDiv(futureDiv, surveyDiv);
                }
                break;
        }
    }
}

//Add listener to the radio buttons.
$(".form-check-input").click(function()
{
    showSurveys();
});

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

let runHome = function()
{
    //Get the logged in username.
    let username = $(".navbar-user").attr("data-username");

    //Grab all the surveys the user is a part of.
    $.get("/api/usersurveys/" + username)
    .then(function(data)
    {
        if(debug)console.log(data);
        userSurveys = data;

        //Calculate how many unread surveys there are.
        calcUnread();
        showSurveys();
    })
    .fail(function(err)
    {
        throw err;
    });
}

$(document).ready(function()
{
    runHome();
    setInterval(function(){runHome()}, 3000);
    setInterval(function(){showSurveys()}, 1000);
});