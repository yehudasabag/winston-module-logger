# winston-module-logger
A simple wrapper around winston logger that lets you logging by module and also using metadata for tags.
This logger is mainly used (by me) for logging to Console transport. The log format is always JSON since the logger is used mainly in microservices architecture where a collector is collecting the logs to some central log management (e.g ELK, Stackdriver etc.).

# Installation
npm install --save winston-module-logger

# Usage
```js
const moduleLogger = require('winston-module-logger');

// init the log logger and pass the log level (info by default).
// Should happen once in the application lifecycle.
moduleLogger.init('debug');
```

## Simple string logging
```js
// in some other module or scope you wish to have a specific logger, you can pass the module name
const log = require('winston-module-logger').getLogger('DBAccess');
log.debug('my message');
```
output on stdout:
``` console
{"moduleName":"DBAccess","level":"debug","message":"my message"}
```

## Adding metadata tags
if you wish that all the messages will include some metadata in the logger instance you can 'getLogger' with metadata
```js
const { getLogger } = require('winston-module-logger');
const log = getLogger('MyModule', {apiKey: apiKey});
log.info('REST api called for specific api key');
```
output on stdout:
``` console
{"moduleName":"MyModule","level":"info","message":"REST api called for specific api key", "apiKey":"12345"}
```
you can also add metadata tags on specific log calls:
```js
log.warn('REST api called with wrong api key', { wrongApiKey: wrongApiKey });
```
output on stdout:
``` console
{"moduleName":"MyModule","level":"info","message":"REST api called for specific api key","apiKey":"12345","wrongApiKey":"555"}
```
## Error logging
You can pass the exception object as the second parameter and it will log the stack trace
```js
log.error('aaa', new Error('my error'), {apiKey: '12345'});
```
```console
{"moduleName":"MyModule","stack":"Error: my error\n    at Object.<anonymous> (/Users/yehuda/git/rest-api/logger.js:8:18)\n    at Module._compile (module.js:660:30)\n    at Object.Module._extensions..js (module.js:671:10)\n    at Module.load (module.js:573:32)\n    at tryModuleLoad (module.js:513:12)\n    at Function.Module._load (module.js:505:3)\n    at Module.require (module.js:604:17)\n    at require (internal/module.js:11:18)\n    at Object.<anonymous> (/Users/yehuda/git/rest-api/app.js:6:13)\n    at Module._compile (module.js:657:14)","apiKey":"12345","level":"error","message":"aaa"}
```
## Adding error and warning hooks
You can add a dummy 'middleware' to the error and warn logs. This is mainly for the purpose of adding some functionality 
on error and warnings such as incrementing a prometheus gauge or something like this.
For performance reasons you can add only one middleware to the error and warn log functions.
The logger assumes there is no dependency in the middleware function and does not 'await' for it.  

To add a middleware:
```js
log.addLogMiddleware('error', () => { /*... do something */ })
 ```
 To remove a middleware:
 ```js
 log.clearLogMiddleware('error');
 ```
## Contributions
You are welcome to open PRs
