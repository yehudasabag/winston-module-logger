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
});





