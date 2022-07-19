const env = require('../tools/env');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* schema setting */
const gallerySchema = Schema({
  name: { type: String, default: 'gallery-unnamed', unique: true },
  registDate: { type: Date, required: true },
  modifyDate: { type: Date, required: true },
  isShow: { type: Boolean, default: true },
});
const campusSchema = Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: 'campus-unnamed' },
  address: { type: String, default: '' },
  isShow: { type: Boolean, default: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});
const awardSchema = Schema({
  name: { type: String, default: 'award-unnamed' },
  content: { type: String, default: '' },
  isShow: { type: Boolean, default: true },
  registDate: { type: Date, required: true },
});
const bookSchema = Schema({
  name: { type: String, default: 'book-unnamed' },
  url: { type: String, required: true },
  isShow: { type: Boolean, default: true },
  registDate: { type: Date, required: true },
  priority: { type: Number, default: 0 },
});

/* database setting */
const database = mongoose.connection;
database.on("open", () => {
  console.log("데이터베이스와 연결되었습니다.")
});
database.on("error", (err) => {
  console.error("데이터베이스 연결 에러 발생: " + err);
  mongoose.disconnect();
});
database.on("disconnected", () => {
  console.log("데이터베이스와 연결이 끊어졌습니다!");
  mongoose.connect(env.mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

/* connect with database */
mongoose.connect(env.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = {
  galleryModel: mongoose.model("Gallery", gallerySchema),
  campusModel: mongoose.model("Campus", campusSchema),
  awardModel: mongoose.model("Award", awardSchema),
  bookModel: mongoose.model("Book", bookSchema),
};
