/**
 * Migration Runner Script
 * 
 * This script runs the database migration to add Role and Department tables
 * and update the User table structure.
 * 
 * Usage: node migrations-runner.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./config/database');
const { testConnection } = require('./config/database');

async function runMigration() {
    console.log('\n🚀 DATABASE MIGRATION RUNNER');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Test database connection first
        console.log('📊 Testing database connection...');
        const isConnected = await testConnection();
        
        if (!isConnected) {
            console.error('❌ Cannot proceed without database connection.');
            process.exit(1);
        }

        console.log('\n💾 BACKUP REMINDER');
        console.log('═══════════════════════════════════════════════════════');
        console.log('⚠️  IMPORTANT: Have you backed up your database?');
        console.log('   This migration will add new tables and modify the users table.');
        console.log('   Press Ctrl+C to cancel if you need to backup first.\n');

        // Wait 5 seconds for user to cancel if needed
        console.log('⏳ Starting migration in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Import the migration
        const migration = require('./migrations/add_role_department_tables.js');

        // Create a QueryInterface object
        const queryInterface = sequelize.getQueryInterface();

        console.log('\n📋 Running migration: Add Role and Department tables');
        console.log('═══════════════════════════════════════════════════════\n');

        // Run the migration
        await migration.up(queryInterface, sequelize.Sequelize);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('📝 Next Steps:');
        console.log('   1. Verify the data in your database');
        console.log('   2. Test user authentication');
        console.log('   3. Test role and department endpoints');
        console.log('   4. If everything works, you can remove old columns later\n');

        console.log('🔍 Validation Queries:');
        console.log('   SELECT * FROM roles;');
        console.log('   SELECT * FROM departments;');
        console.log('   SELECT id, userId, name, userName, email, userMail, role, roleId FROM users LIMIT 10;\n');

        process.exit(0);

    } catch (error) {
        console.error('\n═══════════════════════════════════════════════════════');
        console.error('❌ MIGRATION FAILED!');
        console.error('═══════════════════════════════════════════════════════\n');
        console.error('Error:', error.message);
        console.error('\nStack trace:', error.stack);
        
        console.log('\n🔄 Attempting rollback...');
        
        try {
            const migration = require('./migrations/add_role_department_tables.js');
            const queryInterface = sequelize.getQueryInterface();
            await migration.down(queryInterface, sequelize.Sequelize);
            console.log('✅ Rollback completed successfully');
        } catch (rollbackError) {
            console.error('❌ Rollback failed:', rollbackError.message);
            console.error('⚠️  Please manually check your database!');
        }

        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Add command line argument support
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('\n📚 Migration Runner Help');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Usage: node migrations-runner.js [options]\n');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --rollback     Rollback the migration');
    console.log('  --force        Skip the 5-second delay\n');
    console.log('Examples:');
    console.log('  node migrations-runner.js              # Run migration');
    console.log('  node migrations-runner.js --rollback   # Rollback migration');
    console.log('  node migrations-runner.js --force      # Run immediately\n');
    process.exit(0);
}

if (args.includes('--rollback')) {
    // Rollback mode
    (async () => {
        const { sequelize } = require('./config/database');
        const migration = require('./migrations/add_role_department_tables.js');
        const queryInterface = sequelize.getQueryInterface();

        try {
            console.log('\n🔄 Running migration rollback...\n');
            await migration.down(queryInterface, sequelize.Sequelize);
            console.log('\n✅ Rollback completed successfully!\n');
            process.exit(0);
        } catch (error) {
            console.error('\n❌ Rollback failed:', error.message);
            process.exit(1);
        } finally {
            await sequelize.close();
        }
    })();
} else {
    // Run the migration
    runMigration();
}
