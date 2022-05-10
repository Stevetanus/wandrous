const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Spot = require("../models/spot");

mongoose.connect(
  "mongodb+srv://wandrous:0HolJqaEw3d8Lw6U@wandrous.ik1dh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const image = [
  {
    url: "https://res.cloudinary.com/dicmrvc9t/image/upload/v1631695871/YelpCamp/fuwglzbpoquuxwv49odk.jpg",
    filename: "YelpCamp/fuwglzbpoquuxwv49odk",
  },
  {
    url: "https://res.cloudinary.com/dicmrvc9t/image/upload/v1631695897/YelpCamp/fromjnkpwrwpgqiuiglv.jpg",
    filename: "YelpCamp/fromjnkpwrwpgqiuiglv",
  },
  {
    url: "https://res.cloudinary.com/dicmrvc9t/image/upload/v1631695894/YelpCamp/klg9t6re5jdewrqcou8x.jpg",
    filename: "YelpCamp/klg9t6re5jdewrqcou8x",
  },
  {
    url: "https://res.cloudinary.com/dicmrvc9t/image/upload/v1631695898/YelpCamp/syicultts1nbc5ls3bxi.jpg",
    filename: "YelpCamp/syicultts1nbc5ls3bxi",
  },
  {
    url: "https://res.cloudinary.com/dicmrvc9t/image/upload/v1631695898/YelpCamp/m0xfmw24zzi2tc9z6h39.jpg",
    filename: "YelpCamp/m0xfmw24zzi2tc9z6h39",
  },
];

const d = new Date();
const utc = d.getTime() + d.getTimezoneOffset() * 60000;
const offset = 8;

const seedDB = async () => {
  // reset Spot model
  await Spot.deleteMany({});
  // for (let i = 0; i < 20; i++) {
  //   const random1000 = Math.floor(Math.random() * 1000);
  //   const wondrous = Math.floor(Math.random() * 20) + 10;
  //   const spot = new Spot({
  //     author: "613f250a981e9f2584bd82c6",
  //     location: `${cities[random1000].city}, ${cities[random1000].state}`,
  //     title: `${sample(descriptors)} ${sample(places)}`,
  //     geometry: {
  //       type: "Point",
  //       coordinates: [
  //         cities[random1000].longitude,
  //         cities[random1000].latitude,
  //       ],
  //     },
  //     images: [image[Math.floor(Math.random() * image.length)]],
  //     description:
  //       "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente, nam expedita. Dolore, optio nesciunt. Sint repellat dolorum minus incidunt ratione quas sed minima quia corrupti modi eos atque, consectetur rem. ",
  //     wondrous,
  //     updateAt: new Date(utc + 3600000 * offset),
  //   });
  //   await spot.save();
  // }
};

seedDB().then(() => {
  mongoose.connection.close();
});
