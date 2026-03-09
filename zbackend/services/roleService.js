// Role Service - Business Logic for Role Management
const { Role, User } = require('../models');
const { Op } = require('sequelize');

class RoleService {
    /**
     * Get all roles
     */
    async getAllRoles(filters = {}) {
        const { status, search, page = 1, limit = 50 } = filters;

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.roleName = { [Op.like]: `%${search}%` };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows: roles, count: total } = await Role.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email', 'userName', 'userMail'],
                    required: false
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'name', 'email', 'userName', 'userMail'],
                    required: false
                }
            ],
            order: [['roleName', 'ASC']],
            limit: parseInt(limit),
            offset: offset
        });

        return {
            roles,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    /**
     * Get role by ID
     */
    async getRoleById(roleId) {
        const role = await Role.findByPk(roleId, {
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'userId', 'name', 'userName', 'email', 'userMail'],
                    limit: 10,
                    order: [['created_at', 'DESC']]
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email', 'userName', 'userMail'],
                    required: false
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'name', 'email', 'userName', 'userMail'],
                    required: false
                }
            ]
        });

        if (!role) {
            throw new Error('Role not found');
        }

        return role;
    }

    /**
     * Create new role
     */
    async createRole(roleData, userId) {
        const { roleName, status = 'Active' } = roleData;

        // Check if role already exists
        const existingRole = await Role.findOne({
            where: { roleName }
        });

        if (existingRole) {
            throw new Error('Role already exists');
        }

        const role = await Role.create({
            roleName,
            status,
            createdBy: userId,
            updatedBy: userId
        });

        return role;
    }

    /**
     * Update role
     */
    async updateRole(roleId, roleData, userId) {
        const role = await Role.findByPk(roleId);

        if (!role) {
            throw new Error('Role not found');
        }

        const { roleName, status } = roleData;

        // Check if new role name already exists (if changing name)
        if (roleName && roleName !== role.roleName) {
            const existingRole = await Role.findOne({
                where: { 
                    roleName,
                    roleId: { [Op.ne]: roleId }
                }
            });

            if (existingRole) {
                throw new Error('Role name already exists');
            }
        }

        await role.update({
            ...(roleName && { roleName }),
            ...(status && { status }),
            updatedBy: userId
        });

        return role;
    }

    /**
     * Delete role (soft delete)
     */
    async deleteRole(roleId) {
        const role = await Role.findByPk(roleId);

        if (!role) {
            throw new Error('Role not found');
        }

        // Check if role is assigned to any users
        const usersCount = await User.count({
            where: { roleId }
        });

        if (usersCount > 0) {
            throw new Error(`Cannot delete role. It is assigned to ${usersCount} user(s).`);
        }

        await role.destroy();

        return { message: 'Role deleted successfully' };
    }

    /**
     * Get role statistics
     */
    async getRoleStats() {
        const totalRoles = await Role.count();
        const activeRoles = await Role.count({ where: { status: 'Active' } });
        const inactiveRoles = await Role.count({ where: { status: 'Inactive' } });

        // Get user count per role
        const rolesWithUserCount = await Role.findAll({
            attributes: [
                'roleId',
                'roleName',
                [require('../config/database').sequelize.fn('COUNT', require('../config/database').sequelize.col('users.id')), 'userCount']
            ],
            include: [{
                model: User,
                as: 'users',
                attributes: [],
                required: false
            }],
            group: ['Role.roleId', 'Role.roleName']
        });

        return {
            total: totalRoles,
            active: activeRoles,
            inactive: inactiveRoles,
            userDistribution: rolesWithUserCount
        };
    }
}

module.exports = new RoleService();
