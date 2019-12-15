//Creating our survey model
module.exports = function(sequelize, DataTypes)
{
    let SurveyQuestion = sequelize.define("SurveyQuestion",
    {
        question:
        {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    SurveyQuestion.associate = function(models)
    {
        SurveyQuestion.hasMany(models.SurveyChoice,
        {
            onDelete: "cascade"
        });
    };

    SurveyQuestion.associate = function(models)
    {
        SurveyQuestion.belongsTo(models.Survey,
        {
            onDelete: "cascade",
            foreignKey:
            {
                allowNull: false
            }
        });
    };

    return SurveyQuestion; 
};