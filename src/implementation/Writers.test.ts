import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { LogContent, LoggerLevels } from '@/api/LoggerInterface'
import { ConsoleWriter } from './Writers';


describe('The ConsoleWriter tests', () => {

    let theArgs: any[] = []
    let logLevel: LoggerLevels = LoggerLevels.DEBUG;
    function logErrorToService(level: LoggerLevels, ...args: any[]) {
        theArgs = [...args];
        logLevel = level;
    }
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info
    const originalConsoleDebug = console.debug;
    const originalConsoleTrace = console.trace;

    beforeEach(() => {
        console.error = function (...args) {
            logErrorToService(LoggerLevels.ERROR, ...args,);
            //originalConsoleError.apply(console, args);
        };
        console.debug = function (...args) {
            logErrorToService(LoggerLevels.DEBUG, ...args);
        };
        console.warn = function (...args) {
            logErrorToService(LoggerLevels.WARN, ...args);
        };
        console.info = function (...args) {
            logErrorToService(LoggerLevels.INFO, ...args);
        };
        console.trace = function (...args) {
            logErrorToService(LoggerLevels.TRACE, ...args);
        };
    })

    afterEach(() => {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        console.info = originalConsoleInfo;
        console.debug = originalConsoleDebug;
        console.trace = originalConsoleTrace;
        theArgs = [];
        logLevel = LoggerLevels.DEBUG;
    })

    test('The console writer should write a formatted message with console.error method for LoggerLevels.ERROR', () => {
        const writer = new ConsoleWriter();
        const content: LogContent = {
            level: LoggerLevels.ERROR,
            timestamp: "2021-08-31T12:00:00.000Z",
            message: "Writer Test",
        }
        writer.write("Writer Test", content)
        expect(theArgs[0]).toEqual("Writer Test")
        expect(logLevel).toEqual(LoggerLevels.ERROR)
    })

    test('The console writer should write a formatted message with console.error method for LoggerLevels.FATAL', () => {
        const writer = new ConsoleWriter();
        const content: LogContent = {
            level: LoggerLevels.FATAL,
            timestamp: "2021-08-31T12:00:00.000Z",
            message: "Writer Test",
        }
        writer.write("Writer Test", content)
        expect(theArgs[0]).toEqual("Writer Test")
        expect(logLevel).toEqual(LoggerLevels.ERROR)
    })
})
