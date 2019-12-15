//Creating our survey model
module.exports = function(sequelize, DataTypes)
{
    let SurveyTaker = sequelize.define("SurveyTaker",
    {
        username:
        {
            type: DataTypes.STRING,
            allowNull: false,
        },

        isRead:
        {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        isStarred:
        {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    SurveyTaker.associate = function(models)
    {
        SurveyTaker.belongsTo(models.Survey,
        {
            onDelete: "cascade",
            foreignKey:
            {
                allowNull: false
            }
        });
    };
    
    return SurveyTaker; 
};