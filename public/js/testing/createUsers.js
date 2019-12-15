let index = 0;
let usernames =
[
    "test"      , "Greg"    , "Hank"  , "Hannah"   , "Jennifer" ,
    "Jules"     ,"Flippers" , "George", "BigMan69" , "Epstein"
    /*
    "Grungy1106", "Bob"     , "Jake"  , "Jim"      , "Samantha" ,
    "Julie"     , "Elijah"  , "Chris" , "Sultan"   , "Humphrey" ,
    "Jack"      , "Jojo"    , "Mark"  , "DannyBoy" , "Davie504"
    */
];

let genUsers = function()
{
    let username = usernames[index];
    let email = username + "@email.com";
    let password = username;

    $.post("/api/signup",
    {
        username: username,
        email:    email,
        password: password
    })
    .then(function(data)
    {
        $("#users-div").append("<h6 style=\"margin-left: 200px;\">User Name: " + username +
                               ", Email: " + email + ", Password: " + password + "</h6>");

        index++;

        if(index < usernames.length)
        {
            genUsers();
        }
        else
        {
            window.location.replace("../logout");
        }
    })
    .fail(function(err)
    {
        $("#users-div").append("<h6 style=\"margin-left: 200px;\">***ERROR*** User Not Created: " + username  + "</h6>");

        index++;

        if(index < usernames.length)
        {
            genUsers();
        }
        else
        {
            window.location.replace("../logout");
        }
    })
}

$(document).ready(genUsers);