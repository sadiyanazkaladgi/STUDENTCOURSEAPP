require("dotenv").config(); // load environment variables

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const path = require("path");

const User = require("./models/User");
const Course = require("./models/Course");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// 🌸 MongoDB connection using env variable
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error(err));

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL, // also use env here
    }),
  })
);

// 🌸 Add sample courses once
async function addSampleCourses() {
  const count = await Course.countDocuments();
  if (count === 0) {
    await Course.insertMany([
      {
        title: "Web Development",
        description: "HTML, CSS, JavaScript & backend basics!",
        image: "https://cdn.pixabay.com/photo/2016/11/29/05/08/beach-1868344_1280.jpg"
      },
      {
        title: "Java Programming",
        description: "Master Java fundamentals & OOP!",
        image: "https://cdn.pixabay.com/photo/2017/01/18/23/17/java-1992439_1280.png"
      },
      {
        title: "Data Structures",
        description: "Learn linked lists, stacks, and trees!",
        image: "https://cdn.pixabay.com/photo/2018/03/07/13/29/algorithm-3205454_1280.jpg"
      }
    ]);
    console.log("🌸 Sample courses added!");
  }
}
addSampleCourses();

// Routes
app.get("/", (req, res) => res.render("landing"));

// Register
app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.send("❌ Email already registered. Try login.");
  const hashed = await bcrypt.hash(password, 10);
  await new User({ name, email, password: hashed }).save();
  res.redirect("/login");
});

// Login
app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send("❌ No user found.");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("❌ Wrong password.");
  req.session.userId = user._id;
  req.session.userName = user.name;
  res.redirect("/home");
});

// Home
app.get("/home", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.render("home", { user: { name: req.session.userName } });
});

// Join Page
app.get("/join", async (req, res) => {
  try {
    const courses = await Course.find();
    let joinedIds = [];
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      joinedIds = user ? user.joinedCourses.map(id => id.toString()) : [];
    }
    res.render("join", { courses, joinedIds });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading courses");
  }
});

// Join Course (POST)
app.post("/join/:id", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const courseId = req.params.id;
    const user = await User.findById(req.session.userId);

    if (!user.joinedCourses.includes(courseId)) {
      user.joinedCourses.push(courseId);
      await user.save();
    }

    res.redirect("/join");
  } catch (error) {
    console.error("Error joining course:", error);
    res.status(500).send("Error joining course");
  }
});

// Registered Courses
app.get("/registered", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const user = await User.findById(req.session.userId).populate("joinedCourses");
  res.render("registered", { courses: user.joinedCourses });
});

// Fun Page
app.get("/fun", (req, res) => res.render("fun"));

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Server running on port ${PORT}'));