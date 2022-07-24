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
  subname: { type: String, default: '' },
  address: { type: String, default: '' },
  call: { type: String, default: '' },
  isShow: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  naverMapUrl: { type: String, default: '' },
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
const noticeSchema = Schema({
  title: { type: String, default: 'notice-unnamed' },
  content: { type: String, default: '' },
  registDate: { type: Date, required: true },
  modifyDate: { type: Date, required: true },
  isShow: { type: Boolean, default: true },
  campus: { type: Schema.Types.ObjectId, ref: "Campus", required: true },
  author: { type: Schema.Types.ObjectId, ref: "Teacher", required: true }
});
const teacherSchema = Schema({
  level: { type: String, default: 'teacher' },
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  name: { type: String, default: 'teacher-unnamed' },
  campus: { type: Schema.Types.ObjectId, ref: "Campus", required: true },
  // administrator | director | teacher
});
const parentSchema = Schema({
  name: { type: String, default: 'parent-unnamed' },
  phone: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student", required: true }]
})
const studentSchema = Schema({
  name: { type: Date, required: true },
  birth: { type: String, required: true },
  password: { type: String, required: true },
  registDate: { type: Date, required: true },
});
const courseSchema = Schema({
  name: { type: String, default: 'course-unnamed' },
  students: [{ type: Schema.Types.ObjectId, ref: "Student", required: true }]
});
const testsetSchema = Schema({
  name: { type: String, default: 'testset-unnamed' },
  registDate: { type: Date, required: true },
});
const testSchema = Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  test: { type: Schema.Types.ObjectId, ref: "Testset", required: true },
  date: { type: Date, required: true },
});
const erecordSchema = Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: Date, required: true },
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
  noticeModel: mongoose.model("Notice", noticeSchema),
  teacherModel: mongoose.model("Teacher", teacherSchema),
};
