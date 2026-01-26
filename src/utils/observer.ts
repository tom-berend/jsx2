




// // Observers (subscribers) are functions
// export type Observer = (msg?: any) => void



export class Observer {

    // sysObservers are not reset every time
    static Observers: { [type: string]: Function[] }


    static resetUserObservers() {
        Observer.Observers = {}
    }

    static addObserver(type: string, observer: Function) {

        // observers not set up, set them up
        if (Observer.Observers == undefined) {
            Observer.Observers = {}
        }

        let thisObserver = Observer.Observers

        if (thisObserver[type] == undefined) {
            thisObserver[type] = []
        }
        thisObserver[type].push(observer)
    }


    static notifyObservers(type: string, msg?: any): void {
        // console.log('in Observables.notifyObserver', msg)

        // observers not set up, set them up
        if (Observer.Observers == undefined) {
            Observer.Observers = {}
        }

        // observers is set up, but doesn't have this type.  add it
        if (type in Observer.Observers) {
            // iterate all observers for that type (none if we just added, of course)
            Observer.Observers[type].forEach(element => {
                element(msg)
            });
        }

    } // notifyObservers
} // Observable

