import UEvent from '../src/event'

describe('测试单事件', () => {
    const uEvent = new UEvent()
    const mockCb = jest.fn(() => { })

    it('单事件绑定', () => {
        uEvent.on('test', mockCb)
        expect(mockCb.mock.calls.length).toBe(0)

        uEvent.emit('test', 10)
        expect(mockCb.mock.calls.length).toBe(1)
    })

    it('传入指定回调，单事件解绑', () => {
        const unbindCb = jest.fn(() => {})

        uEvent.on('test', unbindCb)
        uEvent.off('test', mockCb)
        uEvent.emit('test', 10)
        expect(mockCb.mock.calls.length).toBe(0)
        expect(unbindCb.mock.calls.length).toBe(1)
    })

    it('多事件绑定', () => {
        uEvent.on('more', mockCb)
        uEvent.on('more', mockCb)
        expect(mockCb.mock.calls.length).toBe(0)

        uEvent.emit('more', 10)
        expect(mockCb.mock.calls.length).toBe(2)
    })

    it('不传入指定回调，所有同名事件解绑', () => {
        uEvent.off('more')
        uEvent.emit('more')
        expect(mockCb.mock.calls.length).toBe(0)
    })

    it('清空所有事件', () => {
        const allEvent = jest.fn(() => {})

        uEvent.on('all', allEvent)
        uEvent.off()
        uEvent.emit('all')
        expect(allEvent.mock.calls.length).toBe(0)
    })
})
