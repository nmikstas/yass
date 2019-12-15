//Creating our survey model
module.exports = function(sequelize, DataTypes)
{
    let DistributionList = sequelize.define("DistributionList",
    {
        username:
        {
            type: DataTypes.STRING,
            allowNull: false
        },

        list:
        {
            type: DataTypes.TEXT,
            allowNull: false
        },

        title:
        {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return DistributionList; 
};