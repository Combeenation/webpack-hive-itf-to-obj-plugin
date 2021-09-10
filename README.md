# Webpack Plugin: Convert Hive interfaces to JS objects

> Compile TypeScript interfaces of Hive Records into JavaScript objects to validate at runtime.

This repository contains a webpack plugin required for creating Combeenation custom JS applications.

The plugin expects files with interface definitions within `./src/typings/*.hive.d.ts`.

These interfaces will be converted to JS objects and saved under `./src/typings-generated-objs/*.hive.d-ti.js`.

## Installation

```
npm install --save-dev @combeenation/webpack-hive-itf-to-obj-plugin
```

## Usage

The plugin should be added to every webpack config for Combeenation custom JS applications.

For detailed documentation why this is required see [according custom JS utils docs](http://docs.combeenation.com/custom-js-utils/pages/Documentation/hive-itf-registration.html)
