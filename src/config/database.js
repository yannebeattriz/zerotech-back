const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Erro ao conectar com MySQL:", err.message);
        return;
    }

    console.log("Conexão com MySQL estabelecida!");

    connection.release();
});

module.exports = db;