# JSentinel

#### Advanced JavaScript Security Analysis

There is a plethora of JavaScript libraries for use on the Web and in Node.JS apps out there. This greatly simplifies development, but we need to stay up-to-date on security fixes. "Using Components with Known Vulnerabilities" is now a part of the [OWASP Top 10](https://www.owasp.org/index.php/Top_10_2013-A9-Using_Components_with_Known_Vulnerabilities) list of security risks and insecure libraries can pose a huge risk to your Web app. The goal of JSentinel is to help you detect the use of JS-library versions with known vulnerabilities using advanced analysis techniques.

## Support the Project

If you find JSentinel useful, please consider supporting our research and development efforts:

[![PayPal Donation](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/research.unit734@proton.me)

Your support helps us maintain and improve JSentinel's security analysis capabilities.

## Features

JSentinel can be used in many ways:

1. [As command line scanner](https://github.com/734ai/jsentinel/tree/master/node)
2. [As a grunt plugin](https://github.com/734ai/grunt-jsentinel)
3. [As a gulp task](#user-content-gulp-task)
4. [As a Chrome extension](https://github.com/734ai/jsentinel/tree/master/chrome)
5. [As a Firefox extension](https://github.com/734ai/jsentinel/tree/master/firefox)
6. [As a security tool plugin](#integrations)

## Command line scanner

Scan a web app or node app for use of vulnerable JavaScript libraries and/or Node.JS modules. If you haven't already, you need to [install node/npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) first. In the source code folder of the application folder run:

```
$ npm install -g jsentinel
$ jsentinel
```

## SBOM generation

JSentinel can generate SBOMs in the CycloneDX-format:

```
$ jsentinel --outputformat cyclonedx
```

By default JSentinel will exit with code 13 if it finds vulnerabilities. This can be overridden with `--exitwith 0`.

## Grunt plugin

A [Grunt task for running JSentinel](https://github.com/734ai/grunt-jsentinel) as part of your application's build routine, or some other automated workflow.

## Gulp task

An example of a Gulp task which can be used in your gulpfile to watch and scan your project files automatically. You can modify the watch patterns and (optional) JSentinel options as you like.

```javascript
const c = require("ansi-colors");

var gulp = require("gulp");
var beeper = require("beeper");
var log = require("fancy-log");
var spawn = require("child_process").spawn;

gulp.task("jsentinel:watch", ["jsentinel"], function (done) {
  // Watch all javascript files and package.json
  gulp.watch(["js/**/*.js", "package.json"], ["jsentinel"]);
});

gulp.task("jsentinel", function () {
  // Spawn JSentinel as a child process
  // You can optionally add option parameters to the second argument (array)
  var child = spawn("jsentinel", [], { cwd: process.cwd() });

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", function (data) {
    log(data);
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", function (data) {
    log(c.red(data));
    beeper();
  });
});
```

## Chrome and firefox extensions

Scans visited sites for references to insecure libraries, and puts warnings in the developer console. An icon on the address bar displays will also indicate if vulnerable libraries were loaded.

## Burp Extension and OWASP ZAP Add-on

[@h3xstream](https://github.com/h3xstream) has adapted JSentinel as a [plugin](https://github.com/h3xstream/burp-jsentinel) for the penetration testing tools [Burp](https://portswigger.net/burp/) and [OWASP ZAP](https://www.zaproxy.org).

The [OWASP ZAP](https://www.zaproxy.org) team officially supports a JSentinel add-on which is available via the ZAP Marketplace and is included by default in the ZAP weekly releases: https://www.zaproxy.org/docs/desktop/addons/jsentinel/
