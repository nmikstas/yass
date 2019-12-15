let debug = true;
let userSurveys = [];
let username = $(".navbar-user").attr("data-username");

$(document).ready(function () {
    // Getting references to our form and input
    var emailForm = $("form.emailForm");
    var passwordForm = $("form.passwordForm");
    var emailInput = $("input#email-input");
    var passwordInput = $("input#password-input");
    var confirmInput = $("input#confirm-input");

    passwordForm.on("submit", function (event) {
        event.preventDefault();
        var password1 = passwordInput.val().trim()
        var password2 = confirmInput.val().trim()

        if (password1 === '') {
            $("#password-message").empty();
            $("#password-message").append

            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Blank Fields!</strong> Please fill out all the fields." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );


            return;
        } else if (password2 === '') {
            $("#password-message").empty();
            $("#password-message").append

            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Blank Fields!</strong> Please fill out all the fields." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );



            return;
        } else if (password1 !== password2) {
            $("#password-message").empty();
            $("#password-message").append

            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Passwords Do Not Match!</strong> Ensure the password is correct." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );


            return;
        }

        //Change the user's password.
        $.ajax("/api/putpassword/" + username + "/" + password1, {
                type: "PUT"
            })
            .then(function () {
                if (debug) console.log("Password Changed");
                alert("Password Changed");
                passwordInput.val("");
                confirmInput.val("");
            });
    })

    // When the signup button is clicked, we validate the email and password are not blank
    emailForm.on("submit", function (event) {
        event.preventDefault();
        $("#email-message").empty();

        var emailData = {
            email: emailInput.val().trim()
        };

        //Make sure there are no blank fields.
        if (!emailData.email) {
            $("#email-message").empty();
            $("#email-message").append

            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Blank Fields!</strong> Please fill out all the fields." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );
            return;
        }

        //Crazy RegEx magic for validating email string.
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailInput.val().trim())) {
            $("#email-message").empty();


            $("#email-message").append(
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Bad Email!</strong> Please verify your email address." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );
            return;
        }

        //Change the users' email.
        $.ajax("/api/putemail/" + username + "/" + emailInput.val().trim(), {
                type: "PUT"
            })
            .then(function () {
                if (debug) console.log("Email Changed");
                alert("Email Changed");
                emailInput.val("");
            });
    })

    //Figure out how many surveys have not been read.
    let calcUnread = function () {
        let unread = 0;
        for (let i = 0; i < userSurveys.length; i++) {
            if (!userSurveys[i].isRead) {
                unread++;
            }
        }
        $("#unread-div").text(unread);
    }

    let getSurveys = function () {
        //Grab all the surveys the user is a part of.
        $.get("/api/usersurveys/" + username)
            .then(function (data) {
                if (debug) console.log(data);
                userSurveys = data;

                //Calculate how many unread surveys there are.
                calcUnread();
            })
            .fail(function (err) {
                throw err;
            });
    }

    //Change the user's email notification setting.
    $("#exampleCheck1").on("click", function () {
        let isChecked = $("#exampleCheck1").prop("checked");

        //Send the PUT request.
        $.ajax("/api/putnotification/" + username + "/" + isChecked, {
                type: "PUT"
            })
            .then(function () {
                if (debug) console.log("Email notification changed");
            });
    })

    //Get the user's email notification status and update the page accordingly.
    let getNotifications = function () {
        $.get("/api/getnotification/" + username)
            .then(function (data) {
                if (debug) console.log(data);


                if (data.allowNotifications) {
                    $("#exampleCheck1").prop("checked", true);
                } else {
                    $("#exampleCheck1").prop("checked", false);
                }

            })
            .fail(function (err) {
                throw err;
            });
    }

    getSurveys();
    setInterval(function () {
        getSurveys();
    }, 3000);
    getNotifications();
});