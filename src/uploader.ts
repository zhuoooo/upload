import UEvent from './event'
import UploadFile from './file'

type SafeElement = Element & HTMLDivElement & HTMLInputElement;

export interface UploaderOptions {
    dom: SafeElement[]
    multiple: boolean
    url: string
    withCredentials: boolean
    method: 'POST' | 'PUT' | 'OPTIONS'
    data: Record<string, any>
    headers: Record<string, any>
    attributes: Record<string, string>
}

export default class Uploader extends UEvent {
    private files: UploadFile[] = []
    private opts: UploaderOptions = {
        dom: [],
        multiple: false,
        withCredentials: false,
        url: '/',
        method: 'POST',
        data: {},
        headers: {},
        attributes: {}
    }

    constructor (options: Partial<UploaderOptions>) {
        super()
        const opts = {
            ...this.opts,
            ...options
        }
        this.opts = opts

        this.handleUploadDom(Array.isArray(opts.dom) ? opts.dom : [opts.dom])
    }

    handleUploadDom (domNodes: SafeElement[]) {
        const opts = this.opts
        domNodes.forEach((node) => {
            let input: HTMLInputElement
            if (node.tagName.toLocaleLowerCase() === 'input' && node.type === 'file') {
                input = node
            } else {
                input = document.createElement('input')
                input.setAttribute('type', 'file')
                const style = {
                    visibility: 'hidden',
                    position: 'absolute',
                    width: '1px',
                    height: '1px'
                }

                Object.entries(style).forEach(([key, value]) => {
                    input.style[key] = value
                })

                node.appendChild(input)
                node.addEventListener('click', () => {
                    input.click()
                }, false)
            }

            if (this.opts.multiple) {
                input.setAttribute('multiple', 'multiple')
            }

            Object.entries(opts.attributes).forEach(([key, value]) => {
                input.setAttribute(key, value)
            })

            input.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement
                if (target.value && target.files) {
                    this.addFiles(target.files, e)
                    target.value = ''
                }
            }, false)
        })
    }

    upload () {
        this.emit('uploadStart')
        this.files.forEach(item => {
            item.send()
        })
    }

    // 将上传失败的文件重试
    resume () {}

    // 取消全部文件的上传
    cancel () {
        this.files.forEach(item => this.removeFile(item))
    }

    // 总进度
    progress () {
        this.emit('progress')
    }

    // 获取总的文件大小，单位 b
    getSize () {
        return this.files.map(file => file.size).reduce((total = 0, curr) => {
            return total + curr
        })
    }

    // 添加一个文件
    addFile (file: File, event: Event) {
        const fileList = new FileList()
        fileList[0] = file
        this.addFiles(fileList, event)
    }

    addFiles (files: FileList, event: Event) {
        const opts = this.opts
        const uploadFiles: UploadFile[] = []
        for (let i = 0; i < files.length; ++i) {
            const file = files[i]
            if (file.size > 0 && !(file.size % 4096 === 0 && (file.name === '.'))) {
                const fileID = this.genUniqueID(file)
                const uploadFile = new UploadFile(file, fileID, opts)

                uploadFile.on('progress', () => {
                    this.progress()
                })

                this.emit('fileAdded', file, event)
                uploadFiles.push(uploadFile)
            }
        }

        uploadFiles.forEach(file => {
            if (!opts.multiple && this.files.length > 0) {
                this.removeFile(this.files[0])
            }

            this.files.push(file)
        })

        this.emit('filesSubmitted', files, event)
    }

    removeFile (file: UploadFile) {
        const fileIndex = this.files.findIndex(item => item === file)
        this.files.splice(fileIndex, 1)
        file.abort(true)
        this.emit('fileRemoved', file)
    }

    private genUniqueID (file: File) {
        const relativePath = file.webkitRelativePath || file.name
        return file.size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '')
    }
}
