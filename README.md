# Boost Security Scanner Extension

Executes the Boost Security Scanner cli tool to scan repositories for
vulnerabilities and uploads results to the Boost Security API.

## Example

Add the following to your `azure-pipelines.yml`:

```yml
variables:
  - group: boost-prod
  - name: api_token
    value: $[variables.BOOST_API_TOKEN]

steps:
  - checkout: self
    clean: "true"
    fetchDepth: "1"
    persistCredentials: "true"
  - task: BoostSecurityScan@1
    inputs:
      apiToken: $(api_token)
      registryModule: boostsecurityio/native-scanner
```

## Inputs

### `additionalArgs` (Optional, str)

Additional CLI args to pass to the `boost` cli.

### `apiEnabled` (Optional, boolean string, default true)

Enable or disable boost uploading results to the boost api

### `apiEndpoint` (Optional, string)

Overrides the API endpoint url

### `apiToken` (Required, string)

The Boost Security API token secret.

**NOTE**: We recommend you not put the API token directly in your pipeline.yml
file. Instead, it should be exposed via a **secret**.

### `cliVersion` (Optional, string)

Overrides the cli version to download when performing scans. If undefined,
this will default to pulling "1".

### `ignoreFailure` (Optional, boolean string, default false)

Ignore any non-zero exit status and always return a success.

### `logLevel` (Optional, string, default INFO)

Change the CLI logging level.

### `mainBranch` (Optional, string)

The name of the main branch that PRs would merge into. This is automatically
detected by querying the git server.

### `preScanCmd` (Optional, string)

Optional command to execute prior to scanning. This may be used to generate
additional files that are not tracked in git.

### `registryModule` (Required, string)

The relative path towards a module within the [Scanner Registry](https://github.com/boostsecurityio/scanner-registry).
To streamline the configuration, both the _scanners_ prefix and _module.yaml_ suffix may be omitted.

### `scannerId` (Optional, string)

Optional identifier to uniquely identify the scanner

### `scanLabel` (Optional, string)

Optional identifier to identify a monorepo component

### `scanPath` (Optional, string)

Optional path within the git repository to execute scanners in.

When this parameter is specified, you must also provide a `scan_label` to identify the component.

### `scanTimeout` (Optional, number)

The optional timeout after which the Github check will be marked as failed. This defaults to 120 seconds.

### `workingDirectory` (Optional, string)

Optional path to change into before executing any commands.

