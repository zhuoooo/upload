import UEvent from './event'
import UploadFile from './file'

type SafeElement = HTMLElement;

export interface UploaderOptions {
    dom: SafeElement[]
    multiple: boolean

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#attr-accept
    accept: string
    action: string
    name: string
    limit: number
    withCredentials: boolean
    method: 'POST' | 'PUT' | 'OPTIONS'
    data: Record<string, any>
    headers: Record<string, any>
    attributes: Record<string, string>
}

export default class Uploader extends UEvent {
    protected files: UploadFile[] = []
    private opts: UploaderOptions = {
        dom: [],
        multiple: false,
        accept: '',
        withCredentials: false,
        action: '/',
        name: 'file',
        limit: 1,
        method: 'POST',
        data: {},
        headers: {},
        attributes: {}
    }

    constructor (options: Partial<UploaderOptions> = {}) {
        super()
        const opts = {
            ...this.opts,
            ...options
        }
        this.opts = opts

        this.handleUploadDom(Array.isArray(opts.dom) ? opts.dom : [opts.dom])
    }

    private handleUploadDom (domNodes: SafeElement[]) {
        const { attributes, multiple, accept } = this.opts
        domNodes.forEach((node) => {
            let input: HTMLInputElement
            if (node.tagName.toLocaleLowerCase() === 'input' && (node as HTMLInputElement).type === 'file') {
                input = node as HTMLInputElement
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

            if (multiple) {
                attributes.multiple = 'multiple'
            }

            if (accept) {
                attributes.accept = accept
            }

            Object.entries(attributes).forEach(([key, value]) => {
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
    resume () {
        this.emit('resume')
        this.files.filter(item => item.status === 'error').forEach(item => item.resume())
    }

    abort () {
        this.files.forEach(item => item.abort())
    }

    // 取消全部文件的上传
    cancel () {
        this.files.forEach(item => this.remove(item))
    }

    // 总进度
    get progress () {
        const { files } = this
        return files.length
            ? files.map(file => file.progress).reduce((total = 0, curr) => {
                return total + curr
            }) / files.length
            : 0
    }

    // 获取总的文件大小，单位 b
    get size () {
        const { files } = this
        return files.length
            ? files.map(file => file.size).reduce((total = 0, curr) => {
                return total + curr
            })
            : 0
    }

    // 添加一个文件
    addFile (file: File, event?: Event) {
        this.addFiles([file], event)
    }

    addFiles (files: FileList|File[], event?: Event) {
        const opts = this.opts
        const uploadFiles: UploadFile[] = []
        for (let i = 0; i < files.length; ++i) {
            const file = files[i]
            if (file.size > 0 && !(file.size % 4096 === 0 && (file.name === '.'))) {
                const fileID = this.genUniqueID(file)
                const uploadFile = new UploadFile(file, fileID, opts)

                ;['success', 'error', 'progress'].forEach(eventName => {
                    uploadFile.on(eventName, (...args) => {
                        this.emit(eventName, ...args)
                    })
                })

                this.emit('fileAdded', uploadFile, event)
                uploadFiles.push(uploadFile)
            }
        }

        uploadFiles.forEach(file => {
            const limit = opts.multiple ? opts.limit : 1
            if (this.files.length >= limit) {
                this.remove(this.files[0])
            }

            this.files.push(file)
        })

        this.emit('filesSubmitted', this.files, event)
    }

    remove (file: UploadFile) {
        const fileIndex = this.files.findIndex(item => item === file)
        this.files.splice(fileIndex, 1)
        file.abort()
        this.emit('fileRemoved', file)
    }

    private genUniqueID (file: File) {
        const relativePath = file.webkitRelativePath || file.name
        return file.size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '')
    }
}
