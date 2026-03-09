/**
 * Migration: Add Role and Department Tables + Update Users
 * 
 * This migration:
 * 1. Creates roles table
 * 2. Creates departments table
 * 3. Adds default roles from existing ENUMs
 * 4. Adds new fields to users table
 * 5. Migrates existing user data
 * 6. Creates necessary indexes
 */

const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            console.log('🔄 Starting migration: Add Role and Department tables...\n');

            // ============= STEP 1: CREATE ROLES TABLE =============
            console.log('📋 Step 1: Creating roles table...');
            await queryInterface.createTable('roles', {
                roleId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                roleName: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                },
                status: {
                    type: DataTypes.ENUM('Active', 'Inactive'),
                    allowNull: false,
                    defaultValue: 'Active',
                },
                createdBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                updatedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                },
                deletedAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                }
            }, { transaction });
            console.log('✅ Roles table created\n');

            // ============= STEP 2: CREATE DEPARTMENTS TABLE =============
            console.log('📋 Step 2: Creating departments table...');
            await queryInterface.createTable('departments', {
                departmentId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                departmentName: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                departmentAcr: {
                    type: DataTypes.STRING(10),
                    allowNull: false,
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
                },
                createdBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                updatedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                },
                deletedAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                }
            }, { transaction });
            console.log('✅ Departments table created\n');

            // ============= STEP 3: INSERT DEFAULT ROLES =============
            console.log('📋 Step 3: Inserting default roles...');
            const defaultRoles = [
                { roleName: 'Student', status: 'Active' },
                { roleName: 'Faculty', status: 'Active' },
                { roleName: 'Teacher', status: 'Active' },
                { roleName: 'Lab Assistant', status: 'Active' },
                { roleName: 'Lab Technician', status: 'Active' },
                { roleName: 'Admin', status: 'Active' },
            ];

            for (const role of defaultRoles) {
                await queryInterface.bulkInsert('roles', [{
                    ...role,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }], { transaction });
                console.log(`  ✓ Created role: ${role.roleName}`);
            }
            console.log('✅ Default roles inserted\n');

            // ============= STEP 4: INSERT DEFAULT DEPARTMENTS =============
            console.log('📋 Step 4: Inserting default departments from existing user data...');
            
            // Get unique departments from existing users
            const [existingDepartments] = await queryInterface.sequelize.query(
                `SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND department != ''`,
                { transaction }
            );

            if (existingDepartments.length > 0) {
                for (const dept of existingDepartments) {
                    const deptName = dept.department;
                    const deptAcr = deptName.substring(0, 10).toUpperCase();
                    
                    await queryInterface.bulkInsert('departments', [{
                        departmentName: deptName,
                        departmentAcr: deptAcr,
                        status: 'Active',
                        companyId: 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }], { transaction });
                    console.log(`  ✓ Created department: ${deptName} (${deptAcr})`);
                }
            }
            console.log('✅ Departments inserted\n');

            // ============= STEP 5: ADD NEW COLUMNS TO USERS TABLE =============
            console.log('📋 Step 5: Adding new columns to users table...');
            
            // Add companyId
            await queryInterface.addColumn('users', 'companyId', {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            }, { transaction });
            console.log('  ✓ Added companyId');

            // Add departmentId
            await queryInterface.addColumn('users', 'departmentId', {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'departments',
                    key: 'departmentId'
                },
                onDelete: 'SET NULL'
            }, { transaction });
            console.log('  ✓ Added departmentId');

            // Add userNumber (will be populated from student_id or generated)
            await queryInterface.addColumn('users', 'userNumber', {
                type: DataTypes.STRING(50),
                allowNull: true, // Allow null during migration
            }, { transaction });
            console.log('  ✓ Added userNumber');

            // Add userName (will be populated from name)
            await queryInterface.addColumn('users', 'userName', {
                type: DataTypes.STRING(255),
                allowNull: true,
            }, { transaction });
            console.log('  ✓ Added userName');

            // Add userMail (will be populated from email)
            await queryInterface.addColumn('users', 'userMail', {
                type: DataTypes.STRING(255),
                allowNull: true, // Allow null during migration
            }, { transaction });
            console.log('  ✓ Added userMail');

            // Add roleId
            await queryInterface.addColumn('users', 'roleId', {
                type: DataTypes.INTEGER,
                allowNull: true, // Allow null during migration
                references: {
                    model: 'roles',
                    key: 'roleId'
                },
                onDelete: 'RESTRICT'
            }, { transaction });
            console.log('  ✓ Added roleId');

            // Add userId (will become new primary key)
            await queryInterface.addColumn('users', 'userId', {
                type: DataTypes.INTEGER,
                allowNull: true, // Allow null during migration
            }, { transaction });
            console.log('  ✓ Added userId');

            // Add status
            await queryInterface.addColumn('users', 'status', {
                type: DataTypes.ENUM('Active', 'Inactive'),
                defaultValue: 'Active',
            }, { transaction });
            console.log('  ✓ Added status');

            // Add profileImage
            await queryInterface.addColumn('users', 'profileImage', {
                type: DataTypes.STRING(500),
                defaultValue: '/uploads/default.jpg',
            }, { transaction });
            console.log('  ✓ Added profileImage');

            // Add authProvider
            await queryInterface.addColumn('users', 'authProvider', {
                type: DataTypes.ENUM('local', 'google'),
                defaultValue: 'local',
            }, { transaction });
            console.log('  ✓ Added authProvider');

            // Add resetOTP
            await queryInterface.addColumn('users', 'resetOTP', {
                type: DataTypes.STRING(255),
                allowNull: true,
            }, { transaction });
            console.log('  ✓ Added resetOTP');

            // Add resetOTPExpires
            await queryInterface.addColumn('users', 'resetOTPExpires', {
                type: DataTypes.DATE,
                allowNull: true,
            }, { transaction });
            console.log('  ✓ Added resetOTPExpires');

            console.log('✅ New columns added to users table\n');

            // ============= STEP 6: MIGRATE EXISTING USER DATA =============
            console.log('📋 Step 6: Migrating existing user data...');
            
            // Update userId = id
            await queryInterface.sequelize.query(
                `UPDATE users SET userId = id`,
                { transaction }
            );
            console.log('  ✓ Populated userId from id');

            // Update userName from name
            await queryInterface.sequelize.query(
                `UPDATE users SET userName = name`,
                { transaction }
            );
            console.log('  ✓ Populated userName from name');

            // Update userMail from email
            await queryInterface.sequelize.query(
                `UPDATE users SET userMail = email`,
                { transaction }
            );
            console.log('  ✓ Populated userMail from email');

            // Update userNumber from student_id, or generate from userId
            await queryInterface.sequelize.query(
                `UPDATE users SET userNumber = COALESCE(student_id, CONCAT('USR', LPAD(id, 6, '0')))`,
                { transaction }
            );
            console.log('  ✓ Populated userNumber from student_id');

            // Update status based on is_active
            await queryInterface.sequelize.query(
                `UPDATE users SET status = CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END`,
                { transaction }
            );
            console.log('  ✓ Populated status from is_active');

            // Update authProvider based on google_id
            await queryInterface.sequelize.query(
                `UPDATE users SET authProvider = CASE WHEN google_id IS NOT NULL THEN 'google' ELSE 'local' END`,
                { transaction }
            );
            console.log('  ✓ Populated authProvider');

            // Map roleId from role ENUM
            const roleMapping = {
                'student': 1,
                'faculty': 2,
                'teacher': 3,
                'lab_assistant': 4,
                'lab_technician': 5,
                'admin': 6
            };

            for (const [roleName, roleId] of Object.entries(roleMapping)) {
                await queryInterface.sequelize.query(
                    `UPDATE users SET roleId = ${roleId} WHERE role = '${roleName}'`,
                    { transaction }
                );
            }
            console.log('  ✓ Mapped roleId from role ENUM');

            // Map departmentId from department string
            const [departments] = await queryInterface.sequelize.query(
                `SELECT departmentId, departmentName FROM departments`,
                { transaction }
            );

            for (const dept of departments) {
                await queryInterface.sequelize.query(
                    `UPDATE users SET departmentId = ${dept.departmentId} WHERE department = '${dept.departmentName}'`,
                    { transaction }
                );
            }
            console.log('  ✓ Mapped departmentId from department');

            console.log('✅ User data migrated\n');

            // ============= STEP 7: CREATE INDEXES =============
            console.log('📋 Step 7: Creating indexes...');
            
            await queryInterface.addIndex('users', ['userMail'], {
                unique: true,
                name: 'unique_userMail',
                transaction
            });
            console.log('  ✓ Created unique index on userMail');

            await queryInterface.addIndex('users', ['userNumber'], {
                unique: true,
                name: 'unique_userNumber',
                transaction
            });
            console.log('  ✓ Created unique index on userNumber');

            await queryInterface.addIndex('users', ['roleId'], {
                name: 'idx_roleId',
                transaction
            });
            console.log('  ✓ Created index on roleId');

            await queryInterface.addIndex('users', ['departmentId'], {
                name: 'idx_departmentId',
                transaction
            });
            console.log('  ✓ Created index on departmentId');

            await queryInterface.addIndex('users', ['status'], {
                name: 'idx_status',
                transaction
            });
            console.log('  ✓ Created index on status');

            await queryInterface.addIndex('users', ['companyId'], {
                name: 'idx_companyId',
                transaction
            });
            console.log('  ✓ Created index on companyId');

            console.log('✅ Indexes created\n');

            // ============= STEP 8: UPDATE CONSTRAINTS =============
            console.log('📋 Step 8: Finalizing constraints...');
            
            // Make new fields NOT NULL after populating
            await queryInterface.changeColumn('users', 'userMail', {
                type: DataTypes.STRING(255),
                allowNull: false,
            }, { transaction });

            await queryInterface.changeColumn('users', 'userNumber', {
                type: DataTypes.STRING(50),
                allowNull: false,
            }, { transaction });

            await queryInterface.changeColumn('users', 'roleId', {
                type: DataTypes.INTEGER,
                allowNull: false,
            }, { transaction });

            console.log('✅ Constraints finalized\n');

            await transaction.commit();
            console.log('🎉 Migration completed successfully!');
            console.log('\n⚠️  NOTE: Old columns (id, name, email, role, student_id, department, is_active) are still present.');
            console.log('   Run the cleanup migration to remove them after verifying the data.\n');

        } catch (error) {
            await transaction.rollback();
            console.error('❌ Migration failed:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            console.log('🔄 Rolling back migration...\n');

            // Remove new columns from users table
            await queryInterface.removeColumn('users', 'userId', { transaction });
            await queryInterface.removeColumn('users', 'companyId', { transaction });
            await queryInterface.removeColumn('users', 'departmentId', { transaction });
            await queryInterface.removeColumn('users', 'userNumber', { transaction });
            await queryInterface.removeColumn('users', 'userName', { transaction });
            await queryInterface.removeColumn('users', 'userMail', { transaction });
            await queryInterface.removeColumn('users', 'roleId', { transaction });
            await queryInterface.removeColumn('users', 'status', { transaction });
            await queryInterface.removeColumn('users', 'profileImage', { transaction });
            await queryInterface.removeColumn('users', 'authProvider', { transaction });
            await queryInterface.removeColumn('users', 'resetOTP', { transaction });
            await queryInterface.removeColumn('users', 'resetOTPExpires', { transaction });

            // Drop departments table
            await queryInterface.dropTable('departments', { transaction });

            // Drop roles table
            await queryInterface.dropTable('roles', { transaction });

            await transaction.commit();
            console.log('✅ Rollback completed successfully');

        } catch (error) {
            await transaction.rollback();
            console.error('❌ Rollback failed:', error);
            throw error;
        }
    }
};
