let debug = true;
let username = $(".navbar-user").attr("data-username");

let userCommentsArr    = [];
let surveyUserArr      = [];

let questionOptionsArr = [];
let surveyQuestionsArr = [];
let totalQuestionsArr  = [];

let map;
let mapSelectionArray  = [];
let markers            = [];

$(document).ready(function ()
{
    geoInitialize();
    googlePlacesSearch()
    pullUsers();
    addCustomQuestion();
    clearQuestion();
    addQuestion();

    /*
    $("#surveyName").addClass("not-valid");
    $("#start-time-text").addClass("not-valid");
    $("#end-time-text").addClass("not-valid");
    $("#surveyQuestionsDiv").addClass("not-valid");
    $("#usersAdded").addClass("not-valid");
    $("#surveyQuestion").addClass("not-valid");
    $("#questionOptions").addClass("not-valid");
    $("#gPlacesLocation").addClass("not-valid");
    $("#gPlacesState").addClass("not-valid");
    $("#gPlacesRadius").addClass("not-valid");
    $("#customQ").addClass("not-valid");
    $("#distro-text").addClass("not-valid");
    $("#comment-text").addClass("not-valid");
    */
    
    //Remove all markers from the map.
    let removeAllMarkers = function()
    {
        for (let i = 0; i < markers.length; i++)
        {
            markers[i].setMap(null);
        }
    }

    //Show error message if something is wrong with the survey.
    let showErrorBox = function(errMessage)
    {
        $(".info-message").empty();
        $(".info-message").append
        (
            "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
            errMessage +
            "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
            "<span aria-hidden=\"true\">&times;</span></button></div>"
        );
    }

    //Clear results text area.
    $("#clear-results").on("click", function(event)
    {
        $("#gPlacesResults").empty();
    });

    //Clear comments text area.
    $("#clear-comments").on("click", function(event)
    {
        userCommentsArr = [];
        $("#commentsDiv").empty();
    });

    //This is the button that packs up the survey info and sends it to the server.
    $("#create-survey").on("click", function(event)
    {
        //Remove any existing error messages and indicators.
        $(".info-message").empty();
        $("#surveyName").removeClass("not-valid");
        $("#start-time-text").removeClass("not-valid");
        $("#end-time-text").removeClass("not-valid");
        $("#surveyQuestionsDiv").removeClass("not-valid");
        $("#usersAdded").removeClass("not-valid");
        $("#surveyQuestion").removeClass("not-valid");
        $("#questionOptions").removeClass("not-valid");
        $("#gPlacesLocation").removeClass("not-valid");
        $("#gPlacesState").removeClass("not-valid");
        $("#gPlacesRadius").removeClass("not-valid");
        $("#customQ").removeClass("not-valid");
        $("#distro-text").removeClass("not-valid");
        $("#comment-text").removeClass("not-valid");

        //Survey name must not be blank.
        let surveyName = $("#surveyName").val().trim();
        if(surveyName === "")
        {
            showErrorBox("Survey must have a name");
            $("#surveyName").addClass("not-valid");
            return;
        }

        let startTime = $("#start-time-text").val().trim();
        let endTime   = $("#end-time-text").val().trim();

        let startMoment = moment(startTime, "MM/DD/YYYY hh:mm A");
        let endMoment = moment(endTime, "MM/DD/YYYY hh:mm A");

        //Convert the local time to UTC time.
        let offset     = moment().utcOffset();
        utcStartMoment = moment(startMoment).subtract(offset, "minutes");
        utcEndMoment   = moment(endMoment).subtract(offset, "minutes");

        //Error check the start and end times.
        if(!startMoment.isValid())
        {
            showErrorBox("Invalid start time/date");
            $("#start-time-text").addClass("not-valid");
            return;
        }

        if(!endMoment.isValid())
        {
            showErrorBox("Invalid end time/date");
            $("#end-time-text").addClass("not-valid");
            return;
        }

        if(moment(startMoment).isAfter(endMoment))
        {
            showErrorBox("Start time not before end time");
            $("#start-time-text").addClass("not-valid");
            return;
        }

        if(moment(startMoment).isSame(endMoment))
        {
            showErrorBox("Start time not before end time");
            $("#start-time-text").addClass("not-valid");
            return;
        }

        if(moment().isAfter(endMoment))
        {
            showErrorBox("End time before current time");
            $("#end-time-text").addClass("not-valid");
            return;
        }

        //Convert the moments into the properly formatted strings.
        let startString = moment(utcStartMoment).format("YYYY-MM-DD HH:mm:ss").toString();
        let endString = moment(utcEndMoment).format("YYYY-MM-DD HH:mm:ss").toString();

        if(debug)console.log("Survey UTC start time: " + startString);
        if(debug)console.log("Survey UTC end time:   " + endString);

        //Make sure survey questions have been added.
        if(!surveyQuestionsArr.length)
        {
            showErrorBox("No survey questions added");
            $("#surveyQuestionsDiv").addClass("not-valid");
            return;
        }

        if(!surveyUserArr.length)
        {
            showErrorBox("No participants added");
            $("#usersAdded").addClass("not-valid");
            return;
        }

        //Combine all the data and send it to the server.
        $.ajax("/api/newsurvey",
        {
            type: "POST",
            data:
            { 
                name:      surveyName,
                owner:     $(".navbar-user").attr("data-username"),
                start:     startString,
                end:       endString,
                questions: surveyQuestionsArr,
                users:     surveyUserArr,
                comments:  userCommentsArr
            }
        })
        .then(function(data)
        {
            console.log("Survey posted");

            //Remove all markers from the map.
            removeAllMarkers();

            //Delete all the data in the arrays.
            userCommentsArr    = [];
            surveyUserArr      = [];
            questionOptionsArr = [];
            surveyQuestionsArr = [];
            totalQuestionsArr  = [];
            mapSelectionArray  = [];
            markers            = [];

            //Clear all the text areas.
            $("#surveyQuestion").val("");
            $("#questionOptions").empty();
            $("#gPlacesLocation").val("");
            $("#gPlacesState").val("");
            $("#gPlacesRadius").val("");
            $("#gPlacesResults").empty();
            $("#customQ").val("");
            $("#surveyName").val("");
            $("#start-time-text").val("");
            $("#end-time-text").val("");
            $("#surveyQuestionsDiv").empty();
            $("#usersAdded").empty();
            $("#distro-text").val("");
            $("#commentsDiv").empty();
            $("#comment-text").val("");

            //Inform the user the survey was successfully created.
            alert("Survey Created!");
        });
    });

    let showDistros = function()
    {
        //Get the logged in username.
        let username = $(".navbar-user").attr("data-username");

        //Grab all the user's distribution lists.
        $.get("/api/getdistros/" + username)
        .then(function(data)
        {
            if(debug)console.log(data);

            //Create distribution list divs and add them to the page.
            for(let i = 0; i < data.length; i++)
            {
                let distroBlock = $("<div>");

                let addDistroBtn = $("<button>");
                addDistroBtn.addClass("addDistroBtn addUserBtns mr-2");
                addDistroBtn.append("+");
                distroBlock.append(addDistroBtn);

                let delDistroBtn = $("<button>");
                delDistroBtn.addClass("delDistroBtn deleteUserBtns mr-2");
                delDistroBtn.append("<span>&times</span>");
                distroBlock.append(delDistroBtn);
                
                let distroLabel = $("<span>");
                distroLabel.html("<b>" + data[i].title + "</b>");
                distroBlock.append(distroLabel);

                //Delete distribution list if delete button clicked.
                delDistroBtn.on("click", function()
                {
                    event.preventDefault();

                    //Make sure the user really wants to remove the list.
                    if (confirm("Are you sure you want to remove this distribution list?"))
                    {
                        $.ajax("/api/deletedistro/" + data[i].id,
                        {
                            type: "DELETE"
                        }).then(function(result)
                        {
                            if(debug)console.log("Deleted distribution list");
                            $("#distroDiv").empty();
                            showDistros();
                        });
                    }
                });

                //Add users to the survey if the add button is clicked.
                addDistroBtn.on("click", function(event)
                {
                    event.preventDefault();

                    let userArray = data[i].list.split(",");

                    //Loop through current added users to see
                    //if the selected user needs to be added.
                    for(let j = 0; j < userArray.length; j++)
                    {
                        let userName = userArray[j];

                        if (!surveyUserArr.includes(userName))
                        {
                            surveyUserArr.push(userName);
                            surveyUserArr.sort();
                            console.log(surveyUserArr);

                            let deleteButtonIcon = "<span>&times</span>";
                            let deleteUserBtn = $("<button>");
                            deleteUserBtn.addClass("deleteUserBtns");
                            deleteUserBtn.attr("type", "button");

                            let userBoxFinal = $("<span>");
                            userBoxFinal.addClass("form-check-label mx-3");
                            userBoxFinal.append(userName);

                            let userNameFinalDiv = $("<div>");
                            userNameFinalDiv.addClass("form-check");

                            deleteUserBtn.append(deleteButtonIcon);
                            userNameFinalDiv.append(deleteUserBtn);
                            userNameFinalDiv.append(userBoxFinal);
                            $("#usersAdded").append(userNameFinalDiv);

                            deleteUserBtn.on("click", function (event)
                            {
                            
                                //Returns the index of the user name in the array.
                                //Returns -1 if not found. 
                                let index = surveyUserArr.indexOf(userName);

                                //Should always be found but check just to be safe.
                                if(index >= 0)
                                {
                                    surveyUserArr.splice(index, 1);
                                    console.log(surveyUserArr);
                                    userNameFinalDiv.remove();
                                }
                            });
                        }
                    }
                });

                $("#distroDiv").append(distroBlock);
            }
        })
        .fail(function(err)
        {
            throw err;
        });
    }

    //Show the distribution lists when the page loads.
    showDistros();

    $("#distro-btn").on("click", function(event)
    {
        event.preventDefault();

        let invalidUsers = false;
        let invalidText  = false;
        let listTitle    = $("#distro-text").val().trim();

        //Get the logged in username.
        let username = $(".navbar-user").attr("data-username");

        //Reset the invalid indicators.
        $("#usersAdded").removeClass("not-valid");
        $("#distro-text").removeClass("not-valid");

        //Ensure users are added and a title for the distribution list is present.
        if(!surveyUserArr.length)
        {
            $("#usersAdded").addClass("not-valid");
            invalidUsers = true;
        }

        if(listTitle === "")
        {
            $("#distro-text").addClass("not-valid");
            invalidText = true;
        }

        //Exit if any errors detected.
        if(invalidUsers || invalidText)
        {
            return;
        }

        //Join the users into a comma separated list.
        let distroText = surveyUserArr.join();

        //Send the POST request.
        $.ajax("/api/addlist",
        {
            type: "POST",
            data:
            { 
                username: username,
                list:     distroText,
                title:    listTitle
            }
        })
        .then(function(data)
        {
            if(debug)console.log("List Id:" + data.id);

            //Show the updated dustribution lists.
            $("#distro-text").val("");
            $("#distroDiv").empty();
            showDistros();

        });
    });

    let chatAutoScroll = function()
    {
	    $('#commentsDiv').stop().animate(
        {   
            scrollTop: $('#commentsDiv')[0].scrollHeight
        }, 800);
    }

    $("#comment-btn").on("click", function (event)
    {
        event.preventDefault();
        $("#comment-text").removeClass("not-valid");

        //Exit if user comment is blank.
        if($("#comment-text").val().trim() === "")
        {
            $("#comment-text").addClass("not-valid");
            return;
        }

        let userName = $(".navbar-user").attr("data-username");
        let userComment = $("#comment-text").val().trim();
        let fullComment = "<b>" + userName + "</b>" + ": " + userComment;
        let commentDiv = $("<div>");

        commentDiv.attr("contenteditable", "true");
        commentDiv.addClass("mx-2");

        commentDiv.append(fullComment);
        $("#commentsDiv").append(commentDiv);
        $("#comment-text").val("");

        let commentDetails =
        {
            userName: userName,
            userComment: userComment,
        }

        userCommentsArr.push(commentDetails);
        chatAutoScroll();
    });

    function geoInitialize()
    {
        // Create a map centered in SLC.
        map = new google.maps.Map(document.getElementById('map'),
        {
            center: { lat: 0, lng: 0 },
            zoom: 0
        });
    }

    function pullUsers()
    {
        $.ajax("/api/allusers",
        {
            type: "GET"
        })
        .then(function (data)
        {
            //console.log(data);
            for (let i = 0; i < data.length; i++)
            {
                let userName = data[i].username;

                let buttonIcon = "+";
                //console.log(userName);

                let addUserBtn = $("<button>");
                addUserBtn.addClass("addUserBtns");
                addUserBtn.attr("type", "button");
                //addUserBtn.attr("data-username", userName);

                let userBox = $("<span>");
                userBox.addClass("form-check-label mx-3");
                userBox.append(userName);

                let userNameDiv = $("<div>");
                userNameDiv.addClass("form-check");

                addUserBtn.append(buttonIcon);
                userNameDiv.append(addUserBtn);
                userNameDiv.append(userBox);
                $("#userResults").append(userNameDiv);

                addUserBtn.on("click", function (event)
                {         
                    if (!surveyUserArr.includes(userName))
                    {
                        surveyUserArr.push(userName);
                        surveyUserArr.sort();
                        console.log(surveyUserArr);

                        let deleteButtonIcon = "<span>&times</span>";
                        let deleteUserBtn = $("<button>");
                        deleteUserBtn.addClass("deleteUserBtns");
                        deleteUserBtn.attr("type", "button");

                        let userBoxFinal = $("<span>");
                        userBoxFinal.addClass("form-check-label mx-3");
                        userBoxFinal.append(userName);

                        let userNameFinalDiv = $("<div>");
                        userNameFinalDiv.addClass("form-check");

                        deleteUserBtn.append(deleteButtonIcon);
                        userNameFinalDiv.append(deleteUserBtn);
                        userNameFinalDiv.append(userBoxFinal);
                        $("#usersAdded").append(userNameFinalDiv);

                        deleteUserBtn.on("click", function (event)
                        {
                            //Returns the index of the user name in the array.
                            //Returns -1 if not found. 
                            let index = surveyUserArr.indexOf(userName);

                            //Should always be found but check just to be safe.
                            if (index >= 0)
                            {
                                surveyUserArr.splice(index, 1);
                                //console.log(surveyUserArr);
                                userNameFinalDiv.remove();
                            }
                        });
                    }
                });
            }
        });
    }

    //Refersh the users list.
    $("#refresh-users").on("click", function (event)
    {
        $("#userResults").empty();
        pullUsers();
    });

    function addQuestion()
    {
        $("#addQ").on("click", function (event)
        {
            event.preventDefault();

            $("#surveyQuestion").removeClass("not-valid");
            $("#questionOptions").removeClass("not-valid");

            let questionName = $("#surveyQuestion").val().trim();

            let checkQName = surveyQuestionsArr.filter(function(checkName)
            {
                return checkName.questionName1 === questionName;
            })

            if (checkQName.length > 0)
            {
                return;
            }

            if (questionName !== "" && questionOptionsArr.length > 0)
            {
                let deleteQIcon = "Delete";
                let deleteQBtn = $("<button>");
                deleteQBtn.addClass("deleteQBtn");
                deleteQBtn.attr("type", "button");
                deleteQBtn.attr("data-username", questionName);
                deleteQBtn.append(deleteQIcon);

                let questionDiv = $("<div>");
                questionDiv.addClass("question-block");

                let ul = $("<ul>");
                let questionNameText = $("<div>");
                questionNameText.addClass("question-text");
                questionNameText.text(questionName);
                questionDiv.append(questionNameText);
                questionDiv.append(ul);

                for (let i = 0; i < questionOptionsArr.length; i++)
                {
                    let questionChoice = questionOptionsArr[i].surveyOption;
                    let choicesBlock = $("<div>");

                    choicesBlock.addClass("options-block");
                    questionDiv.append("<li>" + questionChoice + "</li>");
                }

                for (let i = 0; i < questionOptionsArr.length; i++)
                {
                    if (questionOptionsArr[i].isGoogle)
                    {
                        let surveyOption = questionOptionsArr[i].surveyOption;
                        //console.log(questionOptionsArr[i]);
                        let latLong = questionOptionsArr[i].latLong;
                        let lat = latLong.lat;
                        let lng = latLong.lng;

                        let mapSelectionObject = 
                        {
                            surveyOption: surveyOption,
                            lat: lat,
                            lng: lng
                        }
                    
                        //mapSelectionArray.push(mapSelectionObject);
                        addMarker(mapSelectionObject);
                    }
                }

                questionDiv.append(deleteQBtn);
                $("#surveyQuestionsDiv").append(questionDiv);

                deleteQBtn.on("click", function (event)
                {
                    for (let i = 0; i < surveyQuestionsArr.length; i++)
                    {
                        if (surveyQuestionsArr[i].questionName1 === questionName)
                        {
                            let optionsArr = surveyQuestionsArr[i].questionOptions;

                            for (let j = 0; j < optionsArr.length; j++)
                            {
                                let removeMarkerObject = 
                                {
                                    name: optionsArr[j].surveyOption,
                                    position: optionsArr[j].latLong
                                }
                                removeMarker(removeMarkerObject);
                            }
                            surveyQuestionsArr.splice(i, 1);
                            questionDiv.remove();
                        }

                        
                    }

                    //console.log(surveyQuestionsArr);
                });

                let surveyQuestion =
                {
                    questionName1: questionName,
                    questionOptions: questionOptionsArr
                }

                surveyQuestionsArr.push(surveyQuestion);
                //console.log(surveyQuestionsArr);

                $("#surveyQuestion").val("");
                $("#questionOptions").empty();
                questionOptionsArr = [];
            }
            else
            {
                if ($("#surveyQuestion").val() === "")
                {
                    $("#surveyQuestion").addClass("not-valid");
                }

                if (questionOptionsArr.length <= 0)
                {
                    $("#questionOptions").addClass("not-valid");
                }

                console.log("Fields cannot be blank")
                return;
            }
        });
    }

    function clearQuestion()
    {
        $("#clearQ").on("click", function (event)
        {
            $("#surveyQuestion").removeClass("not-valid");
            $("#questionOptions").removeClass("not-valid");
            $("#surveyQuestion").val("");
            $("#questionOptions").empty();
            questionOptionsArr = [];
        });
    }

    function addCustomQuestion()
    {
        $("#customQBtn").on("click", function (event)
        {
            event.preventDefault();

            $("#customQ").removeClass("not-valid");
            let customChoice = $("#customQ").val().trim();

            if (customChoice !== "")
            {
                //console.log(customChoice);
                $("#customQ").val("");

                if (!questionOptionsArr.includes(customChoice))
                {
                    questionOptionsArr.push(
                    {
                        surveyOption: customChoice,
                        latLong: null,
                        address: null,
                        isGoogle: false
                    });
                    console.log(questionOptionsArr);

                    let deleteOptionIcon = "<span>&times</span>";
                    let deleteOptionBtn = $("<button>");
                    deleteOptionBtn.addClass("deleteUserBtns");
                    deleteOptionBtn.attr("type", "button");
                    deleteOptionBtn.attr("data-username", customChoice);

                    let questionBox = $("<span>");
                    questionBox.addClass("form-check-label mx-3");
                    questionBox.append(customChoice);

                    let questionDiv = $("<div>");
                    questionDiv.addClass("form-check");

                    deleteOptionBtn.append(deleteOptionIcon);
                    questionDiv.append(deleteOptionBtn);
                    questionDiv.append(questionBox);
                    $("#questionOptions").append(questionDiv);

                    deleteOptionBtn.on("click", function (event)
                    {
                        //Returns the index of the user name in the array.
                        //Returns -1 if not found.
                        for (let j = 0; j < questionOptionsArr.length; j++)
                        {
                            //console.log(questionOptionsArr[j]);

                            //Should always be found but check just to be safe.
                            if (questionOptionsArr[j].surveyOption === customChoice)
                            {
                                questionOptionsArr.splice(j, 1);
                                //console.log(questionOptionsArr);
                                questionDiv.remove();
                            }
                        }
                    });
                }

            }
            else
            {
                $("#customQ").addClass("not-valid");
                console.log("Field cannot be blank");
                return;
            }
        })
    }

    function googlePlacesSearch()
    {
        $("#gPlacesSearch").on("click", function (event)
        {
            event.preventDefault();

            $("#gPlacesLocation").removeClass("not-valid");
            $("#gPlacesState").removeClass("not-valid");
            $("#gPlacesRadius").removeClass("not-valid");

            $("#gPlacesResults").empty();

            let googleLocation = $("#gPlacesLocation").val().trim();
            let googleState = $("#gPlacesState").val().trim();
            let query = googleLocation + ", " + googleState;
            //console.log(query);

            let radius = $("#gPlacesRadius").val().trim();
            let radiusInt = parseInt(radius);
            //console.log(radius);

            if (googleLocation !== "" && googleState !== "" && radiusInt !== "")
            {
                if (isNaN(radiusInt))
                {
                    $("#gPlacesRadius").addClass("not-valid");
                    console.log("radius must be an integer");
                    return;
                }

                $.ajax("/api/places/" + query + "/" + radius,
                {
                    type: "GET"
                }).then(function (data)
                {
                    for (let i = 0; i < data.length; i++)
                    {
                        let address = data[i].formatted_address;
                        let latLong = data[i].geometry.location;
                        let name = data[i].name;

                        let placesBtnIcon = "+";
                        let placesBtn = $("<button>");
                        placesBtn.addClass("addPlacesButton");
                        placesBtn.attr("type", "button");
                        placesBtn.attr("data-username", name);
                        placesBtn.attr("data-address", address)

                        let placesBox = $("<span>");
                        placesBox.addClass("form-check-label d-block border-bottom mx-3");
                        placesBox.append(name);

                        // address
                        let addressBox = $("<span>");
                        addressBox.addClass("form-check-label d-block mx-3");
                        addressBox.append(address);
                        // address

                        placesBtn.append(placesBtnIcon);

                        let buttonCol = $("<div>");
                        buttonCol.addClass("col-md-2");
                        buttonCol.append(placesBtn);

                        let resultsCol = $("<div>");
                        resultsCol.addClass("col-md-10 border-left");
                        resultsCol.append(placesBox);
                        resultsCol.append(addressBox);

                        let placesResult = $("<div>");
                        placesResult.addClass("row form-check result-block");

                        placesResult.append(buttonCol);
                        placesResult.append(resultsCol);

                        $("#gPlacesResults").append(placesResult);

                        placesBtn.on("click", function (event)
                        {
                            let surveyOption = ($(this).attr("data-username"));
                            
                            if (!questionOptionsArr.includes(surveyOption))
                            {
                                questionOptionsArr.push(
                                {
                                    surveyOption: surveyOption,
                                    latLong: latLong,
                                    address: address,
                                    isGoogle: true
                                });
                                //console.log(questionOptionsArr);

                                let deleteOptionIcon = "<span>&times</span>";
                                let deleteOptionBtn = $("<button>");
                                deleteOptionBtn.addClass("deleteUserBtns");
                                deleteOptionBtn.attr("type", "button");
                                deleteOptionBtn.attr("data-username", surveyOption);

                                let questionBox = $("<span>");
                                questionBox.addClass("form-check-label mx-3");
                                questionBox.append(surveyOption);

                                let questionDiv = $("<div>");
                                questionDiv.addClass("form-check");

                                deleteOptionBtn.append(deleteOptionIcon);
                                questionDiv.append(deleteOptionBtn);
                                questionDiv.append(questionBox);

                                $("#questionOptions").append(questionDiv);

                                deleteOptionBtn.on("click", function (event)
                                {
                                    //Returns the index of the user name in the array.
                                    //Returns -1 if not found.
                                    for (let j = 0; j < questionOptionsArr.length; j++)
                                    {
                                        //console.log(questionOptionsArr[j]);

                                        //Should always be found but check just to be safe.
                                        if (questionOptionsArr[j].surveyOption === surveyOption)
                                        {
                                            questionOptionsArr.splice(j, 1);
                                            //console.log(questionOptionsArr);
                                            questionDiv.remove();
                                        }
                                    }
                                });
                            }
                        });
                    }
                });

                $("#gPlacesLocation").val("");
                $("#gPlacesState").val("");
                $("#gPlacesRadius").val("");
            }
            else
            {
                if (isNaN(radiusInt))
                {
                    $("#gPlacesRadius").addClass("not-valid");
                }

                if ($("#gPlacesLocation").val() === "")
                {
                    $("#gPlacesLocation").addClass("not-valid");
                }

                if ($("#gPlacesState").val() === "")
                {
                    $("#gPlacesState").addClass("not-valid");
                }

                console.log("Please make valid selections");
                return;
            }
        });
    }

    //Calculate the center of a map
    let centerMap = function()
    {
        let lat      = 0;
        let lng      = 0;
        let validLat = 0;
        let validLng = 0;
        let zoom     = 9;

        //average all the latitudes and longitudes to find center of map.
        for(let i = 0; i < markers.length; i++)
        {
            if(markers[i].position.lat() !== null)
            {
                lat += markers[i].position.lat();
                validLat++;
            }

            if(markers[i].position.lng() !== null)
            {
                lng += markers[i].position.lng();
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

        map.panTo({lat: lat, lng: lng});
        map.setZoom(zoom);
    }

    // function to add a marker to google map
    function addMarker(mapSelectionObject)
    {
        console.log(mapSelectionObject);
        // creates a marker and adds it to google maps
        let thisMarker = new google.maps.Marker(
        {
            position: { lat: mapSelectionObject.lat, lng: mapSelectionObject.lng },
            map: map,
            title: mapSelectionObject.surveyOption
        });
        
        // adds a new marker to the markers array
        markers.push(thisMarker);
        centerMap();
    }

    function removeMarker(mapSelectionObject)
    {
        for (let i = 0; i < markers.length; i++)
        {
            if
            (
                markers[i].title === mapSelectionObject.name &&
                markers[i].position.lat().toFixed(5) === mapSelectionObject.position.lat.toFixed(5) &&
                markers[i].position.lng().toFixed(5) === mapSelectionObject.position.lng.toFixed(5)
            )
            {
                // removes the marker from the map and the marker array.
                markers[i].setMap(null);
                markers.splice(i, 1);
            }
        }
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

    getSurveys();
    setInterval(function(){getSurveys();}, 3000);
});