const mysql = require("mysql2/promise");

async function verifyBooking() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "782457426@Eren",
    database: "lab_management",
  });

  try {
    console.log("=== RECENT BOOKINGS ===");
    const [bookings] = await connection.query(`
      SELECT b.id, b.user_id, b.lab_id, b.booking_type, b.status, b.purpose, 
             b.start_time, b.end_time, b.created_at,
             u.user_name, l.name as lab_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN labs l ON b.lab_id = l.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    if (bookings.length === 0) {
      console.log("  No bookings found in database.");
    } else {
      bookings.forEach((booking) => {
        console.log(`\n  Booking ID: ${booking.id}`);
        console.log(`    User: ${booking.user_name} (ID: ${booking.user_id})`);
        console.log(`    Lab: ${booking.lab_name} (ID: ${booking.lab_id})`);
        console.log(`    Type: ${booking.booking_type}`);
        console.log(`    Status: ${booking.status}`);
        console.log(`    Purpose: ${booking.purpose}`);
        console.log(`    Start: ${booking.start_time}`);
        console.log(`    End: ${booking.end_time}`);
        console.log(`    Created: ${booking.created_at}`);
      });
    }
  } finally {
    await connection.end();
  }
}

verifyBooking().catch(console.error);
