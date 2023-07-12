import * as task from "azure-pipelines-task-lib/task"
import * as scanner from "./scanner"
import { BoostParams } from "./params"

export async function run() {
  try {
    const params = new BoostParams(process.env, task)
    scanner.validateEnv(process.env, params)

    if (params.workingDirectory) {
      process.chdir(params.workingDirectory)
    }

    await scanner.downloadCLI(params)
    await scanner.executeCLI(params)
  } catch (err: unknown) {
    if (err instanceof scanner.ExecutionError) {
      console.error(err.message)
      task.setResult(task.TaskResult.Skipped, err.message)
    } else {
      const error = err as Error
      console.error(error.message)
      task.setResult(task.TaskResult.Failed, error.message)
    }
  }
}

if (process.env.NODE_ENV != "test") {
  run()
}
