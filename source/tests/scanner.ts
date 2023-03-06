import * as task from "azure-pipelines-task-lib/task"
import * as tool from "azure-pipelines-tool-lib/tool"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as scanner from "../src/scanner"
import { BoostParams } from "../src/params"

const INITIAL_ENV = process.env

jest.mock("azure-pipelines-task-lib/task")
jest.mock("azure-pipelines-tool-lib/tool")

beforeEach(async () => {
  const tmpdir = await fs.promises.mkdtemp(
    path.resolve(os.tmpdir(), "boostsec-scanner-szure")
  )

  process.env = {
    TMPDIR: tmpdir,
  }
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

describe("downloadCLI", () => {
  test("downloads and executes", async () => {
    const params = new BoostParams(process.env, task)
    params.tmpDir = path.join(params.tmpDir, "noexist")

    const getBoostScript = path.join(params.tmpDir, "get-boost-cli")

    const mockDl = tool.downloadTool as jest.Mock
    mockDl.mockImplementation(() => {
      fs.closeSync(fs.openSync(getBoostScript, "w"))
      return getBoostScript
    })

    const mockTool = task.tool as jest.Mock
    const mockExec = jest.fn(async () => 0)
    mockTool.mockReturnValue({
      exec: mockExec,
    })

    await scanner.downloadCLI(params)

    expect(fs.existsSync(params.tmpDir)).toBe(true)
    expect(fs.existsSync(getBoostScript)).toBe(true)
    expect(mockExec).toHaveBeenCalledWith({
      env: params.asExecEnv(process.env),
    })
  })

  test("raises on failure", async () => {
    const params = new BoostParams(process.env, task)
    const getBoostScript = path.join(params.tmpDir, "get-boost-cli")

    const mockDl = tool.downloadTool as jest.Mock
    mockDl.mockImplementation(() => {
      fs.closeSync(fs.openSync(getBoostScript, "w"))
      return getBoostScript
    })

    const mockTool = task.tool as jest.Mock
    const mockExec = jest.fn(async () => 1)
    mockTool.mockReturnValue({
      exec: mockExec,
    })

    expect(async () => {
      await scanner.downloadCLI(params)
    }).rejects.toThrowError("failed to download boost cli")
  })
})

describe("executeCLI", () => {
  test("executes with default args", async () => {
    const params = new BoostParams(process.env, task)
    params.exePath = path.join(params.tmpDir, "script")

    fs.closeSync(fs.openSync(params.exePath, "w"))

    const mockTool = task.tool as jest.Mock
    const mockArg = jest.fn()
    const mockExec = jest.fn(async () => 0)
    mockTool.mockReturnValue({
      arg: mockArg,
      exec: mockExec,
    })

    await scanner.executeCLI(params)
    expect(mockArg).toHaveBeenCalledWith(["scan", "repo"])
    expect(mockExec).toHaveBeenCalledWith({
      env: params.asExecEnv(process.env),
    })
  })

  test("executes with additional args", async () => {
    const params = new BoostParams(process.env, task)
    params.exePath = path.join(params.tmpDir, "script")
    params.additionalArgs = "arg0 arg1"

    fs.closeSync(fs.openSync(params.exePath, "w"))

    const mockTool = task.tool as jest.Mock
    const mockArg = jest.fn()
    const mockExec = jest.fn(async () => 0)
    mockTool.mockReturnValue({
      arg: mockArg,
      exec: mockExec,
    })

    await scanner.executeCLI(params)
    expect(mockArg).toHaveBeenCalledWith(["scan", "repo"])
    expect(mockArg).toHaveBeenCalledWith(["arg0", "arg1"])
    expect(mockExec).toHaveBeenCalledWith({
      env: params.asExecEnv(process.env),
    })
  })

  test("raises on failure", async () => {
    const params = new BoostParams(process.env, task)
    params.exePath = path.join(params.tmpDir, "script")

    fs.closeSync(fs.openSync(params.exePath, "w"))

    const mockTool = task.tool as jest.Mock
    const mockArg = jest.fn()
    const mockExec = jest.fn(async () => 1)
    mockTool.mockReturnValue({
      arg: mockArg,
      exec: mockExec,
    })

    expect(async () => {
      await scanner.executeCLI(params)
    }).rejects.toThrowError("scan step failed")
  })
})

describe("validateEnv", () => {
  test("pass when conditions are met", async () => {
    const params = new BoostParams(process.env, task)
    process.env.BUILD_REPOSITORY_PROVIDER = "GitHub"

    scanner.validateEnv(process.env, params)
  })

  test("requires github BUILD_REPOSITORY_PROVIDER", async () => {
    const params = new BoostParams(process.env, task)
    process.env.BUILD_REPOSITORY_PROVIDER = "invalid"

    expect(() => {
      scanner.validateEnv(process.env, params)
    }).toThrowError("this extension only supports Github repositories")
  })

  describe("when BUILD_REASON is Manual", () => {
    test("passes when BUILD_SOURCEBRANCHNAME is main branch", async () => {
      const params = new BoostParams(process.env, task)
      process.env.BUILD_REASON = "Manual"
      process.env.BUILD_REPOSITORY_PROVIDER = "Github"
      process.env.BUILD_SOURCEBRANCHNAME = "main"

      scanner.validateEnv(process.env, params)

      process.env.BUILD_SOURCEBRANCHNAME = "invalid"

      expect(() => {
        scanner.validateEnv(process.env, params)
      }).toThrow(scanner.ExecutionError)
    })

    test("passes when SYSTEM_PULLREQUEST_SOURCEBRANCH is main branch", async () => {
      const params = new BoostParams(process.env, task)
      process.env.BUILD_REASON = "Manual"
      process.env.BUILD_REPOSITORY_PROVIDER = "Github"
      process.env.SYSTEM_PULLREQUEST_SOURCEBRANCH = "main"

      scanner.validateEnv(process.env, params)

      process.env.SYSTEM_PULLREQUEST_SOURCEBRANCH = "invalid"

      expect(() => {
        scanner.validateEnv(process.env, params)
      }).toThrow(scanner.ExecutionError)
    })
  })
})
