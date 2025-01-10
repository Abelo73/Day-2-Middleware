const express = require("express");
const app = express();
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const PORT = process.env.PORT || 8000;

const users = [
  { id: 1, name: "Abel Adisu", age: 25 },
  { id: 2, name: "Kebede Nigatu", age: 30 },
  { id: 3, name: "Alemayehu Teshome", age: 22 },
];

// Built in middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Writing custom middleware

app.use((req, res, next) => {
  console.log(`[${new Date().toDateString()} ${req.method} ${req.url}]`);
  next();
});
// Authentication middleware

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey === "12345") {
    next();
  } else {
    res.status(401).send({ message: "Unauthorized: Invalid API key" });
  }
};

const authenticationToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    res.user = user;
    next();
  });
};

// Route to generate toke

app.post("/api/login", (req, res) => {
  const username = req.body.username;

  const user = { name: username };

  const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

app.get("/api/user", authenticationToken, (req, res) => {
  res.json(users);
});

// Error handling middleware

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send({ message: "Internal Server Error" });
});

app.get("/api/users/secure-data", authMiddleware, (req, res) => {
  res.json(users);
});
// show all uses API

app.get("/api/users", (req, res) => {
  res.json(users);
});

// show user by id

app.get("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((user) => user.id === id);

  if (!user) {
    res
      .status(404)
      .json({ message: "User not found  with id: " + id, status: false });
  }
  res.json(user);
});

// Add user API
app.post("/api/users", (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    age: req.body.age,
  };

  users.push(newUser);
  res.json(users);
});

// Simulating error endpoint

app.get("/api/error", (req, res) => {
  throw new Error("Something went wrong");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
