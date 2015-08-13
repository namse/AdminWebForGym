// app/models/person.js
module.exports = function(sequelize, DataTypes) {
	return sequelize.define("Member", {
		firstName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});
};