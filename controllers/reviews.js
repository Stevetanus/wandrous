const Review = require("../models/review");
const Spot = require("../models/spot");

module.exports.createReview = async (req, res) => {
  const spot = await Spot.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  spot.reviews.push(review);
  await review.save();
  await spot.save();
  req.flash("success", "Successfully make a review!!!");
  res.redirect(`/spots/${spot._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Spot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/spots/${id}`);
};
