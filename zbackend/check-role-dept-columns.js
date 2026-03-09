const mysql = require('mysql2/promise');

async function checkColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '782457426@Eren',
    database: 'lab_management'
  });

  try {
    console.log('=== ROLES TABLE COLUMNS ===');
    const [rolesColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'lab_management' 
      AND TABLE_NAME = 'roles' 
      ORDER BY ORDINAL_POSITION
    `);
    rolesColumns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    console.log('\n=== DEPARTMENTS TABLE COLUMNS ===');
    const [deptsColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'lab_management' 
      AND TABLE_NAME = 'departments' 
      ORDER BY ORDINAL_POSITION
    `);
    deptsColumns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

  } finally {
    await connection.end();
  }
}

checkColumns().catch(console.error);
