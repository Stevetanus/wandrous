const { cloudinary } = require("../cloudinary");
const Spot = require("../models/spot");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const moment = require("moment");
moment.locale("zh-cn");

module.exports.index = async (req, res) => {
  const spots = await Spot.find({});
  res.render("spots/index", { spots });
};

module.exports.renderNewForm = (req, res) => {
  res.render("spots/new");
};

module.exports.createSpot = async (req, res, next) => {
  // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.spot.location,
      limit: 1,
    })
    .send();
  const spot = new Spot(req.body.spot);
  spot.geometry = geoData.body.features[0].geometry;
  spot.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  spot.author = req.user._id;
  spot.createAt = moment().format();
  await spot.save();
  // console.log(spot);
  req.flash("success", "Successfully made a new spot!");
  res.redirect(`/spots/${spot._id}`);
};

module.exports.showSpot = async (req, res) => {
  const spot = await Spot.findById(req.params.id)
    // populate the reviews and the authors of them
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // console.log(spot);
  if (!spot) {
    req.flash("error", "Cannot find that spot!");
    return res.redirect("/spots");
  }
  res.render("spots/show", { spot });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const spot = await Spot.findById(id);
  if (!spot) {
    req.flash("error", "Cannot find that spot!");
    return res.redirect("/spots");
  }
  res.render("spots/edit", { spot });
};

module.exports.updateSpot = async (req, res) => {
  const { id } = req.params;
  req.body.spot.updateAt = moment().format();
  const spot = await Spot.findByIdAndUpdate(
    id,
    { ...req.body.spot },
    { new: true }
  );
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  spot.images.push(...imgs);
  await spot.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await spot.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    // console.log(spot);
  }
  req.flash("success", "Successfully updated the spot");
  res.redirect(`/spots/${spot._id}`);
};

module.exports.deleteSpot = async (req, res) => {
  const { id } = req.params;
  await Spot.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the spot");
  res.redirect("/spots");
};
