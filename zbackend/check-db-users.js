import mysql from "mysql2/promise";

const checkUserData = async () => {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "782457426@Eren",
      database: "lab_management",
    });

    console.log("🔗 Connected to database");

    // Check users table
    const [users] = await connection.execute(
      `
      SELECT 
        user_id, user_mail, user_name, 
        SUBSTRING(password, 1, 20) as password_hash,
        status, role_id, department_id
      FROM users 
      WHERE user_mail = ?
    `,
      ["superadmin@lab.edu"],
    );

    if (users.length > 0) {
      console.log("✅ Found superadmin user:");
      console.log(users[0]);
    } else {
      console.log("❌ No superadmin user found");
    }

    // Check all test users
    const [allTestUsers] = await connection.execute(`
      SELECT user_mail, user_name, status, role_id, department_id 
      FROM users 
      WHERE user_mail LIKE '%@lab.edu'
      ORDER BY role_id
    `);

    console.log("\n📋 All test users in database:");
    allTestUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.user_mail} | ${user.user_name} | Role: ${user.role_id} | Dept: ${user.department_id} | Status: ${user.status}`,
      );
    });

    await connection.end();
    console.log("\n🔐 Database verification complete");
  } catch (error) {
    console.error("❌ Database error:", error);
  }
};

checkUserData();
