//Creating our survey model
module.exports = function(sequelize, DataTypes)
{
    let SurveyComment = sequelize.define("SurveyComment",
    {
        comment:
        {
            type: DataTypes.STRING,
            allowNull: false
        },

        username:
        {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    SurveyComment.associate = function(models)
    {
        SurveyComment.belongsTo(models.Survey,
        {
            onDelete: "cascade",
            foreignKey:
            {
                allowNull: false
            }
        });
    };

    return SurveyComment; 
};