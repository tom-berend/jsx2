import { Board } from '../src/base/board.js';

////////////////// prototype test
describe('type suite description', () => {
    it('test description', () => {
        let a = 0
        expect(a).toBe(0)
    });
});
//////////////////////////////////////////////////
import { LooseObject } from '../src/interfaces.js'
import { Type } from '../src/utils/type.js';
import { Options } from '../src/options.js';
import { createPoint } from '../src/base/point.js';

// // temporary for testing
// class Board {
//     BOARD_MODE_NONE = 0
//     objects = {}
//     jc = {}
//     update = () => { }
//     containerObj = true
//     id = 'string'
// }

describe('keysToLowerCase', () => {
    it('returns an object with keys in lower case', () => {
        expect(Type.keysToLowerCase({})).toEqual({});
        expect(Type.keysToLowerCase({ a: false })).toEqual({ a: false });
        expect(Type.keysToLowerCase({ A: false })).toEqual({ a: false });
        expect(Type.keysToLowerCase({ A: { B: { C: false } } })).toEqual({ a: { b: { c: false } } });
        expect(Type.keysToLowerCase({ A: [1, 2, 3] })).toEqual({ a: [1, 2, 3] });


    });
})

describe('deepcopy', () => {
    it('adds obj2 to obj1 NOT lowercalse', () => {
        let obj1 = { a: 1, b: 2 }
        let obj2 = { c: 3 }
        expect(Type.deepCopy(obj1, obj2)).toEqual({ a: 1, b: 2, c: 3 });   // .toEqual for objects
        expect(Type.deepCopy(obj1, obj2)).not.toEqual({ a: 1, b: 2, d: 3 });   // .not.toEqual for objects
        let obj3 = { B: 4 }
        expect(Type.deepCopy(obj1, obj3)).toEqual({ a: 1, b: 2, B: 4 });
        expect(Type.deepCopy(obj1, obj3, true)).toEqual({ a: 1, b: 4 });
        let obj4 = { B: 4, C: { d: 5, e: { f: 6 } } }  // nested objects
        expect(Type.deepCopy(obj1, obj4)).toEqual({ a: 1, b: 2, B: 4, C: { d: 5, e: { f: 6 } } });
        expect(Type.deepCopy(obj1, obj4, true)).toEqual({ a: 1, b: 4, c: { d: 5, e: { f: 6 } } });
    });
});


describe("isObject", function () {
    it('surprisingly hard to verify that something is an object', () => {
        expect(Type.isObject({})).toBe(true);
        expect(Type.isObject(null)).toBe(false);
        expect(Type.isObject(() => { })).toBe(false);
    });
});
describe('copyAttributes(attr, special, toLower, ignoreUndefinedSpecials)', () => {
    it('in-place (deep) merge of attributes', () => {
        expect(Type.initVisProps({}, {})).toEqual({})

        expect(Type.initVisProps({}, { Compile: true })).toEqual({ compile: true })
        expect(Type.initVisProps({ Compile: true }, {})).toEqual({ compile: true })

        expect(Type.initVisProps({ Enabled: false, compile: false }, { Compile: true })).toEqual({ enabled: false, compile: true })


        let a = {
            a1: 'string',
            a2: true,
            a3: 3.14,
            a4: { x: { y: 1, z: [1] } }
        }
        let b = {       // basic test plus lowercase test
            B1: 'alien',
            B2: false,
            B3: 123456
        }
        let c = {
            a1: 'STRING'
        }
        let d = {       // replace a single value in a deep
            a4: { x: { y: 1, z: [2] } }
        }
        let e = {       // change flat to object and vice versa
            a2: { enabled: true },
            a4: false
        }
        expect(Type.initVisProps(a, b)).toEqual({ a1: 'string', a2: true, a3: 3.14, a4: { x: { y: 1, z: [1] } }, b1: 'alien', b2: false, b3: 123456 })
        expect(Type.initVisProps(a, c)).toEqual({ a1: 'STRING', a2: true, a3: 3.14, a4: { x: { y: 1, z: [1] } } })
        expect(Type.initVisProps(a, d)).toEqual({ a1: 'string', a2: true, a3: 3.14, a4: { x: { y: 1, z: [2] } } })
        expect(Type.initVisProps(a, e)).toEqual({ a1: 'string', a2: { enabled: true }, a3: 3.14, a4: false })

        // only the second element is converted to lowercase
        let x = { A: true }
        let y = { B: true }
        expect(Type.initVisProps(x, y)).toEqual({ a: true, b: true })


        let x1 = { enabled: true, compile: true }
        let y1 = { enabled: false }
        let z1 = Type.initVisProps(x1, y1)
        expect(z1).toEqual({ enabled: false, compile: true })
        let y2 = { Enabled: false }
        let z2 = Type.initVisProps(x1, y2)  // 'enabled' vs 'Enabled', merge always takes to lowercase
        expect(z1).toEqual({ enabled: false, compile: true })
    });
});
describe('getObjectDiff(a:object, b:object): object)', () => {
    it('Generates an attributes object overwritten by the user specified attributes.', () => {
        let a = { a: true, b: false, c: { d: true } }
        let b = { a: true, b: false, c: { d: true } }
        let c = { a: true, c: { d: true } }     // missing b
        let d = { a: true, b: false, c: { d: true }, f: 'added' }

        expect(Type.getObjectDiff(a, b)).toEqual({})   // same
        expect(Type.getObjectDiff(a, c)).toEqual({ b: { expect: false, found: undefined } })
        expect(Type.getObjectDiff(a, d)).toEqual({ f: { expect: undefined, found: 'added' } })
    });
});

describe('check a few isSomething() methods', () => {
    it('checks', () => {
        document.body.innerHTML =
            `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`

        let b = new Board('box')
        expect(Type.isId(b, 'foo')).toBe(false)

        let p = createPoint(b, [0, 0])
        expect(Type.isId(b, p.id)).toBe(true)

        // adding a point also adds a label so we should see its id too
        expect(p.label).toBeTruthy()    // should not be null
        if (p.label)    //
            expect(Type.isId(b, p.label.id)).toBe(true)

       expect(Type.isPoint(b)).toBe(false)
       expect(Type.isPoint(p)).toBe(true)
    });
});
////////////////// prototype test
describe(' keysToLowerCase(obj:object):object', () => {
    it('Converts an object to a new object containing only lower case properties', () => {
        let a: LooseObject = { A: 1 }
        expect(Type.keysToLowerCase(a)).toEqual({ a: 1 })
    });
});
