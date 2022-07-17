# /main
메인 페이지 관련 정보를 제공해주는 api

## / (GET)
### Response
```
{
    gallery: list[String], // 갤러리 이미지 url list
    campuses: list[{
        id: String, // 캠퍼스 고유아이디
        name: String, // 캠퍼스 이름
        add: String // 캠퍼스 주소
    }],
    awards: list[{
        id: String, // 어워드 고유아이디
        imgUrl: String, // 어워드 이미지 url
    }]
    books: list[{
        name: String, // book 이름
        url: String, // book 연결 링크 url
        imgUrl: book // 이미지 url
    }],
    blogs: list[{
        title: String, // 블로그 글 제목
        url: String // 블로그 url
    }]
}
```

## /:id (GET)
### URL Parameters
 - id : 캠퍼스 고유아이디
### Response
```
{
    gallery: list[String], // 갤러리 이미지 url list
    notices: list[{
        id: String, // 공지 글 고유아이디
        title: String
    }],
    posters: list[{
        title: String,
        content: String,
        url: String
    }],
    map: {
        lat: Number, // 캠퍼스 찾아오시는 길 위치 정보
        lng: Number // 캠퍼스 찾아오시는 길 위치 정보
    },
    add: String, // 캠퍼스 주소
    call: String // 캠퍼스 전화번호
}
```
