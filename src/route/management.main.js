const express = require('express');
const awsS3 = require('../db/awsS3');
const { awardModel } = require('../db/mongo');
const router = express.Router();

router.use(require('../middlewares/authTeacher')('administrator'));

router.get("/award", async (req, res) => {
  try {
    const awards = await awardModel.find().sort('-registDate isShow');
    if (!awards) {
      return res.status(403).json({
        error: "management/main/award : no corresponding teacher"
      })
    }
    awsS3.getS3List('awards/', (err, awardsS3) => {
      if (err) {
        return res.status(401).json({
          error: "management/main/award : internal server error"
        })
      }
      const imgList = [];
      const imgCheck = {};
      awardsS3.Contents.forEach(item => {
        if (!item.Key.startsWith('awards/')) return;
        if (!item.Key.endsWith('.png')) return;
        imgList.push(item.Key.slice(7, -4))
      })
      const ret = awards.map(item => {
        const id = item._id.toString();
        const isImg = (imgList.indexOf(id) != -1 ? true : false);
        if (isImg) imgCheck[id] = true;
        return {
          _id: id,
          name: item.name,
          content: item.content,
          isShow: item.isShow,
          isImg: isImg,
          registDate: item.registDate
        }
      })
      imgList.forEach(item => {
        if (!imgCheck[item]) {
          ret.push({
            _id: item,
            name: 'S3-Contra',
            content: 'DB에 등록되어 있지 않은 이미지가 S3에 저장되어 있습니다.',
            isShow: false,
            isImg: true,
            registDate: new Date()
          })
        }
      })
      return res.json({
        awards: ret
      })
    })
  }
  catch (e) {
    console.log(e);
    return res.status(401).json({
      error: "management/main/award : internal server error"
    })
  }
})

module.exports = router;
