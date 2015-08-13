// app/models/club.js

var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define("InvitationToken", {
		permission: {
			type: DataTypes.STRING,
			allowNull: false
		},
		expired: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isEmail: true
			}
		}
	}, {
		classMethods: {
			generateToken: function(count) {
				return bcrypt.hashSync(count.toString(), bcrypt.genSaltSync(8));
			}
		}
	});
};