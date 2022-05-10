const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
  if (req.isAuthenticated()) {
    return res.redirect("/spots");
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wandrous!");
      res.redirect("/spots");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
  if (req.isAuthenticated()) {
    return res.redirect("/spots");
  }
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome Back!");
  const redirectUrl = req.session.returnTo || "/spots";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Goodbye!!!");
  res.redirect("/spots");
};
