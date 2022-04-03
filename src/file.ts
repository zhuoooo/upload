
import UEvent from './event'
import { UploaderOptions } from './uploader'

type FileOptions = Pick<UploaderOptions, 'url'|'method'|'headers'|'data'>

export default class UploadFile extends UEvent {
    private raw: File
    private id: string
    private xhr: XMLHttpRequest|null = new XMLHttpRequest()
    private error: boolean = false
   private opts: FileOptions

   constructor (file: File, id, options: FileOptions) {
       super()
       this.raw = file
       this.id = id
       this.opts = options

       this.bootstrap()
   }

   private getType (): string {
       return this.raw.type
   }

   private getName (): string {
       return this.raw.name
   }

   private getPath () {
       return this.raw.webkitRelativePath || this.raw.name
   }

   progressHandler () {}

   doneHandler () {}

   send () {
       const options = this.opts
       const xhr = new XMLHttpRequest()

       xhr.upload.addEventListener('progress', this.progressHandler, false)
       xhr.addEventListener('load', this.doneHandler, false)
       xhr.addEventListener('error', this.doneHandler, false)
       this.xhr = xhr
       const data = new FormData()

       Object.entries(options.headers).forEach(([header, value]) => {
           xhr.setRequestHeader(header, value)
       })

       data.append('file', this.raw, this.getName())
       // data.append('filename', this.getName())

       xhr.open(options.method, options.url, true)
       xhr.send(data)
   }

   pause () {

   }

   resume () {

   }

   abort (reset = false) {
       const xhr = this.xhr
       this.xhr = null
       xhr?.abort()
   }

   cancel () {
       this.emit('cancelFile')
   }

   retry () {

   }

   bootstrap () {
       this.abort()
       this.error = false
   }

   progress () {

   }

   isUploading () {

   }

   isComplete () {

   }

   sizeUploaded () {

   }

   getExtension () {
       const name = this.getName()
       return name.substr((~-name.lastIndexOf('.') >>> 0) + 2).toLowerCase()
   }
}
