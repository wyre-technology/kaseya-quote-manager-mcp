# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of the Kaseya Quote Manager (Datto Commerce) MCP server.
- Read-only access to all 20 Quote Manager resources via 39 entity tools, grouped into
  5 navigable domains: `sales`, `procurement`, `catalog`, `crm`, and `org`.
- `kqm_navigate` and `kqm_status` discovery tools.
- Pre-baked prompts: `quote-pipeline-review`, `quote-detail`, `purchasing-summary`.
- stdio and HTTP Streamable transports; gateway mode with `x-kaseya-quote-manager-api-key`
  header injection.
- Built on `@wyre-technology/node-kaseya-quote-manager`.
