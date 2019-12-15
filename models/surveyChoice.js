//Creating our survey model
module.exports = function(sequelize, DataTypes)
{
    let SurveyChoice = sequelize.define("SurveyChoice",
    {
        description:
        {
            type: DataTypes.STRING,
            allowNull: false
        },

        isGoogle:
        {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },

        selectedCount:
        {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },

        latitude:
        {
            type: DataTypes.DOUBLE
        },

        longitude:
        {
            type: DataTypes.DOUBLE
        },

        surveyId:
        {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        //General purpose data slots for future expansion.
        data0:
        {
            type: DataTypes.TEXT
        },

        data1:
        {
            type: DataTypes.TEXT
        },

        data2:
        {
            type: DataTypes.TEXT
        },

        data3:
        {
            type: DataTypes.TEXT
        },

        data4:
        {
            type: DataTypes.TEXT
        },

        data5:
        {
            type: DataTypes.TEXT
        },

        data6:
        {
            type: DataTypes.TEXT
        },

        data7:
        {
            type: DataTypes.TEXT
        },

        data8:
        {
            type: DataTypes.TEXT
        },

        data9:
        {
            type: DataTypes.TEXT
        }
    });

    SurveyChoice.associate = function(models)
    {
        SurveyChoice.hasMany(models.SurveyResponse,
        {
            onDelete: "cascade"
        });
    }

    SurveyChoice.associate = function(models)
    {
        SurveyChoice.belongsTo(models.SurveyQuestion,
        {
            onDelete: "cascade",
            foreignKey:
            {
                allowNull: false
            }
        });
    };

    return SurveyChoice; 
};