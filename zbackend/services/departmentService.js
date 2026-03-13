// Department Service - Business Logic for Department Management
const { Department, User } = require('../models');
const { Op } = require('sequelize');

class DepartmentService {
    /**
     * Get all departments
     */
    async getAllDepartments(filters = {}) {
        const { status, companyId, search, page = 1, limit = 50 } = filters;

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (companyId !== undefined) {
            whereClause.companyId = companyId;
        }

        if (search) {
            whereClause[Op.or] = [
                { departmentName: { [Op.like]: `%${search}%` } },
                { departmentAcr: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows: departments, count: total } = await Department.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: [['userId', 'id'], ['userName', 'name'], ['userMail', 'email']],
                    required: false
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: [['userId', 'id'], ['userName', 'name'], ['userMail', 'email']],
                    required: false
                }
            ],
            order: [['departmentName', 'ASC']],
            limit: parseInt(limit),
            offset: offset
        });

        return {
            departments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    /**
     * Get department by ID
     */
    async getDepartmentById(departmentId) {
        const department = await Department.findByPk(departmentId, {
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: [['userId', 'id'], 'userId', ['userName', 'name'], 'userName', ['userMail', 'email'], 'userMail', 'roleId'],
                    limit: 10,
                    order: [['created_at', 'DESC']]
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: [['userId', 'id'], ['userName', 'name'], ['userMail', 'email']],
                    required: false
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: [['userId', 'id'], ['userName', 'name'], ['userMail', 'email']],
                    required: false
                }
            ]
        });

        if (!department) {
            throw new Error('Department not found');
        }

        return department;
    }

    /**
     * Create new department
     */
    async createDepartment(departmentData, userId) {
        const { departmentName, departmentAcr, status = 'Active', companyId = 0 } = departmentData;

        // Check if department already exists for this company
        const existingDepartment = await Department.findOne({
            where: { 
                companyId,
                [Op.or]: [
                    { departmentName },
                    { departmentAcr }
                ]
            }
        });

        if (existingDepartment) {
            throw new Error('Department name or abbreviation already exists for this company');
        }

        const department = await Department.create({
            departmentName,
            departmentAcr,
            status,
            companyId,
            createdBy: userId,
            updatedBy: userId
        });

        return department;
    }

    /**
     * Update department
     */
    async updateDepartment(departmentId, departmentData, userId) {
        const department = await Department.findByPk(departmentId);

        if (!department) {
            throw new Error('Department not found');
        }

        const { departmentName, departmentAcr, status } = departmentData;

        // Check if new department name/acr already exists (if changing)
        if (departmentName || departmentAcr) {
            const checkConditions = [];
            if (departmentName && departmentName !== department.departmentName) {
                checkConditions.push({ departmentName });
            }
            if (departmentAcr && departmentAcr !== department.departmentAcr) {
                checkConditions.push({ departmentAcr });
            }

            if (checkConditions.length > 0) {
                const existingDepartment = await Department.findOne({
                    where: {
                        companyId: department.companyId,
                        departmentId: { [Op.ne]: departmentId },
                        [Op.or]: checkConditions
                    }
                });

                if (existingDepartment) {
                    throw new Error('Department name or abbreviation already exists for this company');
                }
            }
        }

        await department.update({
            ...(departmentName && { departmentName }),
            ...(departmentAcr && { departmentAcr }),
            ...(status && { status }),
            updatedBy: userId
        });

        return department;
    }

    /**
     * Delete department (soft delete)
     */
    async deleteDepartment(departmentId) {
        const department = await Department.findByPk(departmentId);

        if (!department) {
            throw new Error('Department not found');
        }

        // Check if department is assigned to any users
        const usersCount = await User.count({
            where: { departmentId }
        });

        if (usersCount > 0) {
            throw new Error(`Cannot delete department. It has ${usersCount} user(s) assigned.`);
        }

        await department.destroy();

        return { message: 'Department deleted successfully' };
    }

    /**
     * Get department statistics
     */
    async getDepartmentStats(companyId = 0) {
        const whereClause = { companyId };

        const totalDepartments = await Department.count({ where: whereClause });
        const activeDepartments = await Department.count({ 
            where: { ...whereClause, status: 'Active' } 
        });
        const inactiveDepartments = await Department.count({ 
            where: { ...whereClause, status: 'Inactive' } 
        });
        const archivedDepartments = await Department.count({ 
            where: { ...whereClause, status: 'Archived' } 
        });

        // Get user count per department
        const departmentsWithUserCount = await Department.findAll({
            where: whereClause,
            attributes: [
                'departmentId',
                'departmentName',
                'departmentAcr',
                [require('../config/database').sequelize.fn('COUNT', require('../config/database').sequelize.col('users.userId')), 'userCount']
            ],
            include: [{
                model: User,
                as: 'users',
                attributes: [],
                required: false
            }],
            group: ['Department.departmentId', 'Department.departmentName', 'Department.departmentAcr']
        });

        return {
            total: totalDepartments,
            active: activeDepartments,
            inactive: inactiveDepartments,
            archived: archivedDepartments,
            userDistribution: departmentsWithUserCount
        };
    }
}

module.exports = new DepartmentService();
