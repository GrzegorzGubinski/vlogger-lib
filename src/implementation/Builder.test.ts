import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
    LoggerLevels,
    LogFormatterInterface,
    LoggerConfig,
    LogWriterInterface,
    ExtendedLogPayloadInterface,
    LoggerOptions,
    DirectPayload,
    LogContent,
} from '@/api/LoggerInterface'

import { DefaultFormatter } from './Formatters';
import { ConsoleWriter } from './Writers';
import { createLoggers, getLogger, setLogLevel, setLogLevelForLogger, deleteLoggers } from './Builder';
import { Logger } from './Logger';


let theArgs: any[] = []
function logErrorToService(...args: any[]) {
    theArgs = [...args];
}
const originalConsoleError = console.error;
const originalConsoleDebug = console.debug;



class TestFormatter implements LogFormatterInterface {
    public _level!: LoggerLevels;
    public _message!: string;
    public _timestamp!: string;
    public _extendedData!: ExtendedLogPayloadInterface | undefined;
    public _data!: DirectPayload | undefined;
    public _id: string;

    constructor(id?: string) {
        this._id = id || "";
    }

    formatLog(content: LogContent): string {
        this._level = content.level;
        this._message = content.message;
        this._timestamp = content.timestamp!;
        this._extendedData = content.extendedData;
        this._data = content.data;
        return this._message;
    }
}

class TestWriter implements LogWriterInterface {
    public _level!: LoggerLevels;
    public _formattedMessage!: string;
    public _originalMessage!: string;
    public _data!: ExtendedLogPayloadInterface | undefined;
    public _id: string;

    constructor(id?: string) {
        this._id = id || "";
    }

    write(formattedMessage: string, content: LogContent): void {
        this._data = content.extendedData;
        this._level = content.level;
        this._formattedMessage = formattedMessage;
        this._originalMessage = content.message;
    }

}

describe("cut: LoggerBuilder - Tests for setuping loggers with the correct configuration", () => {


    beforeEach(() => {
        console.error = function (...args) {
            logErrorToService(...args);
            //originalConsoleError.apply(console, args);
        };
        console.debug = function (...args) {
            logErrorToService(...args);
            //originalConsoleError.apply(console, args);
        };
        deleteLoggers();
    });


    afterEach(() => {
        console.error = originalConsoleError;
        console.debug = originalConsoleDebug;
        theArgs = [];
    });


    describe("Configuration tests for very basic configuration properties.", () => {

        test("Should provide a correct timestamp even if the itmestamp factory function is not provided", () => {
            const configuration: LoggerOptions = {
                timestamp: undefined,
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [
                        {
                            name: "default",
                            formatter: () => { return new DefaultFormatter() },
                            writer: () => { return new ConsoleWriter(); },
                        }
                    ]

                }
            };

            createLoggers(configuration);
            const logger = getLogger();
            logger.fatal("");

            // Check if the log message contains a timestamp in the format of "YYYY-MM-DDTHH:mm:ss.sssZ"
            const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
            expect(theArgs[0]).toMatch(timestampRegex);
        });


        test("Should use a provided function as a timestamp factory", () => {
            const timestampStr = "2021-10-12T00:00:00.000Z";
            const configuration: LoggerOptions = {
                timestamp: () => timestampStr,
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [
                        {
                            formatter: () => { return new DefaultFormatter() },
                            writer: () => { return new ConsoleWriter(); },
                        }
                    ]
                }
            };

            createLoggers(configuration);
            const logger = getLogger();
            logger.fatal("");

            expect(theArgs[0]).toContain(timestampStr);
        });

        test("Should setup the correct, default writer and formatter if the respective configuration is empty", () => {
            const message = "The defaults";
            const configuration: LoggerOptions = {
                default: {
                    defaultLevel: undefined,
                    formatterWriterPairs: []
                }
            };

            createLoggers(configuration);
            const logger = getLogger();
            logger.fatal(message);

            const outputedMessage = theArgs[0];
            const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

            expect(outputedMessage).toContain(message);
            expect(outputedMessage).toMatch(timestampRegex);
            expect(outputedMessage).toContain("fatal");
        });

        test("Should setup the correct, default logging level if the configuration is empty", () => {
            const configuration: LoggerOptions = {
                default: {
                    defaultLevel: undefined,
                    formatterWriterPairs: [
                        {
                            name: "A",
                            formatter: () => { return new DefaultFormatter() },
                            writer: () => { return new ConsoleWriter(); },
                        }
                    ]
                }
            };

            createLoggers(configuration);
            const logger = getLogger();
            expect(logger.level).toBe(LoggerLevels.DEBUG);
        });

        test('The writer should be of a given type', () => {
            class AnotherTestWriter implements LogWriterInterface {
                write(message: string): void { }
            }

            const loggerConfig: LoggerConfig = {
                defaultLevel: LoggerLevels.DEBUG,
                formatterWriterPairs: [
                    {
                        writer: () => { return new AnotherTestWriter() },
                    }
                ],
            }
            const configuration: LoggerOptions = {
                default: loggerConfig
            };


            createLoggers(configuration);
            const logger = getLogger() as Logger;
            expect((logger.getWriter() instanceof AnotherTestWriter)).toBeTruthy()
        })

        test('The formatter should be of a given type', () => {
            class AnotherTestFormatter implements LogFormatterInterface {
                formatLog(content: LogContent): string { return '' }
            }
            const loggerConfig: LoggerConfig = {
                defaultLevel: LoggerLevels.DEBUG,
                formatterWriterPairs: [
                    {
                        formatter: () => { return new AnotherTestFormatter() },
                    }
                ],
            }
            const configuration: LoggerOptions = {
                default: loggerConfig
            };


            createLoggers(configuration);
            const logger = getLogger() as Logger;
            expect((logger.getFormatter() instanceof AnotherTestFormatter)).toBeTruthy()
        })

    });


    describe("Configuration tests for the default logger.", () => {


        test("The default logger should output logs to the CONSOLE with a DEFAULT WRITTER and DEFAULT FORMAT when no configuration is specified", () => {
            const message = "The Message";
            const configuration: LoggerOptions = {
                timestamp: () => "2023-12-24T00:10:00.000Z",
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [
                        {
                            name: "ABC",
                        }
                    ]
                }
            };

            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.debug(message);
            const outputedMessage = theArgs[0];

            expect(outputedMessage).toBe('2023-12-24T00:10:00.000Z | level: debug | message: "The Message" |');
        });

        test("The default logger should ensure output to CONSOLE the CUSTOM FORMAT when only a formatter is configured", () => {
            const message = "The Message 2";
            const configuration: LoggerOptions = {
                timestamp: () => "2023-12-24T00:00:00.000Z",
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [
                        {
                            name: "ABCD",
                            formatter: () => { return new TestFormatter() },
                        }
                    ]
                }
            };

            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.debug(message);

            expect((logger.getFormatter() as TestFormatter)._message).toBe("The Message 2");
        });

        test("The default logger with should output logs in the default format throughout the defined writer when only a custom writer is configured", () => {
            const message = "The Message";
            const configuration: LoggerOptions = {
                timestamp: () => "2023-12-24T00:00:00.000Z",
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [
                        {
                            name: "ABC",
                            writer: () => { return new TestWriter(); },
                        }
                    ]
                }
            };

            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.debug(message);

            expect((logger.getWriter() as TestWriter)._formattedMessage).toBe('2023-12-24T00:00:00.000Z | level: debug | message: "The Message" |');
        });

        test("The default logger should use the specified custom writer and formatter", () => {
            const message = "The default logger should use the specified custom writer and formatter";
            const configuration: LoggerOptions = {
                default: {
                    defaultLevel: undefined,
                    formatterWriterPairs: [
                        {
                            formatter: () => { return new TestFormatter() },
                            writer: () => { return new TestWriter(); },
                        }
                    ]
                }
            };

            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.fatal(message);

            expect((logger.getFormatter() as TestFormatter)._message).toBe(message);
            expect((logger.getWriter() as TestWriter)._formattedMessage).toBe(message);
        });
    });


    describe("Tests on “chain of outputs”", () => {
        test("The default logger should log out throughout two outputs", () => {
            const message = "The default logger should log out throughout two outputs";
            const configuration: LoggerOptions = {
                timestamp: () => "2023-12-24T00:10:00.000Z",
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [
                        {
                            name: "First - the formatter is defined",
                            formatter: () => { return new TestFormatter() },
                        },
                        {
                            name: "Second - the writer is defined",
                            writer: () => { return new TestWriter(); },
                        }
                    ]
                }
            };

            createLoggers(configuration);
            const logger = getLogger() as Logger;
            logger.fatal(message);
            expect((logger.getFormatter(0) as TestFormatter)._message).toBe(message);

            const secondPairOutput = (logger.getWriter(1) as TestWriter)._formattedMessage;

            expect(secondPairOutput).toContain(message);
            expect(secondPairOutput).toContain("fatal")
            expect(secondPairOutput).toContain("2023-12-24T00:10:00.000Z");
        });

    });


    describe("Configuration tests for named loggers", () => {
        test("The named logger should be able to send a log with a custom writer and formatter", () => {

            const configuration: LoggerOptions = {
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [
                        {
                            formatter: () => { return new TestFormatter("Default") },
                            writer: () => { return new TestWriter("Default"); },
                        }
                    ]
                },
                namedLoggers: {
                    "namedLogger1": {
                        defaultLevel: LoggerLevels.INFO,
                        formatterWriterPairs: [
                            {
                                formatter: () => { return new TestFormatter("namedLogger1") },
                                writer: () => { return new TestWriter("namedLogger1"); },
                            }
                        ]
                    },
                    "namedLogger2": {
                        defaultLevel: LoggerLevels.ERROR,
                        formatterWriterPairs: [
                            {
                                formatter: () => { return new TestFormatter("namedLogger2") },
                                writer: () => { return new TestWriter("namedLogger2"); },
                            }
                        ]
                    }
                }
            };
            const message: string = "Named loggers";
            createLoggers(configuration);
            const logger = getLogger("namedLogger2") as Logger;
            logger.fatal(message);

            expect(logger.getName()).toBe("namedLogger2");
            expect((logger.getFormatter() as TestFormatter)._id).toBe("namedLogger2");
            expect((logger.getWriter() as TestWriter)._id).toBe("namedLogger2");

        });

    });


    describe("Testy dostępu do loggerów (default i named) - testy metody getLogger(name?)", () => {
        test("The parameterles call of getLogger should return the default logger", () => {
            const logger = getLogger();
            expect(logger.getName()).toBe("default");
        });
        test("The call of getLogger with correct name should return the named logger", () => {
            const configuration: LoggerOptions = {
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: []
                },
                namedLoggers: {
                    "namedLogger1": {
                        defaultLevel: LoggerLevels.INFO,
                        formatterWriterPairs: []
                    },
                    "namedLogger2": {
                        defaultLevel: LoggerLevels.ERROR,
                        formatterWriterPairs: []
                    }
                }
            };
            createLoggers(configuration);
            const logger = getLogger("namedLogger2");
            expect(logger.getName()).toBe("namedLogger2");
        });
        test("The call of getLogger with not correct name should be handled appropriately", () => {
            const configuration: LoggerOptions = {
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: []
                },
                namedLoggers: {
                    "namedLogger1": {
                        defaultLevel: LoggerLevels.INFO,
                        formatterWriterPairs: []
                    },
                    "namedLogger2": {
                        defaultLevel: LoggerLevels.ERROR,
                        formatterWriterPairs: []
                    }
                }
            };
            createLoggers(configuration);
            expect(() => { getLogger("namedLogger3") }).toThrow("The logger namedLogger3 does not exist");

        });
    });


    describe("Tests for payload function and the extData parameter", () => {

        test('Global payload data should be added by the default Logger when a global payload is provided', () => {
            const loggerConfig: LoggerConfig = {
                defaultLevel: LoggerLevels.DEBUG,
                formatterWriterPairs: [{
                    writer: () => { return new TestWriter(); }
                }],
                extendedLogPayload: () => {
                    return {

                        error: new Error('Test error'),
                        context: {
                            companyID: '123',
                            appID: '456',
                            documentID: '789',
                        },
                    }
                }
            }
            const configuration: LoggerOptions = {
                default: loggerConfig,
                timestamp: () => "2021-08-31T12:00:00.000Z"
            };
            createLoggers(configuration)
            const logger = getLogger() as Logger;
            logger.log(LoggerLevels.DEBUG, "My message");


            const lastMessage = (logger.getWriter() as TestWriter)._formattedMessage;
            expect(lastMessage).toContain('2021-08-31T12:00:00.000Z')
            expect(lastMessage).toContain('Test error')
            expect(lastMessage).toContain('context.companyID: "123" | context.appID: "456" | context.documentID: "789"')
        })

        test("Logger should use a direct payload data used in the logging method", () => {
            const configuration: LoggerOptions = {
                default: {
                    defaultLevel: LoggerLevels.DEBUG,
                    formatterWriterPairs: [{
                        writer: () => { return new TestWriter(); }
                    }],
                },
                timestamp: () => "2021-08-31T12:00:00.000Z"
            };
            createLoggers(configuration)
            const logger = getLogger() as Logger;
            logger.log(LoggerLevels.DEBUG, "My message", { testStr: "test", testObj: { a: 1, b: 2 } });


            const lastMessage = (logger.getWriter() as TestWriter)._formattedMessage;
            expect(lastMessage).toBe('2021-08-31T12:00:00.000Z | level: debug | message: "My message" | data: {"testStr":"test","testObj":{"a":1,"b":2}} |')
        });

        test("Global payload data should be added by by the named logger - custom formatter or writer", () => {
            const configuration: LoggerOptions = {
                timestamp: () => "2023-12-29T21:49:37.179Z",
                default: {
                    defaultLevel: LoggerLevels.TRACE,
                    formatterWriterPairs: [],
                },
                namedLoggers: {
                    "named": {
                        defaultLevel: LoggerLevels.TRACE,
                        formatterWriterPairs:
                            [{ writer: () => { return new TestWriter(); } }],
                    },
                }
            };
            createLoggers(configuration);
            const logger = getLogger("named") as Logger;
            logger.debug("My message", { testStr: "test" });
            const lastMessage = (logger.getWriter() as TestWriter)._formattedMessage;

            expect(lastMessage).toEqual('2023-12-29T21:49:37.179Z | level: debug | message: "My message" | data: {"testStr":"test"} |')
        });

        test("A logger should add a data specified by local payload function", () => {
            const configuration: LoggerOptions = {
                timestamp: () => "2023-12-29T21:49:37.179Z",
                default: {
                    extendedLogPayload: () => {
                        return { data: { a: 'default logger' } };
                    },
                    defaultLevel: LoggerLevels.TRACE,
                    formatterWriterPairs: [],
                },
                namedLoggers: {
                    "named": {
                        extendedLogPayload: () => {
                            return { data: { a: 'named logger' } };
                        },
                        defaultLevel: LoggerLevels.TRACE,
                        formatterWriterPairs:
                            [{ writer: () => { return new TestWriter(); } }],
                    },
                }
            };
            createLoggers(configuration);
            const logger = getLogger("named") as Logger;
            logger.debug("My message", { testStr: "test" });
            const lastMessage = (logger.getWriter() as TestWriter)._formattedMessage;

            expect(lastMessage).toEqual('2023-12-29T21:49:37.179Z | level: debug | message: "My message" | data: {"testStr":"test"} | extdata: {"a":"named logger"} |')

        });
    });


    describe('logging level change', () => {
        test('the builder should be able to change all loggers logging level at once', () => {
            const configuration: LoggerOptions = {
                timestamp: () => "2023-12-29T21:49:37.179Z",
                default: {
                    defaultLevel: LoggerLevels.TRACE,
                    formatterWriterPairs: [],
                },
                namedLoggers: {
                    "named_1": {
                        defaultLevel: LoggerLevels.DEBUG,
                        formatterWriterPairs: []
                    },
                    "named_2": {
                        defaultLevel: LoggerLevels.FATAL,
                        formatterWriterPairs: []
                    },

                }
            };
            createLoggers(configuration);
            const logger_1 = getLogger("named_1") as Logger;
            const logger_2 = getLogger("named_2") as Logger;
            const logger_default = getLogger() as Logger;
            setLogLevel(LoggerLevels.ERROR);

            expect(logger_1.level).toBe(LoggerLevels.ERROR);
            expect(logger_2.level).toBe(LoggerLevels.ERROR);
            expect(logger_default.level).toBe(LoggerLevels.ERROR);
        });


        test('the builder should be able to change the level for the given logger', () => {
            const configuration: LoggerOptions = {
                timestamp: () => "2023-12-29T21:49:37.179Z",
                default: {
                    defaultLevel: LoggerLevels.TRACE,
                    formatterWriterPairs: [],
                },
                namedLoggers: {
                    "named_1": {
                        defaultLevel: LoggerLevels.DEBUG,
                        formatterWriterPairs: []
                    },
                    "named_2": {
                        defaultLevel: LoggerLevels.FATAL,
                        formatterWriterPairs: []
                    },

                }
            };
            createLoggers(configuration);
            const logger_1 = getLogger("named_1") as Logger;
            const logger_2 = getLogger("named_2") as Logger;
            const logger_default = getLogger() as Logger;
            setLogLevelForLogger(LoggerLevels.ERROR);
            setLogLevelForLogger(LoggerLevels.WARN, "named_1");

            expect(logger_default.level).toBe(LoggerLevels.ERROR);
            expect(logger_1.level).toBe(LoggerLevels.WARN);
            expect(logger_2.level).toBe(LoggerLevels.FATAL);
        });

    })


});