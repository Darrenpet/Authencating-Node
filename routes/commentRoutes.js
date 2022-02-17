const express = require("express");
const app = express.Router();
const con = require("../dbConnection");
const authenticateToken = require("../auth");

// CREATE COMMENTS
app.post("/", (req, res) => {
  const { author, text, post } = req.body;
  if (!author || !text || !post)
    res.status(400).send({ msg: "Not all fields have been submitted" });

  con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    const sql = `INSERT INTO comments (comment_author, comment_text, comment_post) VALUES ('${author}', '${text}', '${post}')`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });
});

// GET ALL COMMENTS
app.get("/", (req, res) => {
  const sql = `SELECT * FROM comments`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("All records retrieved");
    res.send(result);
  });
});

// GET ONE COMMENT
app.get("/:id", (req, res) => {
  const sql = `SELECT * FROM comments WHERE comment_id=${req.params.id}`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record retreived");
    res.send(result);
  });
});

// SIGN/LOGIN IN COMMENT
app.patch("/", (req, res) => {
  const { text } = req.body;
  const sql = `SELECT * FROM comments WHERE comment_text="${text}"`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record found");
    res.send(result);
  });
});

// UPDATE COMMENT WITH ID
app.put("/:id", (req, res) => {
  const { author, text, post } = req.body;

  let sql = "UPDATE comments SET ";

  if (author) {
    sql += ` comment_author = '${author}',`;
  }
  if (text) {
    sql += ` comment_text = ${text}',`;
  }
  if (post) {
    sql += ` comment_post = ${post}',`;
  }
  if (sql.endsWith(",")) sql = sql.substring(0, sql.length - 1);

  sql += ` WHERE comment_id=${req.params.id}`;

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("record(s) updated");
    res.send(result);
  });
});

// DELETE COMMENT WITH ID
app.delete("/:id", (req, res) => {
  const sql = `DELETE FROM comments WHERE comment_id = ${req.params.id}`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record deleted");
    res.send(result);
  });
});

module.exports = app;
