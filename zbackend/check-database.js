/**
 * Database Health Check Script
 * 
 * Verifies database connection and shows current status
 * Usage: node check-database.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./config/database');
const { User } = require('./models');

async function checkDatabase() {
    console.log('\n🔍 DATABASE HEALTH CHECK');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Test connection
        console.log('📊 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful!\n');

        // Get database info
        const dbName = sequelize.config.database;
        const dbHost = sequelize.config.host;
        const dbDialect = sequelize.config.dialect;

        console.log('📝 Database Information:');
        console.log(`   Database: ${dbName}`);
        console.log(`   Host: ${dbHost}`);
        console.log(`   Type: ${dbDialect}\n`);

        // Check if users table exists
        console.log('📋 Checking users table...');
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'users'
        `);

        if (tables.length === 0) {
            console.log('⚠️  Users table does not exist!');
            console.log('   You need to run database sync first.\n');
            return;
        }

        console.log('✅ Users table exists\n');

        // Check current user table structure
        console.log('🔍 Checking users table structure...');
        const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users'
            ORDER BY ORDINAL_POSITION
        `);

        const columnNames = columns.map(c => c.COLUMN_NAME);
        console.log(`   Columns (${columnNames.length}):`, columnNames.join(', '), '\n');

        // Check for new columns (indicates migration already done)
        const hasNewColumns = columnNames.includes('userId') && 
                             columnNames.includes('roleId') && 
                             columnNames.includes('departmentId');

        if (hasNewColumns) {
            console.log('✅ Migration appears to be ALREADY COMPLETED');
            console.log('   (New columns: userId, roleId, departmentId found)\n');
            
            // Check if roles table exists
            const [rolesTables] = await sequelize.query(`
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'roles'
            `);
            
            if (rolesTables.length > 0) {
                console.log('✅ Roles table exists');
                const [roleCount] = await sequelize.query('SELECT COUNT(*) as count FROM roles');
                console.log(`   ${roleCount[0].count} roles in database\n`);
            }
        } else {
            console.log('📝 Migration NOT YET RUN');
            console.log('   (Old structure detected)\n');
            console.log('   To migrate, run: node migrations-runner.js\n');
        }

        // Get user statistics
        console.log('👥 User Statistics:');
        const userCount = await User.count();
        console.log(`   Total users: ${userCount}`);

        if (userCount > 0) {
            // Get role distribution (old structure)
            if (!hasNewColumns && columnNames.includes('role')) {
                const [roleStats] = await sequelize.query(`
                    SELECT role, COUNT(*) as count 
                    FROM users 
                    WHERE role IS NOT NULL
                    GROUP BY role 
                    ORDER BY count DESC
                `);

                console.log('\n   Role Distribution (Old ENUM):');
                roleStats.forEach(stat => {
                    console.log(`     - ${stat.role}: ${stat.count} users`);
                });
            }
            
            // Get role distribution (new structure)
            if (hasNewColumns && columnNames.includes('roleId')) {
                const [newRoleStats] = await sequelize.query(`
                    SELECT r.roleName, COUNT(u.userId) as count
                    FROM roles r
                    LEFT JOIN users u ON r.roleId = u.roleId
                    GROUP BY r.roleId, r.roleName
                    ORDER BY r.roleId
                `);

                if (newRoleStats.length > 0) {
                    console.log('\n   Role Distribution (New RBAC):');
                    newRoleStats.forEach(stat => {
                        console.log(`     - ${stat.roleName}: ${stat.count} users`);
                    });
                }
            }
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ DATABASE IS HEALTHY');
        console.log('═══════════════════════════════════════════════════════\n');

        if (!hasNewColumns) {
            console.log('📋 Next Steps:');
            console.log('   1. Backup your database (IMPORTANT!)');
            console.log('   2. Run: node migrations-runner.js');
            console.log('   3. Run: node test-migration.js (to verify)\n');
        } else {
            console.log('✅ Your database is using the new RBAC structure!\n');
        }

    } catch (error) {
        console.error('\n❌ DATABASE CHECK FAILED!');
        console.error('═══════════════════════════════════════════════════════\n');
        console.error('Error:', error.message);
        console.error('\nPossible causes:');
        console.error('  - Database server is not running');
        console.error('  - Wrong credentials in .env file');
        console.error('  - Database does not exist');
        console.error('  - Network/firewall issues\n');
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the check
checkDatabase();
