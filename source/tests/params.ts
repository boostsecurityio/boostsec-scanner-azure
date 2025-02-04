import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import { BoostParams } from "../src/params"

const INITIAL_ENV = process.env

beforeEach(async () => {
  const tmpdir = await fs.promises.mkdtemp(
    path.resolve(os.tmpdir(), "boostsec-scanner-azure")
  )

  process.env = {
    TMPDIR: tmpdir,
  }
})

afterEach(async () => {
  if (process.env.TMPDIR !== undefined) {
    await fs.promises.rm(process.env.TMPDIR, { recursive: true, force: true })
  }

  process.env = INITIAL_ENV
})

describe("BoostParams", () => {
  test("defines default variables", async () => {
    const mockGetInput = () => undefined
    const mockTl = {
      getInput: mockGetInput,
    }
    const tmpdir = process.env.TMPDIR ?? "/tmp"

    const params = new BoostParams(process.env, mockTl)
    const expected: Record<string, string> = {
      BOOST_EXE: path.join(tmpdir, "boost-cli", "latest"),
      BOOST_CLI_URL: "https://assets.build.boostsecurity.io",
      BOOST_CLI_VERSION: "1",
      BOOST_DOWNLOAD_URL:
        "https://assets.build.boostsecurity.io/boost-cli/get-boost-cli",
      BOOST_LOG_COLORS: "true",
      BOOST_TMP_DIR: tmpdir,
    }
    expect(params.asBoostEnv()).toStrictEqual(expected)
  })

  const GetInputTestCases = [
    ["BOOST_CLI_ARGUMENTS", "additionalArgs"],
    ["BOOST_API_ENABLED", "apiEnabled"],
    ["BOOST_API_ENDPOINT", "apiEndpoint"],
    ["BOOST_API_TOKEN", "apiToken"],
    ["BOOST_CLI_VERSION", "cliVersion"],
    ["BOOST_IGNORE_FAILURE", "ignoreFailure"],
    ["BOOST_LOG_COLORS", "logColors"],
    ["BOOST_LOG_LEVEL", "logLevel"],
    ["BOOST_GIT_MAIN_BRANCH", "mainBranch"],
    ["BOOST_PRE_SCAN", "preScanCmd"],
    ["BOOST_SCANNER_REGISTRY_MODULE", "registryModule"],
    ["BOOST_SCANNER_REGISTRY", "registryPath"],
    ["BOOST_SCAN_LABEL", "scanLabel"],
    ["BOOST_SCANNER_ID", "scannerId"],
    ["BOOST_SCAN_PATH", "scanPath"],
    ["BOOST_DIFF_SCAN_TIMEOUT", "scanTimeout"],
    ["BOOST_DIFF_SCAN_TIMEOUT", "scanDiffTimeout"],
    ["BOOST_MAIN_SCAN_TIMEOUT", "scanMainTimeout"],
    ["BOOST_TRIGGER_ID", "triggerId"],
    ["BOOST_WORKING_DIRECTORY", "workingDirectory"],
  ]

  test.each(GetInputTestCases)(
    "defines %s variable from %s",
    async (env: string, input: string) => {
      const mockGetInput = (name: string) => {
        if (name == input) {
          return input
        }
      }
      const mockTl = {
        getInput: mockGetInput,
      }
      const tmpdir = process.env.TMPDIR ?? "/tmp"

      const params = new BoostParams(process.env, mockTl)
      const expected: Record<string, string> = {
        BOOST_EXE: path.join(tmpdir, "boost-cli", "latest"),
        BOOST_CLI_URL: "https://assets.build.boostsecurity.io",
        BOOST_CLI_VERSION: "1",
        BOOST_DOWNLOAD_URL:
          "https://assets.build.boostsecurity.io/boost-cli/get-boost-cli",
        BOOST_LOG_COLORS: "true",
        BOOST_TMP_DIR: tmpdir,
      }
      expected[env] = input
      expect(params.asBoostEnv()).toStrictEqual(expected)
    }
  )

  test("ensures input takes precedence over env", async () => {
    const mockGetInput = () => "input value"
    const mockTl = {
      getInput: mockGetInput,
    }

    const params = new BoostParams({ BOOST_API_TOKEN: "env value" }, mockTl)
    expect(params.asBoostEnv().BOOST_API_TOKEN).toStrictEqual("input value")
  })
})
