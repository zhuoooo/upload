
interface UploadEventListeners {
    progress: {
        listener: (e: Partial<ProgressEvent<XMLHttpRequestEventTarget>>) => {}
    }[]
}

export interface FakeXhr {
    url: string
    method: string
    requestBody: FormData
    requestHeaders: Record<string, string>
    upload: {
        eventListeners: UploadEventListeners
    }
    aborted?: boolean
    respond: (status: number, resHeader: object, responseText: string) => {}
}
