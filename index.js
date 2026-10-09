import express from "express";
import mysql from "mysql2";
const app = express();
app.use(express.json());
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DBPASSWORD,
  database: "notesapp",
});
db.connect((err) => {
  if (err) {
    console.error("An Error as ocurred unable to connect");
  } else {
    console.log("You have been Succesfully Connected");
  }
});
const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      Message: "NO TOKEN AVAILABLE TO PROCEED",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verify = jwt.verify(token, process.env.JWTSECRET);

    req.userId = verify.id;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);

    return res.status(401).json({
      Message: err.message,
    });
  }
};

app.get("/notes", checkAuth, (req, res) => {
  const id = req.userId;
  db.query(
    "SELECT * FROM notes_table WHERE USER_ID = ? ",
    [id],
    (err, results) => {
      if (err) {
        res.status(500).json({ Message: "ERROR MADE" });
      } else {
        res.json(results);
      }
    },
  );
});

app.get("/notes/:id", checkAuth, (req, res) => {
  const noteId = parseInt(req.params.id);
  const id = req.userId;
  db.query(
    "SELECT * FROM notes_table WHERE ID = ? AND USER_ID = ?",
    [noteId, id],
    (err, results) => {
      if (err) {
        res.status(500).json({ Message: "Error OCCUURED" });
      } else if (results.length === 0) {
        res.status(404).json({ Message: "EMPTY" });
      } else {
        res.json(results[0]);
      }
    },
  );
});

app.post("/notes", checkAuth, (req, res) => {
  const { name, description } = req.body;

  if (!name || name.length === 0) {
    return res.status(400).json({
      Message: "ENTER YOUR NAME TO PROCEED",
    });
  }

  db.query(
    "INSERT INTO notes_table (NAME, DESCRIPTION, USER_ID) VALUES (?, ?, ?)",
    [name, description, req.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          Message: "INTERNAL ERROR",
        });
      }

      return res.status(201).json({
        id: results.insertId,
        name,
        description,
      });
    },
  );
});

app.delete("/notes/:id", checkAuth, (req, res) => {
  const change = parseInt(req.params.id);
  const id = req.userId;

  db.query(
    "DELETE FROM notes_table WHERE ID = ? AND USER_ID = ?",
    [change, id],
    (err, results) => {
      if (err) {
        res.status(500).json({ Message: "ERROR OCCUURRED DURING DELETION" });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ Message: "NOTES NOT FOUND" });
      } else {
        res.status(200).json({ id: change });
      }
    },
  );
});

app.put("/notes/:id", checkAuth, (req, res) => {
  const parse = parseInt(req.params.id);

  const { name, description } = req.body;
  const id = req.userId;

  if (!name || name.length === 0) {
    res.status(400).json({ Message: "FILL THE CATEGORY TO PROCEED" });
  } else {
    db.query(
      "UPDATE notes_table SET NAME=?,DESCRIPTION=? WHERE ID = ? AND USER_ID = ?",
      [name, description, parse, id],
      (err, results) => {
        if (err) {
          res.status(500).json({ Message: "ERROR OCCURED IN UPDATING" });
        } else if (results.affectedRows === 0) {
          res.status(404).json({ Message: "EMPTY NOT UPDATED" });
        } else {
          res.status(200).json({ id: parse, name, description });
        }
      },
    );
  }
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (
    !username ||
    username.length === 0 ||
    !password ||
    password.length === 0
  ) {
    res.status(401).json({ Message: "FILL IN ALL CATEGORIES" });
  } else {
    const hashpassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (USERNAME,PASSWORD) VALUES (?,?)",
      [username, hashpassword],
      (err, results) => {
        if (err) {
          res.status(500).json({ Message: "INTERNAL ERROR DURING SIGNUP" });
        } else {
          res.status(201).json({ id: results.insertId, username });
        }
      },
    );
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE USERNAME = ?",
    [username],
    async (err, results) => {
      if (err) {
        res.status(500).json({ Message: "INTERNAL ERROR FROM SERVER" });
      } else if (results.length === 0) {
        res.status(401).json({ Message: "INVALID PASSWORD OR USERNAME " });
      } else {
        const IsMatch = await bcrypt.compare(password, results[0].PASSWORD);
        if (IsMatch) {
          const token = jwt.sign({ id: results[0].ID }, process.env.JWTSECRET, {
            expiresIn: "1h",
          });
          res.status(200).json({ Message: "SUCCESFULLY LOGGED IN", token });
        } else {
          res.status(401).json({ Message: "INVALID PASSWORD OR USERNAME" });
        }
      }
    },
  );
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
