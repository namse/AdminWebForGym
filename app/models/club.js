// app/models/club.js
module.exports = function(sequelize, DataTypes) {
	return sequelize.define("Club", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		}
	});

};