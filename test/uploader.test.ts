import Uploader from '../src/uploader'
import sinon from 'sinon'

let xhr, requests

beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest()

    requests = []
    xhr.onCreate = function (req) {
        requests.push(req)
    }
})

afterEach(function () {
    xhr.restore()
})

describe('添加单文件场景', () => {
    const upload = new Uploader({
        dom: [document.createElement('button')],
        action: '/upload'
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
        upload.on('error', (e) => {
            expect(!!e).toBeTruthy()
        })

        requests[0].respond(
            200,
            { 'Content-Type': 'application/json' },
            'OK'
        )
    })
})

describe('添加多文件场景', () => {
    const fileLimit = 2
    const upload = new Uploader({
        dom: [document.createElement('button')],
        multiple: true,
        limit: fileLimit
    })

    const files = [new File(['12345'], 'test.txt'), new File(['123457'], 'test.txt'), new File(['12345'], 'test.txt')]

    upload.addFiles(files)

    it('文件数量限制', () => {
        const filesEventCb = (uploadFiles) => {
            expect(uploadFiles).toBe(files.slice(-fileLimit))
            expect(uploadFiles.length).not.toBe(files.length)
        }
        upload.on('filesSubmitted', filesEventCb)
    })
})
