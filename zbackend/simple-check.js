import mysql from "mysql2/promise";

const simpleCheck = async () => {
  try {
    console.log("🔍 Starting simple database check...");

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "782457426@Eren",
      database: "lab_management",
    });

    console.log("✅ Database connected");

    // First, check the table structure
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM users
    `);

    console.log("\n📋 Users table columns:");
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field} (${col.Type})`);
    });

    // Check superadmin user
    const [users] = await connection.execute(`
      SELECT user_id, user_mail, user_name, status, role_id, department_id
      FROM users 
      WHERE user_mail = 'superadmin@lab.edu'
    `);

    console.log("\n🔐 Superadmin user check:");
    if (users.length > 0) {
      console.log("✅ Found:", users[0]);
    } else {
      console.log("❌ Not found");
    }

    // Count all test users
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM users WHERE user_mail LIKE '%@lab.edu'
    `);

    console.log(`\n📊 Total test users: ${count[0].total}`);

    await connection.end();
    console.log("\n✅ Check complete");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

simpleCheck();
