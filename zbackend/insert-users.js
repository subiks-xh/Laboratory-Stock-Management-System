import bcrypt from "bcrypt";
import mysql from "mysql2/promise";

const insertUsers = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "782457426@Eren",
    database: "lab_management",
  });

  try {
    console.log("🔄 Clearing existing test users...");
    await connection.execute(
      "DELETE FROM users WHERE user_mail LIKE '%@lab.edu'",
    );

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash("test123", 10);

    console.log("📝 Inserting users...\n");

    const users = [
      ["ADMIN001", "Super Admin", "superadmin@lab.edu", 7, 6, hashedPassword],
      ["ADMIN002", "System Admin", "admin@lab.edu", 6, 6, hashedPassword],
      ["DEPT001", "CSE Admin", "cseadmin@lab.edu", 8, 1, hashedPassword],
      ["DEPT002", "ECE Admin", "eceadmin@lab.edu", 8, 2, hashedPassword],
      ["FAC001", "Dr. John Smith", "csefaculty@lab.edu", 2, 1, hashedPassword],
      [
        "FAC002",
        "Dr. Sarah Johnson",
        "ecefaculty@lab.edu",
        2,
        2,
        hashedPassword,
      ],
      ["LAB001", "CSE Lab Assistant", "cselab@lab.edu", 9, 1, hashedPassword],
      ["LAB002", "ECE Lab Assistant", "ecelab@lab.edu", 9, 2, hashedPassword],
      ["STU001", "Alice Brown", "student1@lab.edu", 1, 1, hashedPassword],
      ["STU002", "Bob Davis", "student2@lab.edu", 1, 2, hashedPassword],
      ["STU003", "Charlie Wilson", "student3@lab.edu", 1, 3, hashedPassword],
      [
        "MAINT001",
        "Mike Maintenance",
        "maintenance@lab.edu",
        10,
        6,
        hashedPassword,
      ],
    ];

    for (const [
      userNumber,
      userName,
      userMail,
      roleId,
      deptId,
      password,
    ] of users) {
      await connection.execute(
        `INSERT INTO users (user_number, user_name, user_mail, role_id, department_id, password, status, company_id, auth_provider, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, 'Active', 0, 'local', NOW(), NOW())`,
        [userNumber, userName, userMail, roleId, deptId, password],
      );
      console.log(`✅ Created: ${userName} (${userMail})`);
    }

    console.log("\n🎉 All users created successfully!\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("🔐 LOGIN CREDENTIALS FOR ALL ROLES:");
    console.log("═══════════════════════════════════════════════════\n");
    console.log("👑 SUPER ADMIN: superadmin@lab.edu / test123");
    console.log("🛡️ SYSTEM ADMIN: admin@lab.edu / test123");
    console.log("🏢 DEPT ADMINS: cseadmin@lab.edu, eceadmin@lab.edu / test123");
    console.log("👨‍🏫 FACULTY: csefaculty@lab.edu, ecefaculty@lab.edu / test123");
    console.log("🔬 LAB ASSISTANTS: cselab@lab.edu, ecelab@lab.edu / test123");
    console.log(
      "👩‍🎓 STUDENTS: student1@lab.edu, student2@lab.edu, student3@lab.edu / test123",
    );
    console.log("🔧 MAINTENANCE: maintenance@lab.edu / test123");
    console.log("\n═══════════════════════════════════════════════════");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
};

insertUsers();
