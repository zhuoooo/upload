# plduoa
![brage](https://img.shields.io/badge/Upload-JavaScript-green)

`plduoa` 是一个原生 `JavaScript` 编写的轻量级文件上传库，依赖 `HTML5` 的 `File API`。

目前暂时不支持大文件分片上传和拖拽上传功能。



## Install



```shell
# npm
npm install plduoa

# yarn 
yarn add plduoa
```



## Usage

支持多种引用方式：

- [x] 支持 `cjs`
- [x] 支持 `import`
- [x] 支持 `esm`

```javascript
import Uploader from 'plduoa'

let upload = new Uploader({
    dom: document.querySelector('.uploader-btn'),
    action: 'http://localhost:8000/upload'
})
```

支持事件机制

```js
upload.on('fileAdded', (file) => {
    console.log(file)
})

upload.on('filesSubmitted', (files) => {
    console.log(files)
})
```



### 配置

| 字段名          | 说明                                                         | 类型    | 默认值 |
| --------------- | ------------------------------------------------------------ | ------- | ------ |
| dom             | 用来触发选择文件的资源弹窗的 dom 节点                        | Element | []     |
| multiple        | 支持多文件上传                                               | boolean | false  |
| accept          | 限制允许选择的文件类型，更多格式见“常用 MIME 类型”表格       | string  | ''     |
| action          | 文件上传的接口                                               | string  | ''     |
| name            | 文件上传时，formData中表示二进制资源的字段名                 | string  | file   |
| limit           | 在 `multiple = true ` 时，限制选择的文件数量，注：后选择的文件会替换掉先前选择的 | number  | 1      |
| withCredentials | 允许在 `action` 是跨域场景下，携带`cookie`发送请求           | boolean | false  |
| method          | 请求的方式，注：不支持 `GET` ，目前只支持 `POST`、`PUT`、`OPTIONS` | string  | POST   |
| data            | 发送请求时，携带的一些其他参数                               | Object  | {}     |
| headers         | 发送请求时，携带的一些其他请求头部                           | Object  | {}     |
| attributes      | 可以在创建的 `<input type="file">` dom上添加一些自定义属性，如： | Object  | {}     |



### 方法

| 方法名   | 说明                         | 可接收参数                      | 返回值 |
| -------- | ---------------------------- | ------------------------------- | ------ |
| upload   | 将已选择的文件全部进行上传   | -                               | -      |
| resume   | 上次上传失败的文件再一次上传 | -                               | -      |
| abort    | 取消正在上传中的所有文件     | -                               | -      |
| cancel   | 将已选择的文件全部删除       | -                               | -      |
| addFile  | 手动添加单个文件             | (files: File, event: Event)     | -      |
| addFiles | 手动添加多个文件             | (files: FileList, event: Event) | -      |
| remove   | 移除指定文件                 | file                            | -      |



### 属性

| 名称     | 说明                       | 返回值 |
| -------- | -------------------------- | ------ |
| progress | 全部文件上传的总进度平均值 | 0~1    |
| size     | 全部文件总的大小，单位 b   | > 0    |



### 事件

| 事件名称       | 说明                                     | 参数                | 返回值 |
| -------------- | ---------------------------------------- | ------------------- | ------ |
| progress       | 每当任意文件的上传进度发变化时，就会触发 | -                   | -      |
| uploadStart    | 当文件开始上传时触发                     | -                   | -      |
| resume         | 将上传失败的文件进行再一次上传时触发     | -                   | -      |
| fileAdded      | 每个文件添加到队列中时会触发             | (uploadFile, event) | -      |
| filesSubmitted | 全部文件添加到队列中时会触发             | (files, event)      |        |
| fileRemoved    | 移除文件时触发                           | (file)              |        |



### 常用 MIME 类型

```html
<!--只支持图片格式的文件-->
<input type="file" id="imageFile" accept="image/*">
```

| 文件类型 | accept属性值                                 | 类型                                 |
| :------- | -------------------------------------------- | ------------------------------------ |
| *.3gpp   | audio/3gpp, video/3gpp                       | 3GPP Audio/Video                     |
| *.ac3    | audio/ac3                                    | AC3 Audio                            |
| *.asf    | allpication/vnd.ms-asf                       | Advanced Streaming Format            |
| *.au     | audio/basic                                  | AU Audio                             |
| *.css    | text/css                                     | Cascading Style Sheets               |
| *.csv    | text/csv                                     | Comma Separated Values               |
| *.doc    | application/msword                           | MS Word Document                     |
| *.dot    | application/msword                           | MS Word Template                     |
| *.dtd    | application/xml-dtd                          | Document Type Definition             |
| *.dwg    | image/vnd.dwg                                | AutoCAD Drawing Database             |
| *.dxf    | image/vnd.dxf                                | AutoCAD Drawing Interchange Format   |
| *.gif    | image/gif                                    | Graphic Interchange Format           |
| *.htm    | text/html                                    | HyperText Markup Language            |
| *.html   | text/html                                    | HyperText Markup Language            |
| *.jp2    | image/jp2                                    | JPEG-2000                            |
| *.jpe    | image/jpeg                                   | JPEG                                 |
| *.jpeg   | image/jpeg                                   | JPEG                                 |
| *.jpg    | image/jpeg                                   | JPEG                                 |
| *.js     | text/javascript, application/javascript      | JavaScript                           |
| *.json   | application/json                             | JavaScript Object Notation           |
| *.mp2    | audio/mpeg, video/mpeg                       | MPEG Audio/Video Stream, Layer II    |
| *.mp3    | audio/mpeg                                   | MPEG Audio Stream, Layer III         |
| *.mp4    | audio/mp4, video/mp4                         | MPEG-4 Audio/Video                   |
| *.mpeg   | video/mpeg                                   | MPEG Video Stream, Layer II          |
| *.mpg    | video/mpeg                                   | MPEG Video Stream, Layer II          |
| *.mpp    | application/vnd.ms-project                   | MS Project Project                   |
| *.ogg    | application/ogg, audio/ogg                   | Ogg Vorbis                           |
| *.pdf    | application/pdf                              | Portable Document Format             |
| *.png    | image/png                                    | Portable Network Graphics            |
| *.pot    | application/vnd.ms-powerpoint                | MS PowerPoint Template               |
| *.pps    | application/vnd.ms-powerpoint                | MS PowerPoint Slideshow              |
| *.ppt    | application/vnd.ms-powerpoint                | MS PowerPoint Presentation           |
| *.rtf    | application/rtf, text/rtf                    | Rich Text Format                     |
| *.svf    | image/vnd.svf                                | Simple Vector Format                 |
| *.tif    | image/tiff                                   | Tagged Image Format File             |
| *.tiff   | image/tiff                                   | Tagged Image Format File             |
| *.txt    | text/plain                                   | Plain Text                           |
| *.wdb    | application/vnd.ms-works                     | MS Works Database                    |
| *.wps    | application/vnd.ms-works                     | Works Text Document                  |
| *.xhtml  | application/xhtml+xml                        | Extensible HyperText Markup Language |
| *.xlc    | application/vnd.ms-excel                     | MS Excel Chart                       |
| *.xlm    | application/vnd.ms-excel                     | MS Excel Macro                       |
| *.xls    | application/vnd.ms-excel                     | MS Excel Spreadsheet                 |
| *.xlt    | application/vnd.ms-excel                     | MS Excel Template                    |
| *.xlw    | application/vnd.ms-excel                     | MS Excel Workspace                   |
| *.xml    | text/xml, application/xml                    | Extensible Markup Language           |
| *.zip    | application/zip application/x-zip-compressed | Compressed Archive                   |
