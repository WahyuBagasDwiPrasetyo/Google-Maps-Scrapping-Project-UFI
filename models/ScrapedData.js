const mongoose = require("mongoose");

const ScrapedDataSchema = new mongoose.Schema({
  index: Number,
  storeName: String,
  placeId: String,
  address: String,
  category: String,
  phone: String,
  googleUrl: String,
  bizWebsite: String,
  ratingText: String,
  stars: Number,
  numberOfReviews: Number,
  scrapedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ScrapedData", ScrapedDataSchema);
