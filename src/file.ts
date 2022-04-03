
import UEvent from './event'
import { UploaderOptions } from './uploader'

type FileOptions = Pick<UploaderOptions, 'url' | 'method' | 'headers' | 'data' | 'withCredentials'>

type Status = 'success' | 'error' | 'uploading' | 'pending' | 'reading'
export default class UploadFile extends UEvent {
    private raw: File
    private id: string
    private xhr: XMLHttpRequest | null = new XMLHttpRequest()
    private error: boolean = false
    private opts: FileOptions

    private retries = 0
    private pendingRetry = false

    private loaded: number = 0 // 已发送的文件大小
    private total: number = 0 // 传输的大小

    constructor (file: File, id, options: FileOptions) {
        super()
        this.raw = file
        this.id = id
        this.opts = options

        this.bootstrap()
    }

    get message (): string {
        return this.xhr?.responseText || ''
    }

    get progress () {
        if (this.pendingRetry) {
            return 0
        }
        const { loaded, total } = this

        if (['success', 'error'].includes(this.status)) {
            return 1
        } else if (this.status === 'pending') {
            return 0
        } else {
            return total > 0 ? loaded / total : 0
        }
    }

    get status (): Status {
        const { xhr } = this
        if (this.pendingRetry) {
            // if pending retry then that's effectively the same as actively uploading,
            // there might just be a slight delay before the retry starts
            return 'uploading'
        } else if (!xhr) {
            return 'pending'
        } else if (xhr.readyState < 4) {
            // Status is really 'OPENED', 'HEADERS_RECEIVED'
            // or 'LOADING' - meaning that stuff is happening
            return 'uploading'
        } else {
            const xhrStatus = xhr.status
            if (xhrStatus >= 200 && xhrStatus < 299) {
                // HTTP 200, perfect
                // HTTP 202 Accepted - The request has been accepted for processing, but the processing has not been completed.
                return 'success'
            } else if (xhrStatus >= 400) {
                // HTTP 413/415/500/501, permanent error
                return 'error'
            } else {
                // this should never happen, but we'll reset and queue a retry
                // a likely case for this would be 503 service unavailable
                this.abort()
                return 'pending'
            }
        }
    }

    get isUploading () {
        return this.status === 'uploading'
    }

    get isComplete () {
        return !['success', 'error', 'uploading', 'pending'].includes(this.status)
    }

    get extension () {
        const name = this.filename
        return name.substr((~-name.lastIndexOf('.') >>> 0) + 2).toLowerCase()
    }

    get size () {
        return this.raw.size
    }

    get filename (): string {
        return this.raw.name
    }

    private getPath () {
        return this.raw.webkitRelativePath || this.raw.name
    }

    progressHandler (event: ProgressEvent<XMLHttpRequestEventTarget>) {
        if (event.lengthComputable) {
            this.loaded = event.loaded
            this.total = event.total
        }

        this.emit('progress', event)
    }

    doneHandler (event: ProgressEvent<XMLHttpRequestEventTarget>) {
        const status = this.status

        if (['success', 'error'].includes(status)) {
            this.emit(status, this.message)
        }
    }

    send () {
        const xhr = new XMLHttpRequest()

        const data = this.prepareXhrRequest(xhr)
        xhr.send(data)
        this.xhr = xhr
    }

    prepareXhrRequest (xhr) {
        const options = this.opts
        const { method, url, withCredentials, data } = options
        const requestBody = new FormData()

        xhr.upload.addEventListener('progress', (e) => {
            this.progressHandler(e)
        }, false)
        xhr.addEventListener('load', (e) => {
            this.doneHandler(e)
        }, false)
        xhr.addEventListener('error', (e) => {
            this.doneHandler(e)
        }, false)

        requestBody.append('file', this.raw, this.filename)
        Object.entries(data).forEach(([key, value]) => {
            (requestBody as FormData).append(key, value)
        })

        Object.entries(options.headers).forEach(([header, value]) => {
            xhr.setRequestHeader(header, value)
        })

        xhr.withCredentials = withCredentials
        xhr.open(method.toUpperCase(), url, true)
        return requestBody
    }

    resume () {

    }

    abort (reset = false) {
        const xhr = this.xhr
        if (reset) {
            this.xhr = null
        }
        xhr?.abort()
    }

    cancel () {
        this.abort()
    }

    retry () {

    }

    bootstrap () {
        this.abort(true)
        this.error = false
    }
}
