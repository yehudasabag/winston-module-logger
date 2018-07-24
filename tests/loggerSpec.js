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
                const winston = logger.init();
                const winstonError = sinon.spy(winston, 'error');
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
});





