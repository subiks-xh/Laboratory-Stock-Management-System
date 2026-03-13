const mysql = require("mysql2/promise");

async function checkData() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "782457426@Eren",
    database: "lab_management",
  });

  try {
    console.log("=== ACTIVE LABS ===");
    const [labs] = await connection.query(`
      SELECT id, name, lab_type, location, is_active 
      FROM labs 
      WHERE is_active = 1
      LIMIT 5
    `);
    labs.forEach((lab) => {
      console.log(
        `  ID: ${lab.id}, Name: ${lab.name}, Type: ${lab.lab_type}, Location: ${lab.location}`,
      );
    });

    console.log("\n=== AVAILABLE EQUIPMENT ===");
    const [equipment] = await connection.query(`
      SELECT id, name, serial_number, category, lab_id, status 
      FROM equipment 
      WHERE status = 'available' AND is_active = 1
      LIMIT 5
    `);
    equipment.forEach((eq) => {
      console.log(
        `  ID: ${eq.id}, Name: ${eq.name}, Serial: ${eq.serial_number}, Lab ID: ${eq.lab_id}`,
      );
    });

    console.log("\n=== TEST USERS ===");
    const [users] = await connection.query(`
      SELECT user_id, user_name, user_mail, role_id 
      FROM users 
      WHERE user_mail LIKE '%@lab.edu'
      LIMIT 5
    `);
    users.forEach((user) => {
      console.log(
        `  User ID: ${user.user_id}, Name: ${user.user_name}, Email: ${user.user_mail}, Role: ${user.role_id}`,
      );
    });
  } finally {
    await connection.end();
  }
}

checkData().catch(console.error);
