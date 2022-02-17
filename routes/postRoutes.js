const express = require("express");
const app = express.Router();
const con = require("../dbConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../auth");
require("dotenv").config();

function getToday() {
  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();

  today = mm + "/" + dd + "/" + yyyy;

  return today;
}

// CREATE POSTS
app.post("/", authenticateToken, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    res.status(400).send({ msg: "Not all fields have been submitted" });
  const user = req.user;

  res.send(user);

  con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    const sql = `INSERT INTO posts (post_title, post_body, post_date, post_author) VALUES ('${title}', '${body}', '${getToday()}', '${
      req.user.user_id
    }')`;
    con
      .query(sql, (err, result) => {
        res.send({
          msg: "Post created",
          post_id: result.insertId,
        });
      })
      .on("error", () => res.sendStatus(400));
  });
});

// GET ALL POSTS
app.get("/", authenticateToken, (req, res) => {
  const sql = `SELECT * FROM posts`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("All records retrieved");
    res.send(result);
  });
});

// GET ONE POST
app.get("/:id", authenticateToken, (req, res) => {
  const sql = `SELECT * FROM posts WHERE user_id=${req.params.id}`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("1 record retreived");
    res.send(result);
  });
});

// SIGN/LOGIN IN POST
app.patch("/", authenticateToken, (req, res) => {
  const { body, author } = req.body;
  const sql = `SELECT * FROM posts WHERE post_body="${body}" AND post_author="${author}"`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("1 record found");
    res.send(result);
  });
});

// UPDATE POST WITH ID
app.put("/:id", authenticateToken, (req, res) => {
  const { title, body, date, author } = req.body;

  let sql = "UPDATE posts SET ";

  if (title) {
    sql += ` post_title = '${title}',`;
  }
  if (body) {
    sql += ` post_body = '${body}',`;
  }
  if (date) {
    sql += ` post_date = '${date}',`;
  }
  if (author) {
    sql += ` post_author = '${author}',`;
  }
  if (sql.endsWith(",")) sql = sql.substring(0, sql.length - 1);

  sql += ` WHERE post_id = ${req.params.id}`;

  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("record(s) updated");
    res.send(result);
  });
});

// DELETE POST WITH ID
app.delete("/:id", authenticateToken, (req, res) => {
  const sql = `DELETE FROM posts WHERE post_id = ${req.params.id}`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log("1 record deleted");
    res.send(result);
  });
});

module.exports = app;
