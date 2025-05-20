const mysql = require('mysql2')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

module.exports = pool;

// const userconnection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// userconnection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database:', err.stack);
//     process.exit(1);
//   }
//   console.log('Connected to the database as ID ' + userconnection.threadId);
// });

// module.exports = userconnection;
