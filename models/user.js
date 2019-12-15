//Requiring bcrypt for password hashing. Using the bcryptjs version as the
//regular bcrypt module sometimes causes errors on Windows machines
let bcrypt = require("bcryptjs");

//Creating our User model
module.exports = function(sequelize, DataTypes)
{
    let User = sequelize.define("User",
    {
        //The username must be unique.
        username:
        {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        email:
        {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate:
            {
                isEmail: true
            }
        },

        password:
        {
            type: DataTypes.STRING,
            allowNull: false
        },

        allowNotifications:
        {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        surveyCount:
        {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        unreadSurveys:
        {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    User.associate = function(models)
    {
        User.hasMany(models.Survey,
        {
            onDelete: "cascade"
        });
    };

    User.associate = function(models)
    {
        User.hasMany(models.DistributionList,
        {
            onDelete: "cascade"
        });
    };

    //Creating a custom method for our User model. This will check if an unhashed password
    //entered by the user can be compared to the hashed password stored in our database
    User.prototype.validPassword = function(password)
    {
        return bcrypt.compareSync(password, this.password);
    };

    // Hooks are automatic methods that run during various phases of the User Model lifecycle
    // In this case, before a User is created, we will automatically hash their password
    User.addHook("beforeCreate", function(user)
    {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    });

    return User;
};
