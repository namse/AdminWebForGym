// app/models/person.js
module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Member", {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};