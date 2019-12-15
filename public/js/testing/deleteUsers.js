let doDelete = function()
{
    let id = $(this).attr("id");

    console.log("ID to delete: " + id);

    // Send the DELETE request.
    $.ajax("/test/delete/" + id,
    {
        type: "DELETE"
    })
    .then(function()
    {
        location.reload();
    });
};

let getUsers = function()
{

    // Send the GET request.
    $.ajax("/test/getusers",
    {
        type: "GET"
    }).then(function(data)
    {
        console.log(data);

        for(let i = 0; i < data.length; i++)
        {
            let userDiv = $("<div>");
            userDiv.append("<h6 style=\"margin-left: 200px; display: inline\">User Name: " + data[i].username + " </h6>");
            let deleteBtn = $("<button style=\"margin-left: 20px;\">");
            deleteBtn.attr("id", data[i].id);
            deleteBtn.append("Delete");
            deleteBtn.addClass("delete-btn");
            deleteBtn.on("click", doDelete);
            userDiv.append(deleteBtn);

            $("#users-div").append(userDiv);
        }
    });
}

$(document).ready(getUsers);