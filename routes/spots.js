const express = require("express");
const router = express.Router();
const spots = require("../controllers/spots");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateSpot } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(spots.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateSpot,
    catchAsync(spots.createSpot)
  ); //image is the name of the upload data

router.get("/new", isLoggedIn, spots.renderNewForm); // go before show page route

router
  .route("/:id")
  .get(catchAsync(spots.showSpot))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateSpot,
    catchAsync(spots.updateSpot)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(spots.deleteSpot));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(spots.renderEditForm));

module.exports = router;
