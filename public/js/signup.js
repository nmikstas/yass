$(document).ready(function()
{
    // Getting references to our form and input
    var signUpForm    = $("form.signup");
    var usernameInput = $("input#username-input");
    var emailInput    = $("input#email-input");
    var passwordInput = $("input#password-input");
    var confirmInput  = $("input#confirm-input");

    // When the signup button is clicked, we validate the email and password are not blank
    signUpForm.on("submit", function(event)
    {
        event.preventDefault();

        var userData =
        {
            username: usernameInput.val().trim(),
            email:    emailInput.val().trim(),
            password: passwordInput.val().trim()
        };

        //Make sure there are no blank fields.
        if (!userData.username || !userData.email || !userData.password)
        {
            $(".info-message").empty();
            $(".info-message").append
            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Blank Fields!</strong> Please fill out all the fields." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );
            return;
        }

        //Make sure the passwords match.
        if(userData.password !== confirmInput.val().trim())
        {
            $(".info-message").empty();
            $(".info-message").append
            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Password Mismatch!</strong> Please verify your password." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );
            return;
        }

        //Crazy RegEx magic for validating email string.
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailInput.val().trim()))
        {
            $(".info-message").empty();
            $(".info-message").append
            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Bad Email!</strong> Please verify your email address." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );
            return;
        }

        // If we have a user name, email and password, run the signUpUser function
        signUpUser(userData.username, userData.email, userData.password);

        usernameInput.val("");
        emailInput.val("");
        passwordInput.val("");
        confirmInput.val("");
    });

    //Does a post to the signup route. If successful, we are redirected to the members page
    //Otherwise we log any errors
    function signUpUser(username, email, password)
    {
        $.post("/api/signup",
        {
            username: username,
            email:    email,
            password: password
        })
        .then(function(data)
        {
            window.location.assign("/home");
        })
        .catch(function(err) //Check for existing user.
        {
            $(".info-message").empty();
            $(".info-message").append
            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Invalid User Name!</strong> User name already taken." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );
        });
    }    
});
