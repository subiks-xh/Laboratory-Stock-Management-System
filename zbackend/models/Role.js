const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
    roleId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    roleName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Role name (e.g., "Staff", "Admin", "Department Admin")',
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active',
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this role'
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this role'
    }
}, {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    paranoid: true,
    deletedAt: 'deletedAt',
    indexes: [
        {
            unique: true,
            fields: ['roleName'],
            name: 'unique_role_name',
        },
        {
            fields: ['status'],
            name: 'idx_role_status',
        },
    ],
});

module.exports = Role;
