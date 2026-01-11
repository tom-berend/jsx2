////////////////// prototype test
import { Observer } from "../../src/utils/observer"
describe('setup up some observers', () => {
    it('basic, no message handling', () => {
        let event = 'not yet'

        Observer.addObserver('testSuite', (msg: string) => event = 'has happened')
        expect(event).toBe('not yet')

        Observer.notifyObservers('testSuite', true)  // message doesn't matter, not typechecked
        expect(event).toBe('has happened')
    });

    it('send an event with a message', () => {
        let event = 'not yet'

        Observer.addObserver('testSuite', (msg: string) => event = `${msg} has happened`)
        expect(event).toBe('not yet')

        Observer.notifyObservers('testSuite', 'my event')
        expect(event).toBe('my event has happened')
    });
});
//
