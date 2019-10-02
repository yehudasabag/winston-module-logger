const logger = require('../src/logger');
const assert = require('chai').assert;
const sinon = require('sinon');

describe('logger tests', function () {

    context('when initialized with debug level', function () {
        it('isDebug should return true', function () {
            logger.init('debug');
            const log = logger.getLogger('aaa');
            assert.isTrue(log.isDebug(), 'not in debug level');
        });
    });

    context('when not initialized with debug level', function () {
        it('isDebug should return true', function () {
            logger.init('warn');
            const log = logger.getLogger('aaa');
            assert.isFalse(log.isDebug(), 'not in debug level');
        });
    });

    describe('logger log', function () {
        context('when getLogger called without metadata tags', function () {
            it('should put out json with metadata', function () {
                const winston = sinon.spy(logger.init(), 'info');
                const log = logger.getLogger('m');
                log.info('msg');

                assert.isTrue(winston.calledOnce, 'winston info method not called');
                assert.isTrue(winston.calledWith('msg', {moduleName: 'm'}), 'winston params not expected');
            });
        });

        context('when getLogger called with metadata tags', function () {
            it('should put out json with both moduleName and tags', function () {
                const winston = sinon.spy(logger.init(), 'info');
                const log = logger.getLogger('m', {myTag: 'test'});
                log.info('msg');

                assert.isTrue(winston.calledOnce, 'winston info method not called');
                assert.isTrue(winston.calledWith('msg', {moduleName: 'm', myTag: 'test'}),
                    'winston params not expected');
            });
        });

        context('when log is called with extra tags', function () {
            it('should add the tags to the getLogger ones', function () {
                const winston = sinon.spy(logger.init(), 'info');
                const log = logger.getLogger('m', {myTag: 'test'});
                log.info('msg', {secondTag: 'test2'});

                assert.isTrue(winston.calledOnce, 'winston info method not called');
                assert.isTrue(winston.calledWith('msg', {moduleName: 'm', myTag: 'test', secondTag: 'test2'}),
                    'winston params not expected');
            });
        });
    });

    describe('add/clear LogMiddleware', function () {
        context('when no previous middleware exist', function () {
            it('add should add one and call it upon a call to the log function', function () {
                const winston = logger.init();
                const winstonError = sinon.spy(winston, 'error');
                const winstonWarn = sinon.spy(winston, 'warn');
                const log = logger.getLogger('m');
                let errMiddleware = sinon.spy();
                log.addLogMiddleware('error', errMiddleware);

                log.error('msg');
                assert.isTrue(winstonError.calledOnce, 'winston error method not called');
                assert.isTrue(winstonError.calledWith('msg', {moduleName: 'm'}),
                    'winston params not expected');
                assert.isTrue(errMiddleware.calledOnce, 'error middleware function was not called');

                let warnMiddleware = sinon.spy();
                log.addLogMiddleware('warn', warnMiddleware);
                log.warn('warn');
                assert.isTrue(winstonWarn.calledOnce, 'winston warn method not called');
                assert.isTrue(winstonWarn.calledWith('warn', {moduleName: 'm'}),
                    'winston params not expected');
                assert.isTrue(warnMiddleware.calledOnce, 'warn middleware function was not called');

            });

            it('clear should clear existing middleware', function () {
                const winstonError = sinon.spy(logger.init(), 'error');
                const log = logger.getLogger('m');
                let errMiddleware = sinon.spy();
                log.addLogMiddleware('error', errMiddleware);

                log.error('msg');
                assert.isTrue(winstonError.calledOnce, 'winston info method not called');
                assert.isTrue(winstonError.calledWith('msg', {moduleName: 'm'}),
                    'winston params not expected');
                assert.isTrue(errMiddleware.calledOnce, 'the middleware function was not called');
                errMiddleware.resetHistory();

                log.clearLogMiddleware('error');
                log.error('msg2');
                assert.isTrue(winstonError.calledTwice, 'winston info method not called');
                assert.isTrue(winstonError.calledWith('msg2', {moduleName: 'm'}),
                    'winston params not expected');
                assert.isTrue(errMiddleware.notCalled, 'the middleware function was called after clear');
            });

            it('add should throw if the level is not warn or error', function () {
                const log = logger.getLogger('m');
                let addInfoMiddleware = () => {
                    log.addLogMiddleware('info', ()=>{});
                };
                assert.throws(addInfoMiddleware);
            });

        });
        context('when previous middleware exist', function () {
            it('add should throw exception', function () {
                const log = logger.getLogger('m');
                let errMiddleware = sinon.spy();
                log.addLogMiddleware('error', errMiddleware);
                let addAnother = () => {
                    log.addLogMiddleware('error', sinon.spy());
                };
                assert.throws(addAnother);

            });
        })

    });

    describe('add/clear global middleware', function () {
        let winston = null;
        beforeEach(function () {
            winston = logger.init();
        });

        afterEach(function () {
            logger.clearAllGlobalMiddlewares();
        });

        it('add should add global middleware to every module logger created', function () {
            // winston = logger.init();

            let errGlobalMiddleware = sinon.spy();
            logger.addGlobalLogMiddleware('error', errGlobalMiddleware);

            const winstonError = sinon.spy(winston, 'error');
            const log1 = logger.getLogger('m');

            log1.error('msg');
            assert.isTrue(winstonError.calledOnce, 'winston error method not called');
            assert.isTrue(winstonError.calledWith('msg', {moduleName: 'm'}),
                'winston params not expected');
            assert.isTrue(errGlobalMiddleware.calledOnce, 'error middleware function was not called');

            const log2 = logger.getLogger('m2');
            log2.error('msg2');
            assert.isTrue(winstonError.calledTwice, 'winston error method not called');
            assert.isTrue(winstonError.calledWith('msg2', {moduleName: 'm2'}),
                'winston params not expected');
            assert.isTrue(errGlobalMiddleware.calledTwice, 'error middleware function was not called twice');

        });

        it('clear should clear global middleware to all loggers', function () {
            // winston = logger.init();

            let warnGlobalMiddleware = sinon.spy();
            logger.addGlobalLogMiddleware('warn', warnGlobalMiddleware);

            const log1 = logger.getLogger('m');

            log1.warn('msg');
            assert.isTrue(warnGlobalMiddleware.calledOnce, 'error middleware function was not called');

            const log2 = logger.getLogger('m2');
            log2.warn('msg2');
            assert.isTrue(warnGlobalMiddleware.calledTwice, 'error middleware function was not called twice');

            warnGlobalMiddleware.resetHistory();
            logger.clearGlobalLogMiddleware('warn');

            log1.warn('a');
            log2.warn('b');

            assert.isTrue(warnGlobalMiddleware.notCalled, 'global middleware called after clear');
        });

        context('when there is both global and module specific middleware', function () {
            it('both should be called', function () {
                // const winston = logger.init();

                let errGlobalMiddleware = sinon.spy();
                let errModuleMiddleware = sinon.spy();
                logger.addGlobalLogMiddleware('error', errGlobalMiddleware);

                const log = logger.getLogger('m');
                log.addLogMiddleware('error', errModuleMiddleware);

                log.error('msg');
                assert.isTrue(errGlobalMiddleware.calledOnce, 'global middleware was not called once');
                assert.isTrue(errModuleMiddleware.calledOnce, 'module middleware was not called once');

            });

        });

    });

    describe('Logging objects', ()=>{
        it('Stringifies the objects', ()=>{
            const winston = logger.init('debug');
            const log = logger.getLogger('test');

            winston.info = sinon.spy();
            winston.warn = sinon.spy();
            winston.error = sinon.spy();

            log.info('msg',{someKey: {someValue: 'value'}});
            assert.equal(JSON.stringify(winston.info.args[0]), JSON.stringify([
                "msg",
                {
                    "moduleName": "test",
                    "someKey": "{\"someValue\":\"value\"}"
                }
            ]));


            log.warn('msg',{someKey: {someValue: 'value'}});
            assert.equal(JSON.stringify(winston.warn.args[0]), JSON.stringify([
                "msg",
                {
                    "moduleName": "test",
                    "someKey": "{\"someValue\":\"value\"}"
                }
            ]));

            log.error('msg',null,{someKey: {someValue: 'value'}});
            assert.equal(JSON.stringify(winston.error.args[0]), JSON.stringify([
                "msg",
                {
                    "moduleName": "test",
                    "someKey": "{\"someValue\":\"value\"}"
                }
            ]));
        })
    })
});





