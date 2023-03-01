# Boost Security Scanner Azure

Executes the Boost Security Scanner cli tool to scan repositories for
vulnerabilities and uploads results to the Boost Security API.

## Example

Add the following to your `azure-pipelines.yml`:

```yml
trigger:
  - main

pr:
  - main

variables:
  - group: boost-prod
  - name: api_token
    value: $[variables.BOOST_API_TOKEN]

steps:
  - checkout: self
    clean: true
    fetchDepth: 1
    persistCredentials: true
  - template: templates/scanner.yaml
    parameters:
      api_token: $(api_token)
      registry_module: boostsecurityio/native-scanner
```

## Configuration

### `additional_args` (Optional, str)

Additional CLI args to pass to the `boost` cli.

### `api_enabled` (Optional, boolean string, default true)

Enable or disable boost uploading results to the boost api

### `api_endpoint` (Optional, string)

Overrides the API endpoint url

### `api_token` (Required, string)

The Boost Security API token secret.

**NOTE**: We recommend you not put the API token directly in your pipeline yml
file. Instead, it should be exposed via a **secret**.

### `cli_version` (Optional, string)

Overrides the cli version to download when performing scans. If undefined,
this will default to pulling "1".

### `ignore_failure` (Optional, boolean string, default false)

Ignore any non-zero exit status and always return a success.

### `log_level` (Optional, string, default INFO)

Change the CLI logging level.

### `main_branch` (Optional, string)

The name of the main branch that PRs would merge into. This is automatically
detected by querying the git server.

### `pre_scan_cmd` (Optional, string)

Optional command to execute prior to scanning. This may be used to generate
additional files that are not tracked in git.

### `registry_module` (Required, string)

The relative path towards a module within the [Scanner Registry](https://github.com/boostsecurityio/scanner-registry).
To streamline the configuration, both the _scanners_ prefix and _module.yaml_ suffix may be omitted.

### `scanner_id` (Optional, string)

Optional identifier to uniquely identify the scanner

### `scan_label` (Optional, string)

Optional identifier to identify a monorepo component

### `scan_path` (Optional, string)

Optional path within the git repository to execute scanners in.

When this parameter is specified, you must also provide a `scan_label` to identify the component.

### `scan_timeout` (Optional, number)

The optional timeout after which the Github check will be marked as failed. This defaults to 120 seconds.

