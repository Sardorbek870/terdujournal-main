let express = require("express");
let app = express();
let path = require("path");
let session = require("express-session");
let bcrypt = require("bcryptjs");
let db = require("./database");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
app.use(
  session({
    secret: "your-secret-key-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login.html");
  }
}

// Routes
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "about.html"));
});

app.get("/contact", function (req, res) {
  res.sendFile(path.join(__dirname, "contact.html"));
});

app.get("/articles", function (req, res) {
  res.sendFile(path.join(__dirname, "articles.html"));
});

// Auth Routes
app.post("/api/signup", function (req, res) {
  const { username, email, password, confirmPassword } = req.body;

  // Validate input
  if (!username || !email || !password || !confirmPassword) {
    return res.json({ success: false, message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.json({ success: false, message: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res.json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  // Check if user already exists
  try {
    const existingUser = db
      .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
      .get(username, email);
    if (existingUser) {
      return res.json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    db.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    ).run(username, email, hashedPassword);

    return res.json({
      success: true,
      message: "Signup successful! Please login.",
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Error creating account" });
  }
});

app.post("/api/login", function (req, res) {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.json({
      success: false,
      message: "Username and password are required",
    });
  }

  try {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;

    return res.json({
      success: true,
      message: "Login successful!",
      redirect: "/",
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Error logging in" });
  }
});

app.get("/api/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      return res.json({ success: false, message: "Error logging out" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Check auth status
app.get("/api/auth-status", function (req, res) {
  if (req.session.userId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Contact message routes
app.post("/api/messages", isAuthenticated, function (req, res) {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.json({ success: false, message: "Iltimos, xabar kiriting." });
  }

  try {
    db.prepare("INSERT INTO messages (user_id, message) VALUES (?, ?)").run(
      req.session.userId,
      message.trim(),
    );
    return res.json({
      success: true,
      message: "Xabaringiz muvaffaqiyatli yuborildi.",
    });
  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      message: "Xabar yuborishda xatolik yuz berdi.",
    });
  }
});

app.get("/api/messages", function (req, res) {
  try {
    const messages = db
      .prepare(
        `SELECT m.id, m.message, m.created_at, u.username
         FROM messages m
         JOIN users u ON u.id = m.user_id
         ORDER BY m.created_at DESC`,
      )
      .all();

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.json({ success: false, messages: [] });
  }
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
