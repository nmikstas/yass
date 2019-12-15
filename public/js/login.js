$(document).ready(function()
{
    // Getting references to our form and inputs
    var loginForm     = $("form.login");
    var usernameInput = $("input#username-input");
    var passwordInput = $("input#password-input");

    //When the form is submitted, we validate there's a user name and password entered
    loginForm.on("submit", function(event)
    {
        event.preventDefault();
      
        var userData =
        {
            username: usernameInput.val().trim(),
            password: passwordInput.val().trim()
        };

        if (!userData.username || !userData.password)
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

        //If we have an email and password we run the loginUser function and clear the form
        loginUser(userData.username, userData.password);
        usernameInput.val("");
        passwordInput.val("");
    });

    //loginUser does a post to our "api/login" route and if successful, redirects us the the members page
    function loginUser(username, password)
    {
        $.post("/api/login",
        {
            username: username,
            password: password
        })
        .then(function()
        {
            window.location.assign("/home");  
        })
        .catch(function(err) //Catch an invalid user name or password.
        {
            $(".info-message").empty();
            $(".info-message").append
            (
                "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<strong>Login Error!</strong> Invalid user name or password." +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button></div>"
            );
        });
    }
});
