import * as os from "os"
import * as path from "path"

export const BOOST_CLI_URL = "https://assets.build.boostsecurity.io"
export const BOOST_CLI_VERSION = "1"
export const BOOST_DOWNLOAD_URI = "/boost-cli/get-boost-cli"

interface TaskLib {
  getInput(name: string, required?: boolean | undefined): string | undefined
}

type BoostParamEnvMap = { [Property in keyof BoostParamsVars]: string }

const BoostParamEnvMap: BoostParamEnvMap = {
  additionalArgs: "BOOST_CLI_ARGUMENTS",
  apiEnabled: "BOOST_API_ENABLED",
  apiEndpoint: "BOOST_API_ENDPOINT",
  apiToken: "BOOST_API_TOKEN",
  cliUrl: "BOOST_CLI_URL",
  cliVersion: "BOOST_CLI_VERSION",
  downloadUrl: "BOOST_DOWNLOAD_URL",
  exePath: "BOOST_EXE",
  ignoreFailure: "BOOST_IGNORE_FAILURE",
  logColors: "BOOST_LOG_COLORS",
  logLevel: "BOOST_LOG_LEVEL",
  mainBranch: "BOOST_GIT_MAIN_BRANCH",
  preScanCmd: "BOOST_PRE_SCAN",
  registryModule: "BOOST_SCANNER_REGISTRY_MODULE",
  registryPath: "BOOST_SCANNER_REGISTRY",
  scanLabel: "BOOST_SCAN_LABEL",
  scannerId: "BOOST_SCANNER_ID",
  scanPath: "BOOST_SCAN_PATH",
  scanTimeout: "BOOST_DIFF_SCAN_TIMEOUT",
  tmpDir: "BOOST_TMP_DIR",
  workingDirectory: "BOOST_WORKING_DIRECTORY",
}

class BoostParamsVars {
  additionalArgs: string | undefined = ""
  apiEnabled: string | undefined = ""
  apiEndpoint: string | undefined = ""
  apiToken: string | undefined = ""
  cliUrl: string = BOOST_CLI_URL
  cliVersion: string = BOOST_CLI_VERSION
  downloadUrl: string = ""
  exePath: string = ""
  ignoreFailure: string | undefined = ""
  logColors: string = "true"
  logLevel: string | undefined = ""
  mainBranch: string | undefined = ""
  preScanCmd: string | undefined = ""
  registryModule: string | undefined = ""
  registryPath: string | undefined = ""
  scanLabel: string | undefined = ""
  scannerId: string | undefined = ""
  scanPath: string | undefined = ""
  scanTimeout: string | undefined = ""
  tmpDir: string = ""
  workingDirectory: string | undefined = ""
}

export class BoostParams extends BoostParamsVars {
  constructor(env: any, tl: TaskLib) {
    super()
    this.loadInputs(tl)
    this.loadEnv(env)
    this.loadDefaults(env)
  }

  public asBoostEnv(): Record<string, string> {
    const data: Record<string, string> = {}

    let key: keyof BoostParamEnvMap
    for (key in BoostParamEnvMap) {
      const input = BoostParamEnvMap[key]
      const value = this[key]
      if (value !== undefined) {
        data[input] = value
      }
    }

    return data
  }

  public asExecEnv(env: any): Record<string, string> {
    return {
      ...env,
      ...this.asBoostEnv(),
    }
  }

  public loadInputs(tl: TaskLib) {
    this.additionalArgs = this.loadInput(tl, "additionalArgs")
    this.apiEnabled = this.loadInput(tl, "apiEnabled")
    this.apiEndpoint = this.loadInput(tl, "apiEndpoint")
    this.apiToken = this.loadInput(tl, "apiToken")
    this.cliUrl = this.loadInput(tl, "cliUrl") ?? this.cliUrl
    this.cliVersion = this.loadInput(tl, "cliVersion") ?? this.cliVersion
    this.ignoreFailure = this.loadInput(tl, "ignoreFailure")
    this.logColors = this.loadInput(tl, "logColors") ?? this.logColors
    this.logLevel = this.loadInput(tl, "logLevel")
    this.mainBranch = this.loadInput(tl, "mainBranch")
    this.preScanCmd = this.loadInput(tl, "preScanCmd")
    this.registryModule = this.loadInput(tl, "registryModule")
    this.registryPath = this.loadInput(tl, "registryPath")
    this.scanLabel = this.loadInput(tl, "scanLabel")
    this.scannerId = this.loadInput(tl, "scannerId")
    this.scanPath = this.loadInput(tl, "scanPath")
    this.scanTimeout = this.loadInput(tl, "scanTimeout")
    this.workingDirectory = this.loadInput(tl, "workingDirectory")
  }

  public loadInput(tl: TaskLib, name: string): string | undefined {
    let value = tl.getInput(name);
    return value !== "" ? value : undefined;
  }

  public loadEnv(env: any) {
    let key: keyof BoostParamEnvMap
    for (key in BoostParamEnvMap) {
      const env_name = BoostParamEnvMap[key]
      this.setDefault(key, env[env_name])
    }
    this.setDefault("tmpDir", env["TMPDIR"])
  }

  public loadDefaults(env: any) {
    this.setDefault("tmpDir", os.tmpdir())
    this.setDefault("exePath", path.join(this.tmpDir, "boost-cli", "latest"))
    this.setDefault("downloadUrl", this.cliUrl + BOOST_DOWNLOAD_URI)
  }

  public setDefault(
    name: keyof BoostParams,
    value: any | undefined,
    fallback: any | undefined = undefined
  ) {
    if (this[name] == "" || this[name] === undefined) {
      if (value != "" && value !== undefined) {
        this[name] = value
      } else if (fallback !== undefined) {
        this[name] = fallback
      }
    }
  }
}
