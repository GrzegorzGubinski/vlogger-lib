import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { LoggerLevels, } from '../api/LoggerInterface';
import { logger } from './configuration';




import { getTimestamp } from '../timestamps/timestamps';
import { LoggerOptions } from '../api/LoggerInterface';
import { createLoggers, getLogger } from '../implementation/Builder';
import { Logger } from '../implementation/Logger';
import { JsonFormatter } from '../implementation/Formatters';
import { JSonServerWriter } from './JSonServerWriter';
//import { FirestoreWriter } from './FirestoreWriter';





let theArgs: any[] = []
function logErrorToService(...args: any[]) {
    theArgs = [...args];
}


describe('The set of tests for the current configuration - probably to be removed later on', () => {
    const originalConsoleError = console.error;
    const originalConsoleDebug = console.debug;
    const originalLogLevel = logger.level;

    beforeEach(() => {
        console.error = function (...args) {
            logErrorToService(...args);
            //originalConsoleError.apply(console, args);
        };
        console.debug = function (...args) {
            logErrorToService(...args);
            //originalConsoleDebug.apply(console, args);
        };
    })


    afterEach(() => {
        console.error = originalConsoleError;
        console.debug = originalConsoleDebug;
        theArgs = [];
        logger.level = originalLogLevel;
    })

    const message = "The import of default logger works!"

    test('The default logger SHOULD be able to log a DEBUG message after the logLevel change to DEBUG', () => {
        logger.level = LoggerLevels.DEBUG;
        logger.debug(message)

        expect(theArgs[0]).toContain("debug")
        expect(theArgs[0]).toContain(message)
    })

    test('The default logger SHOULD be able to log a FATAL message', () => {
        logger.fatal(message)
        expect(theArgs[0]).toContain("fatal")
        expect(theArgs[0]).toContain(message)
    })

    test('The logger SHOULD NOT log a DEBUG message if the log level is set to ERROR', () => {
        logger.debug(message)
        expect(theArgs.length).toEqual(0)
    })
})


describe.skip('Not e test - just using vitest to run a code [TO BE DELETED]', () => {
    test.skip('running a logger with JSonFormatter and FirestoreWriter [TO BE DELETED]', () => {
        const configuration: LoggerOptions = {
            timestamp: () => getTimestamp(),
            default: {
                defaultLevel: LoggerLevels.TRACE,
                formatterWriterPairs: [
                    {
                        formatter: () => { return new JsonFormatter() },
                        //writer: () => { return new FirestoreWriter() }
                    }
                ],
            },
        };
        createLoggers(configuration);
        const logger = getLogger() as Logger;
        logger.trace("This is a trace message");
        logger.debug("This is a debug message");
    });

});


describe('Not a test - just using vitest to run a code [TO BE DELETED]', () => {
    test.skip('running a logger with JSonFormatter and JSonServerWriter [TO BE DELETED]', () => {
        const configuration: LoggerOptions = {
            timestamp: () => getTimestamp(),
            default: {
                defaultLevel: LoggerLevels.TRACE,
                formatterWriterPairs: [
                    {
                        formatter: () => { return new JsonFormatter() },
                        writer: () => { return new JSonServerWriter() }
                    }
                ],
            },
        };
        createLoggers(configuration);
        const logger = getLogger() as Logger;
        logger.trace("This is a trace message");
        logger.debug("This is a debug message");
    });

});
