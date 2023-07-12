import * as task from "azure-pipelines-task-lib/task"
import * as tool from "azure-pipelines-tool-lib/tool"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import { run } from "../src/index"
import * as scanner from "../src/scanner"
import { BoostParams } from "../src/params"

const INITIAL_ENV = process.env

jest.mock("../src/scanner")

beforeEach(async () => {
  const tmpdir = await fs.promises.mkdtemp(
    path.resolve(os.tmpdir(), "boostsec-scanner-szure")
  )

  process.env = {
    TMPDIR: tmpdir,
  }
  process.chdir = jest.fn()
})

afterEach(async () => {
  jest.clearAllMocks()
  jest.resetModules()
  jest.restoreAllMocks()

  if (process.env.TMPDIR !== undefined) {
    await fs.promises.rm(process.env.TMPDIR, { recursive: true, force: true })
  }

  process.env = INITIAL_ENV
})

describe("run", () => {
  test("run ignores workingDirectory by default", async () => {
    await run()

    expect(process.chdir).not.toHaveBeenCalled()
    expect(scanner.downloadCLI).toHaveBeenCalled()
    expect(scanner.executeCLI).toHaveBeenCalled()
  })

  test("run changes workingDirectory", async () => {
    process.env.BOOST_WORKING_DIRECTORY = "/tmp"

    await run()

    expect(process.chdir).toHaveBeenCalledWith("/tmp")
    expect(scanner.downloadCLI).toHaveBeenCalled()
    expect(scanner.executeCLI).toHaveBeenCalled()
  })
})
