import * as task from "azure-pipelines-task-lib/task"
import * as tool from "azure-pipelines-tool-lib/tool"
import * as fs from "fs"

import { BoostParams } from "./params"

export enum RepositoryProvider {
  GitHub = "GitHub",
  TfsGit = "TfsGit",
}

export class ExecutionError extends Error {
  exitCode: number

  constructor(message: string, exitCode: number = 0) {
    super(message)
    this.exitCode = exitCode
    this.name = "ExecutionError"
  }
}

export function validateEnv(env: any, params: BoostParams) {
  const execEnv = params.asExecEnv(env)

  if (!(execEnv.BUILD_REPOSITORY_PROVIDER in RepositoryProvider)) {
    throw Error("this extension only supports Github and TfsGit repositories")
  }

  if (execEnv.SKIP_BRANCH_VALIDATION !== undefined) {
    return;
  }

  if (execEnv.BUILD_REASON == "Manual") {
    const sourceBranch =
      execEnv.SYSTEM_PULLREQUEST_SOURCEBRANCH ?? execEnv.BUILD_SOURCEBRANCHNAME
    const mainBranch = execEnv.BOOST_GIT_MAIN_BRANCH ?? "main master"
    const mainBranches = mainBranch.split(" ")

    if (sourceBranch !== undefined) {
      if (!mainBranches.includes(sourceBranch)) {
        throw new ExecutionError(
          `
We have detected a manual build against a non-main branch. In such
cases, azure pipeline does not provide the requisite environment
variables and we are therefore unable to scan. If the scan step is
required for your branch protections, we recommend that you push an
additional commit to this branch.
`,
          0
        )
      }
    }
  }
}

export async function downloadCLI(params: BoostParams) {
  if (!fs.existsSync(params.tmpDir)) {
    fs.mkdirSync(params.tmpDir)
  }

  const getBoostCli = await tool.downloadTool(params.downloadUrl)
  fs.chmodSync(getBoostCli, "755")

  const runner = task.tool(getBoostCli)
  const exitCode = await runner.exec({
    env: params.asExecEnv(process.env),
  })

  if (exitCode > 0) {
    throw new Error("failed to download boost cli")
  }
}

export async function executeCLI(params: BoostParams) {
  if (!fs.existsSync(params.exePath)) {
    throw new Error("unable to find the boost cli")
  }

  const cliRunner = task.tool(params.exePath)
  if (params.triggerId != undefined) {
    cliRunner.arg(["scan", "trigger"])
  } else {
    cliRunner.arg(["scan", "repo"])
  }
  
  if (params.additionalArgs) {
    cliRunner.arg(params.additionalArgs.split(" "))
  }

  const exitCode = await cliRunner.exec({
    env: params.asExecEnv(process.env),
  })

  if (exitCode > 0) {
    throw new Error("scan step failed")
  }
}
