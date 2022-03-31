
export default class UploadFile {
    private raw: File
    private type: string
    private name: string
    private size: number
    private path: string
    private paused = false

    constructor (file: File, id) {
        this.raw = file
        this.type = file.type
        this.name = file.name
        this.size = file.size
        this.path = file.webkitRelativePath || file.name
    }

    pause () {

    }

    resume () {

    }

    abort (reset) {

    }

    cancel () {

    }

    retry () {

    }

    bootstrap () {

    }

    progress () {

    }

    isUploading () {

    }

    isComplete () {

    }

    sizeUploaded () {

    }

    getType () {

    }

    getExtension () {
        return this.name.substr((~-this.name.lastIndexOf('.') >>> 0) + 2).toLowerCase()
    }
}
