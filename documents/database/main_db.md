# gallery_table      


| 컬럼명  | 자료형 | 비고 |
| :---: | :---: | :---: |
|id|int|고유 ID|
|name|varchar|파일명|
|etc|varchar|기타 설명|
|imgUrl|varchar|갤러리 img 경로|
|registDate|datetime|등록일|
|modifyDate|datetime|수정일|
|isShow|boolean|공개여부|
|startDate|datetime|공개 시작일|
|endDate|datetime|공개 마감일|

# campuses_table

| 컬럼명  | 자료형 | 비고 |
| :---: | :---: | :---: |
|id|int|고유 ID|
|name|varchar|캠퍼스명|
|imgUrl|varchar|캠퍼스 이미지 경로|
|registDate|datetime|등록일|
|modifyDate|datetime|수정일|
|isShow|boolean|공개여부|
|link|varchar|외부 링크|
|address|varchar|주소|
|lat|varchar|주소좌표|
|lng|varchar|주소좌표|

# award_table

| 컬럼명  | 자료형 | 비고 |
| :---: | :---: | :---: |
|id|int|고유 ID|
|name|varchar|이름|
|imgUrl|varchar|이미지 경로|
|isShow|boolean|공개여부|
|registDate|datetime|등록일|
|modifyDate|datetime|수정일|


# books_table

| 컬럼명  | 자료형 | 비고 |
| :---: | :---: | :---: |
|id|int|고유 ID|
|name|varchar|이름|
|url|varchar|외부 링크 URL|
|imgUrl|varchar|이미지 경로|
|isShow|boolean|공개여부|
|registDate|datetime|등록일|
|modifyDate|datetime|수정일|


# blogs_table

| 컬럼명  | 자료형 | 비고 |
| :---: | :---: | :---: |
|id|int|고유 ID|
|title|varchar|제목|
|url|varchar|링크 URL|
|isShow|boolean|공개여부|
|registDate|datetime|등록일|
|modifyDate|datetime|수정일|


# notice_table

| 컬럼명  | 자료형 | 비고 |
| :---: | :---: | :---: |
|id|int|고유 ID|
|title|varchar|제목|
|content|varchar|본문|
|isShow|boolean|공개여부|
|registDate|datetime|등록일|
|modifyDate|datetime|수정일|


# poster_table

| 컬럼명  | 자료형 | 비고 |
| :---: | :---: | :---: |
|id|int|고유ID|
|title|varchar|제목|
|content|varchar|본문|
|isShow|boolean|공개여부|
|registDate|datetime|등록일|
|modifyDate|datetime|수정일|
|imgUrl|varchar|이미지 URL|
url|varchar|링크 URL|
