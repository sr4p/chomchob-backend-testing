import { defaults as tsjPreset } from 'ts-jest/presets'

export default {
  globals: {
    server: undefined,
    bearerToken: undefined
  },
  transform: {
    ...tsjPreset.transform,
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts",
    "jest-extended/all"
  ],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleDirectories: ["node_modules"],
  testEnvironment: "node"
}