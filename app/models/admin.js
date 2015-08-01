// app/models/person.js

var bcrypt   = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define("Admin", {
		first_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		last_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		permission: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "Undefined"
		}
	},{
		instanceMethods: {
			validPassword: function(password) {
				return bcrypt.compareSync(password, this.password);
			}
		}, classMethods: {
			generateHash: function(password) {
				return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
			}
		}
	});
};