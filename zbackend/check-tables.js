import mysql from "mysql2/promise";

const checkTables = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "782457426@Eren",
    database: "lab_management",
  });

  try {
    console.log("🔍 Checking database table structures...\n");

    // Check users table
    console.log("📋 USERS TABLE:");
    const [userCols] = await connection.execute(`SHOW COLUMNS FROM users`);
    userCols.forEach((col) => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Check bookings table existence
    console.log("\n📋 BOOKINGS TABLE:");
    const [bookingCheck] = await connection.execute(` 
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'lab_management' AND TABLE_NAME = 'bookings'
    `);

    if (bookingCheck.length === 0) {
      console.log("  ❌ Bookings table does NOT exist!");
    } else {
      const [bookingCols] = await connection.execute(
        `SHOW COLUMNS FROM bookings`,
      );
      bookingCols.forEach((col) => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    }

    // Check labs table
    console.log("\n📋 LABS TABLE:");
    const [labCheck] = await connection.execute(` 
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'lab_management' AND TABLE_NAME = 'labs'
    `);

    if (labCheck.length === 0) {
      console.log("  ❌ Labs table does NOT exist!");
    } else {
      const [labCols] = await connection.execute(`SHOW COLUMNS FROM labs`);
      labCols.forEach((col) => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    }

    // Check equipment table
    console.log("\n📋 EQUIPMENT TABLE:");
    const [equipCheck] = await connection.execute(` 
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'lab_management' AND TABLE_NAME = 'equipment'
    `);

    if (equipCheck.length === 0) {
      console.log("  ❌ Equipment table does NOT exist!");
    } else {
      const [equipCols] = await connection.execute(
        `SHOW COLUMNS FROM equipment`,
      );
      equipCols.forEach((col) => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    }

    console.log("\n✅ Table check complete");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
};

checkTables();
