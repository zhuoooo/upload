import Event from './event'
import UploadFile from './file'

export default class Uploader extends Event {
    private files: UploadFile[] = [];
    private opts = {};

    constructor (options) {
        super()
        this.opts = {
            ...this.opts,
            ...options
        }
    }

    public upload () {

    }

    // 将上传失败的文件重试
    resume () {}

    // 暂停上传
    pause () {}

    // 取消全部文件的上传
    cancel () {}

    // 总进度
    progress () {}

    // 获取总的文件大小，单位 b
    getSize () {}

    // 添加一个文件
    addFile (file: UploadFile, event) {}

    addFiles (fileList: UploadFile[], event) {}

    removeFile (file) {}
}
