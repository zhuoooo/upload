import Event from './event'
import UploadFile from './file'

type SafeElement = Element & HTMLDivElement & HTMLInputElement;
interface UploaderOptions {
    dom: SafeElement[]
    multiple: boolean
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'OPTIONS'
    data: Record<string, any>
    headers: Record<string, any>
    attributes: Record<string, string>
}

export default class Uploader extends Event {
    private files: UploadFile[] = []
    private opts: UploaderOptions = {
        dom: [],
        multiple: false,
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

                Object.keys(style).forEach(key => {
                    input.style[key] = style[key]
                })

                node.appendChild(input)
                node.addEventListener('click', () => {
                    input.click()
                }, false)
            }

            if (this.opts.multiple) {
                input.setAttribute('multiple', 'multiple')
            }

            Object.keys(opts.attributes).forEach(key => {
                input.setAttribute(key, opts.attributes[key])
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
    addFile (file: FileList, event) {}

    addFiles (fileList: FileList, event) {}

    removeFile (file) {}
}
