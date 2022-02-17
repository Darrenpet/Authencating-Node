const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "darren",
  password: "@Lifechoices1234",
  database: "personal_blog",
});

module.exports = con;
