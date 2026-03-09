const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
    departmentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    departmentName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Full name of the department',
    },
    departmentAcr: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'Short code / abbreviation',
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Archived'),
        allowNull: false,
        defaultValue: 'Active',
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Company ID for multi-tenant support'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this department'
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this department'
    }
}, {
    tableName: 'departments',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    paranoid: true,
    deletedAt: 'deletedAt',
    indexes: [
        {
            unique: true,
            fields: ['companyId', 'departmentName'],
            name: 'unique_company_department_name',
        },
        {
            unique: true,
            fields: ['companyId', 'departmentAcr'],
            name: 'unique_company_department_acr',
        },
        {
            fields: ['companyId', 'status'],
            name: 'idx_company_department_status',
        },
    ],
});

module.exports = Department;
