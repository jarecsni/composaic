# Composaic

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/username/repo/blob/main/LICENSE)
[![Build Status](https://travis-ci.com/username/repo.svg?branch=main)](https://travis-ci.com/username/repo)
[![Coverage Status](https://coveralls.io/repos/github/username/repo/badge.svg?branch=main)](https://coveralls.io/github/username/repo?branch=main)

A plugins based web application framework.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [Features](#features)
-   [Contributing](#contributing)
-   [License](#license)

## Installation

`npm i --save composaic@latest`

## Usage

### Application scenario

### Plugin project scenario

### Developing Composaic itself

If you want to use composaic locally, you will need to do the following

Composaic:

1. check out the project locally
2. `npm i`
3. `npm link`
4. `cd scripts`
5. `./symlink.sh`

Project using composaic:

1. `npm link composaic`

This will set up composaic for being consumed from both application and plugin projects.

Whenever you change somthing in composaic project you will need to rebuild it:
`npm run build`

## Features

Highlight the key features of your library/framework.

## Contributing

Guidelines for contributing to your project.

## License

Specify the license under which your library/framework is distributed.
