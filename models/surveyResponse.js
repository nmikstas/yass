//Creating our survey model
module.exports = function(sequelize, DataTypes)
{
    let SurveyResponse = sequelize.define("SurveyResponse",
    {
        username:
        {
            type: DataTypes.STRING,
            allowNull: false,
        },

        surveyId:
        {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        questionId:
        {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    SurveyResponse.associate = function(models)
    {
        SurveyResponse.belongsTo(models.SurveyChoice,
        {
            onDelete: "cascade",
            foreignKey:
            {
                allowNull: false
            }
        });
    };

    return SurveyResponse; 
};