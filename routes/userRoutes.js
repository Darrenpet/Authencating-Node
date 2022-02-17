const express = require("express");
const app = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const con = require("../dbConnection");
require("dotenv").config();

// CREATE USERS
app.post("/", async (req, res) => {
  const { name, email, contact, password } = req.body;
  if (!name || !email || !contact || !password)
    res.status(400).send({ msg: "Not all fields have been submitted" });

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    const sql = `INSERT INTO users (user_name, user_email, user_contact, user_password) VALUES ('${name}', '${email}', '${contact}', '${hashedPassword}')`;
    con.query(sql, (err, result) => {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });
});

// GET ALL USERS
app.get("/", (req, res) => {
  const sql = `SELECT * FROM users`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("All records retrieved");
    res.send(result);
  });
});

// GET ONE USER
app.get("/:id", (req, res) => {
  const sql = `SELECT * FROM users WHERE user_id=${req.params.id}`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("1 record retreived");
    res.send(result);
  });
});

// SIGN/LOGIN IN USER
app.patch("/", async (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE user_email="${email}"`;
  con.query(sql, async (err, result) => {
    if (err) throw err;
    console.log("1 record found");

    const user = result[0];
    const match = await bcrypt.compare(password, user.user_password);
    if (match) {
      console.log(user);
      try {
        const access_token = jwt.sign(
          JSON.stringify(user),
          process.env.SECRET_KEY
        );
        res.send({ jwt: access_token });
      } catch (error) {
        console.log(error);
      }
    } else {
      res.send("email and password does not match");
    }
  });
});

// UPDATE USER WITH ID
app.put("/:id", (req, res) => {
  const { name, email, contact, password, avatar, about } = req.body;

  let sql = ` UPDATE users SET `;

  if (name) {
    sql += ` user_name = '${name}',`;
  }
  if (email) {
    sql += ` user_email = '${email}',`;
  }
  if (contact) {
    sql += ` user_contact = '${contact}',`;
  }
  if (password) {
    sql += ` user_password = '${password}',`;
  }
  if (avatar) {
    sql += ` user_avatar = '${avatar}',`;
  }
  if (about) {
    sql += ` user_about = '${about}',`;
  }
  if (sql.endsWith(",")) sql = sql.substring(0, sql.length - 1);

  sql += ` WHERE user_id = ${req.params.id}`;

  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("record(s) updated");
    res.send(result);
  });
});

// DELETE USER WITH ID
app.delete("/:id", (req, res) => {
  const sql = `DELETE FROM users WHERE user_id = ${req.params.id}`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("1 record deleted");
    res.send(result);
  });
});

module.exports = app;
