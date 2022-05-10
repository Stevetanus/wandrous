const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const moment = require("moment");
moment.locale("zh-cn");

const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
  url: String,
  filename: { type: String, default: "In the woods" },
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/c_fill,g_auto,h_300,w_200");
});
ImageSchema.virtual("thumb").get(function () {
  return this.url.replace("/upload", "/upload/c_fill,g_auto,h_500,w_500");
});

const SpotSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    wondrous: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    createAt: {
      type: String,
      default: moment().format(),
    },
    tz: {
      type: String,
      default: "Taiwan/Taipei",
    },
    updateAt: {
      type: String,
    },
  },
  opts
);

SpotSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/spots/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 30)}...</p>`;
});

SpotSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Spot", SpotSchema);
