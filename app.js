if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const userRoutes = require("./routes/users");
const spotRoutes = require("./routes/spots");
const reviewRoutes = require("./routes/reviews");
const MongoStore = require("connect-mongo");
const moment = require("moment");
moment.locale("zh-cn");
//  mongoose
const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  cryto: {
    secret: secret,
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR!!!", e);
});
const sessionConfig = {
  store,
  name: "sation",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dicmrvc9t/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session()); // app.use(session) before passport.session() maybe for the cookies
passport.use(new LocalStrategy(User.authenticate())); // authenticate is come from passport-local-mongoose

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

// app.get("/spots", async (req, res) => {
//   const spots = await Spot.find({});
//   res.render("spots/index", { spots });
// });
// new put in front of /:id (order matters)

app.use(express.urlencoded({ extended: true }));
// app.get("/spots/new", (req, res) => {
//   res.render("spots/new");
// });
// app.post("/spots", async (req, res) => {
//   const spotSchema = Joi.object({
//     spot: Joi.object({
//       title: Joi.string().required(),
//       wondrous: Joi.number().required().min(0),
//     }).required(),
//   });
//   const result = spotSchema.validate(req.body);
//   console.log(result);
//   const spot = new Spot(req.body.spot);
//   await spot.save();
//   res.redirect(`/spots/${spot._id}`);
// });
// app.get("/spots/:id", async (req, res) => {
//   const spot = await Spot.findById(req.params.id);
//   res.render("spots/show", { spot });
// });

app.use(methodOverride("_method"));
// app.get("/spots/:id/edit", async (req, res) => {
//   const spot = await Spot.findById(req.params.id);
//   res.render("spots/edit", { spot });
// });
// app.put("/spots/:id", async (req, res) => {
//   const { id } = req.params;
//   const spot = await Spot.findByIdAndUpdate(id, { ...req.body.spot });
//   res.redirect(`/spots/${spot._id}`);
// });
// app.delete("/spots/:id", async (req, res) => {
//   const { id } = req.params;
//   await Spot.findByIdAndDelete(id);
//   res.redirect("/spots");
// });
// listen on port
app.use(express.static(path.join(__dirname, "public")));

app.use("/", userRoutes);
app.use("/spots", spotRoutes);
app.use("/spots/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, something went wrong.";
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
