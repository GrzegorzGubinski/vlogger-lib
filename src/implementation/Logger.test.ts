import { describe, test, expect, beforeEach } from 'vitest'

import {
    LoggerLevels,
    LoggerLevelsToNameMap,
    LogFormatterInterface,
    LogWriterInterface,
    LoggerOptions,
    LogContent
} from '@/api/LoggerInterface'

import { createLoggers, deleteLoggers, getLogger } from './Builder';
import { Logger } from './Logger';


class TestWriter implements LogWriterInterface {
    public _messages: string[] = [];
    write(formattedMessage: string, content: LogContent): void {
        this._messages.push(formattedMessage);
    }
}


class TestFormatter implements LogFormatterInterface {
    formatLog(content: LogContent): string {
        return `'${LoggerLevelsToNameMap[content.level].toUpperCase()}' ${content.message}`;
    }
}


const defaultConfiguration: LoggerOptions = {
    default: {
        defaultLevel: LoggerLevels.WARN,
        formatterWriterPairs: []
    }
};

describe('cut: Logger', () => {
    beforeEach(() => {
        deleteLoggers();
    });

    describe('Logger - log levels tests', () => {
        test('Logger shall use a passed configuration with default LogLevels', () => {
            createLoggers(defaultConfiguration);
            const logger = getLogger() as Logger
            expect(logger.level).toBe(LoggerLevels.WARN)
        })

        test('Logger shall change a passed LogLevels in a config to the new one', () => {

            createLoggers(defaultConfiguration)
            const logger = getLogger() as Logger
            logger.level = LoggerLevels.FATAL
            expect(logger.level).toBe(LoggerLevels.FATAL)
        })

        test('Should output the message formatted in a given way', () => {
            deleteLoggers();
            const configuration: LoggerOptions = {
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [
                        {
                            formatter: () => { return new TestFormatter() },
                            writer: () => { return new TestWriter(); },
                        }
                    ]
                }
            };

            createLoggers(configuration);
            const logger = getLogger() as Logger
            logger.log(LoggerLevels.DEBUG, "message!")

            expect((logger.getWriter() as TestWriter)._messages[0]).toEqual("'DEBUG' message!")
        })
    })

    describe('Logger - Logger should ignore calls with a level lower than the current one', () => {

        class TestWriter implements LogWriterInterface {
            constructor() {
                this._messageChecks = {
                    trace: false,
                    debug: false,
                    info: false,
                    warn: false,
                    error: false,
                    fatal: false
                }
            }
            public _messageChecks: {
                trace: boolean,
                debug: boolean,
                info: boolean,
                warn: boolean,
                error: boolean,
                fatal: boolean
            };
            write(formattedMessage: string, content: LogContent): void {
                switch (content.level) {
                    case LoggerLevels.TRACE:
                        this._messageChecks.trace = true;
                        break;
                    case LoggerLevels.DEBUG:
                        this._messageChecks.debug = true;
                        break;
                    case LoggerLevels.INFO:
                        this._messageChecks.info = true;
                        break;
                    case LoggerLevels.WARN:
                        this._messageChecks.warn = true;
                        break;
                    case LoggerLevels.ERROR:
                        this._messageChecks.error = true;
                        break;
                    case LoggerLevels.FATAL:
                        this._messageChecks.fatal = true;
                        break;
                    default:
                        break;
                }
            }
        }

        const configuration: LoggerOptions = {
            default: {
                defaultLevel: LoggerLevels.DEBUG,
                formatterWriterPairs: [
                    {
                        //formatter: () => { return new TestFormatter() },
                        writer: () => { return new TestWriter(); },
                    }
                ]
            }
        };

        test('Logger should NOT ignore ANY calls if the current log level is TRACE', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;

            logger.level = LoggerLevels.TRACE;

            logger.trace("message!");
            logger.debug("message!");
            logger.fatal("message!");

            expect((logger.getWriter() as TestWriter)._messageChecks.trace).toBeTruthy();
            expect((logger.getWriter() as TestWriter)._messageChecks.debug).toBeTruthy();
            expect((logger.getWriter() as TestWriter)._messageChecks.fatal).toBeTruthy();
        });

        test('Logger should ignore calls with a level TRACE if the current log level is DEBUG', () => {

            createLoggers(configuration);
            const logger = getLogger() as Logger;

            //console.log("=====> 2", (logger.getWriter() as TestWriter)._messageChecks);

            logger.level = LoggerLevels.DEBUG;

            //console.log('========== 1> test');
            logger.trace("message!");
            //console.log('========== 2> test');



            expect((logger.getWriter() as TestWriter)._messageChecks.trace).toBeFalsy();

        });

        test('Logger should NOT ignore calls with a levels DEBUG to FATAL if the current log level is DEBUG', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.level = LoggerLevels.DEBUG;

            logger.debug("message!");
            logger.fatal("message!");

            expect((logger.getWriter() as TestWriter)._messageChecks.debug).toBeTruthy();
            expect((logger.getWriter() as TestWriter)._messageChecks.fatal).toBeTruthy();
        });

        test('Logger should ignore calls with a level TRACE, DEBUG if the current log level is INFO', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.level = LoggerLevels.INFO;

            logger.trace("message!");
            logger.debug("message!");


            expect((logger.getWriter() as TestWriter)._messageChecks.trace).toBeFalsy();
            expect((logger.getWriter() as TestWriter)._messageChecks.debug).toBeFalsy()
        });

        test('Logger should NOT ignore calls with a levels INFO, WARN, ERROR and FATAL if the current log level is INFO', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.level = LoggerLevels.INFO;

            logger.warn("message!");
            logger.error("message!");
            logger.fatal("message!");

            expect((logger.getWriter() as TestWriter)._messageChecks.warn).toBeTruthy();
            expect((logger.getWriter() as TestWriter)._messageChecks.error).toBeTruthy();
            expect((logger.getWriter() as TestWriter)._messageChecks.fatal).toBeTruthy();
        });

        test('Logger should ignore calls with a level TRACE, DEBUG, INFO if the current log level is WARN', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.level = LoggerLevels.WARN;

            logger.trace("message!");
            logger.debug("message!");
            logger.info("message!");

            expect((logger.getWriter() as TestWriter)._messageChecks.trace).toBeFalsy();
            expect((logger.getWriter() as TestWriter)._messageChecks.debug).toBeFalsy();
            expect((logger.getWriter() as TestWriter)._messageChecks.info).toBeFalsy();
        });

        test('Logger should NOT ignore calls with a levels WARN, ERROR and FATAL if the current log level is WARN', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.level = LoggerLevels.WARN;

            logger.warn("message!");
            logger.error("message!");
            logger.fatal("message!");

            expect((logger.getWriter() as TestWriter)._messageChecks.warn).toBeTruthy();
            expect((logger.getWriter() as TestWriter)._messageChecks.error).toBeTruthy();
            expect((logger.getWriter() as TestWriter)._messageChecks.fatal).toBeTruthy();
        });

        test('Logger should ignore calls with a level TRACE, DEBUG, INFO, WARN if the current log level is ERROR', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.level = LoggerLevels.ERROR;

            logger.trace("message!");
            logger.debug("message!");
            logger.info("message!");
            logger.warn("message!");

            expect((logger.getWriter() as TestWriter)._messageChecks.trace).toBeFalsy();
            expect((logger.getWriter() as TestWriter)._messageChecks.debug).toBeFalsy();
            expect((logger.getWriter() as TestWriter)._messageChecks.info).toBeFalsy();
            expect((logger.getWriter() as TestWriter)._messageChecks.warn).toBeFalsy();
        });

        test('Logger should NOT ignore calls with a levels ERROR and FATAL if the current log level is ERROR', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.level = LoggerLevels.ERROR;

            logger.error("message!");
            logger.fatal("message!");

            expect((logger.getWriter() as TestWriter)._messageChecks.error).toBeTruthy();
            expect((logger.getWriter() as TestWriter)._messageChecks.fatal).toBeTruthy();
        });

        test('Logger should ignore calls with all levels beside FATAL if the current log level is FATAL', () => {
            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.level = LoggerLevels.FATAL;

            logger.error("message!");
            logger.fatal("message!");

            expect((logger.getWriter() as TestWriter)._messageChecks.error).toBeFalsy();
            expect((logger.getWriter() as TestWriter)._messageChecks.fatal).toBeTruthy();
        });
    });
});
