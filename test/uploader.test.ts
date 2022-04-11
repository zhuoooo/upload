import Uploader from '../src/uploader'
import sinon from 'sinon'
import { FakeXhr } from './xhr'

let xhr
let requests: FakeXhr[]

beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest()

    requests = []
    xhr.onCreate = function (req: FakeXhr) {
        requests.push(req)
    }
})

afterEach(function () {
    xhr.restore()
})

describe('添加单文件场景', () => {
    const upload = new Uploader({
        dom: [document.createElement('button')],
        action: '/upload',
        data: {
            test: 'upload'
        },
        headers: {
            Test: 'upload'
        }
    })

    const file = new File(['12345'], 'test.txt')
    it('文件添加后，fileAdded事件', () => {
        const addEventCb = (uploadFile) => {
            expect(uploadFile.size).toBe(file.size)
        }
        upload.on('fileAdded', addEventCb)
    })

    it('文件添加后，filesSubmitted事件', () => {
        const filesEventCb = (uploadFiles) => {
            expect(uploadFiles.length).toBe(1)
        }
        upload.on('filesSubmitted', filesEventCb)
    })

    upload.addFile(file)

    it('验证队列文件的总大小', () => {
        expect(upload.size).toBe(file.size)
        expect(upload.progress).toBe(0)
    })

    it('上传场景', () => {
        upload.upload()

        upload.on('success', (e) => {
            expect(e).toBe('OK')
        })
        upload.on('progress', (e) => {
            if (e.lengthComputable) {
                expect(e.loaded).toBeGreaterThanOrEqual(0)
                expect(e.total).toBeGreaterThanOrEqual(1)
            }
        })

        requests.forEach((item: FakeXhr) => {
            item.upload.eventListeners.progress.forEach(item => {
                item.listener({
                    lengthComputable: true,
                    loaded: 100,
                    total: 200
                })
            })
            const formData = item.requestBody
            const headers = item.requestHeaders
            expect(formData.has('file')).toBeTruthy()
            expect(formData.has('test')).toBeTruthy()
            expect(headers.Test).toBe('upload')
            expect(item.url).not.toBe('/')
            expect(item.method).not.toBe('GET')

            item.respond(
                200,
                { 'Content-Type': 'application/json' },
                'OK'
            )
        })
    })

    upload.off()

    it('中途取消文件上传', () => {
        const mockFn = jest.fn()
        upload.on('uploadStart', mockFn)
        upload.upload()

        expect(mockFn.mock.calls.length).toBe(1)
        upload.abort()
        expect(requests.every(item => item.aborted)).toBeTruthy()
    })

    it('文件上传失败，重试上传', () => {
        const mockFn = jest.fn()
        upload.on('resume', mockFn)
        upload.on('success', (e) => {
            expect(e).toBe('OK')
        })
        upload.on('error', (e) => {
            expect(e).toBe('error')
        })
        upload.upload()

        requests.forEach((item: FakeXhr) => {
            item.respond(
                500,
                { 'Content-Type': 'application/json' },
                'error'
            )
        })
        requests = []

        upload.resume()
        expect(mockFn.mock.calls.length).toBe(1)

        requests.forEach((item: FakeXhr) => {
            item.respond(
                200,
                { 'Content-Type': 'application/json' },
                'OK'
            )
        })
    })
})

describe('添加多文件场景', () => {
    const fileLimit = 2
    const upload = new Uploader({
        dom: [document.createElement('button')],
        action: 'mutli-upload',
        multiple: true,
        limit: fileLimit
    })

    const files = [new File(['12345'], 'test.txt'), new File(['123457'], 'test.txt'), new File(['12345'], 'test.txt')]

    it('文件数量限制', () => {
        const filesEventCb = (uploadFiles) => {
            expect(uploadFiles).toBe(files.slice(-fileLimit))
            expect(uploadFiles.length).not.toBe(files.length)
        }
        upload.on('filesSubmitted', filesEventCb)
    })

    upload.addFiles(files)

    it('上传场景', () => {
        upload.upload()

        upload.on('success', (e) => {
            expect(e).toBe('OK')
        })

        expect(requests.length).toBe(fileLimit)

        requests.forEach((item: FakeXhr) => {
            item.upload.eventListeners.progress.forEach(item => {
                item.listener({
                    lengthComputable: true,
                    loaded: 100,
                    total: 200
                })
            })
            const formData = item.requestBody
            expect(formData.has('file')).toBeTruthy()
            expect(item.url).not.toBe('/')
            expect(item.method).not.toBe('GET')

            item.respond(
                200,
                { 'Content-Type': 'application/json' },
                'OK'
            )
        })
    })
})
