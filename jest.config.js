import { createDefaultPreset } from "ts-jest"


const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
    transform: {
        ...tsJestTransformCfg,
    },
    testEnvironment: 'jsdom',
    verbose: false,
    moduleNameMapper: {
        "^(\\.\\.?\\/.+)\\.js$": "$1",
    },
}