type EventCb = (...args) => void

interface EventItem {
    [eventName: string]: Array<EventCb>;
}

export default class Event {
    private events: EventItem = {}

    on (event: string, callback: EventCb) {
        if (!Object.prototype.hasOwnProperty.call(this.events, event)) {
            this.events[event] = []
        }

        this.events[event].push(callback)
    }

    off (event?: string, callback?: EventCb) {
        if (event !== undefined) {
            if (callback !== undefined) {
                if (Object.prototype.hasOwnProperty.call(this.events, event)) {
                    this.events[event] = this.events[event].filter(item => item !== callback)
                }
            } else {
                delete this.events[event]
            }
        } else {
            this.events = {}
        }
    }

    emit (event: string, ...args) {
        const callbacks = this.events[event] ?? []

        callbacks.forEach(cb => cb(args))
    }
}
