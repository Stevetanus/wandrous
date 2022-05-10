const express = require("express");
// merParams to pass param through files
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReivewAuthor } = require("../middleware");

const reviews = require("../controllers/reviews");

const catchAsync = require("../utils/catchAsync");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReivewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
