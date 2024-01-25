# Nest Lambda Microservice
> Custom transport implementation for NestJS microservice that facilitates writing applications based on NestJS for AWS Lambda.  

[//]: # ([![Build Status][ci-image]][ci-url])
[//]: # ([![License][license-image]][license-url])
[//]: # ([![Developed at Klarna][klarna-image]][klarna-url])

## About The Project
The **nest-lambda-microservice** library enables you implement AWS Lambda functions using [NestJS](https://docs.nestjs.com/) framework in a microservice architectural style.
This library fills the void, of not being able to run HTTP-style applications on AWS Lambda, with the ability to run RPC-style application using [NestJS microservice](https://docs.nestjs.com/microservices/basics).

How it works in a nutshell:
1. Creates an instance of NestJS application outside the AWS Lambda handler and cache it for as long as the Lambda execution environment is up.
2. Emit the events received by the Lambda instance to the NestJS application via the event broker.
3. The NestJS application uses qualification criteria to identify which handler (controller method) qualifies the request and sends it for processing.
4. Once the handler processed the request and returned a response, the response is mapped or ignored based on the Lambda event source.


## First steps

<details>
 <summary>Installation (for Admins)</summary>
  
  Currently, new repositories can be created only by a Klarna Open Source community lead. Please reach out to us if you need assistance.
  
  1. Create a new repository by clicking ‘Use this template’ button.
  
  2. Make sure your newly created repository is private.
  
  3. Enable Dependabot alerts in your candidate repo settings under Security & analysis. You need to enable ‘Allow GitHub to perform read-only analysis of this repository’ first.
</details>

1. Update `README.md` and `CHANGELOG.md`.

2. Optionally, clone [the default contributing guide](https://github.com/klarna-incubator/.github/blob/main/CONTRIBUTING.md) into `.github/CONTRIBUTING.md`.

3. Do *not* edit `LICENSE`.

## Usage example

A few motivating and useful examples of how your project can be used. Spice this up with code blocks and potentially more screenshots.

_For more examples and usage, please refer to the [Docs](TODO)._

## Development setup

Describe how to install all development dependencies and how to run an automated test-suite of some kind. Potentially do this for multiple platforms.

```sh
make install
npm test
```

## How to contribute

See our guide on [contributing](.github/CONTRIBUTING.md).

## Release History

See our [changelog](CHANGELOG.md).

## License

Copyright © 2023 Klarna Bank AB

For license details, see the [LICENSE](LICENSE) file in the root of this project.


<!-- Markdown link & img dfn's -->
[ci-image]: https://img.shields.io/badge/build-passing-brightgreen?style=flat-square
[ci-url]: https://github.com/klarna-incubator/TODO
[license-image]: https://img.shields.io/badge/license-Apache%202-blue?style=flat-square
[license-url]: http://www.apache.org/licenses/LICENSE-2.0
[klarna-image]: https://img.shields.io/badge/%20-Developed%20at%20Klarna-black?style=flat-square&labelColor=ffb3c7&logo=klarna&logoColor=black
[klarna-url]: https://klarna.github.io
