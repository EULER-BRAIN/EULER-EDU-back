module.exports = {
  award: {
    name: RegExp("^.{1,30}$"),
    content: RegExp("^.{1,50}$"),
  },
  notice: {
    title: RegExp("^.{1,40}$"),
    link: RegExp("^.{0,100}$"),
  },
  poster: {
    title: RegExp("^.{1,30}$"),
    content: RegExp("^.{1,50}$"),
    link: RegExp("^.{1,100}$"),
  },
  teacher: {
    id: RegExp("^[a-z0-9_-]{5,20}$"),
    password: RegExp("^.{10,30}$"),
    name: RegExp("^[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9-_ ]{2,15}$"),
  },
  imgType : RegExp("^(image/png|image/jpg|image/jpeg)$"),
}
