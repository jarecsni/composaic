# Changelog

## 0.9.0 (12 Oct 2024)
o Discarding the idea of using SystemJS

## 0.8.1 (03 Oct 2024)
o Introduced loader property in PluginDescriptor to allow loading plugins from
  various sources
o Refactor has been done in previous versions which were partly undone, this was all
  due to remote federation issues around using composaic as a node module

## 0.4.26 (10 Sep 2024)

Making SignalService use the new GlobalScopeService

## 0.4.25 (10 Sep 2024)

Added GlobalScopeService (vite no longer supports singletons, so we'll need to introduce Window scoped variables for this)

## 0.1.4 (28 May 2024) - Tag test 3

Uhm ... the version in package.json is not automatically bumped :D

## 0.1.3 (28 May 2024) - Tag test 2

Installed the NPM_TOKEN as GitHub repository secret

## 0.1.3 (28 May 2024) - Tag test 2

Installed the NPM_TOKEN as GitHub repository secret

## 0.1.2 (28 May 2024) - Tag test

Trying github pipeline for autopublish based on tags (failed)

## 0.1.1 (28 May 2024) - First Release

Initial version with test function.
