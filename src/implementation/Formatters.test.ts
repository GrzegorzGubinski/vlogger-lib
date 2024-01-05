import { describe, test, expect } from 'vitest'

import {
    LoggerLevels,
    LogWriterInterface,
    ExtendedLogPayloadInterface,
    LogContent
} from '@/api/LoggerInterface'

import { DefaultFormatter, JsonFormatter } from './Formatters';


describe('The DefaultFormatter class tests focused on a format of the output', () => {
    test('The log should contain the timestamp and the message only', () => {

        const logContent: LogContent = {
            level: LoggerLevels.DEBUG,
            message: "This is a debug message",
            timestamp: "2021-08-31T12:00:00.000Z",
        };

        const formatter = new DefaultFormatter();
        const output = '2021-08-31T12:00:00.000Z | level: debug | message: "This is a debug message" |'

        expect(formatter.formatLog(logContent)).toEqual(output);
    });

    test('The log should contain the evrything including ext. data', () => {

        const logContent: LogContent = {
            level: LoggerLevels.DEBUG,
            message: "This is a debug message",
            timestamp: "2021-08-31T12:00:00.000Z",
            data: { debug: "Debugging info", end: false },
            extendedData: {
                error: new Error("An error occurred"),
                context: { userId: "789", appID: "24324" },
                data: { additional: "info" }
            } as ExtendedLogPayloadInterface
        };

        const formatter = new DefaultFormatter();
        const output = '2021-08-31T12:00:00.000Z | level: debug | message: "This is a debug message" | context.userId: "789" | context.appID: "24324" | error: "An error occurred" | data: {"debug":"Debugging info","end":false} | extdata: {"additional":"info"} |'

        expect(formatter.formatLog(logContent)).toEqual(output);
    });


})


describe('The JsonFormatter class tests focused on a format of the output', () => {
    test('The log should contain the log level, the timestamp and the message only', () => {

        const logContent: LogContent = {
            level: LoggerLevels.DEBUG,
            message: "This is a debug message",
            timestamp: "2021-08-31T12:00:00.000Z",
        };

        const formatter = new JsonFormatter();
        const output = '{"level":2,"message":"This is a debug message","timestamp":"2021-08-31T12:00:00.000Z"}'

        expect(formatter.formatLog(logContent)).toEqual(output);
    });

    test('The log should contain the extended data including timestamp, error and additionalInfo', () => {

        const logContent: LogContent = {
            level: LoggerLevels.DEBUG,
            message: "This is a debug message",
            timestamp: "2021-08-31T12:00:00.000Z",
            data: { debug: "Debugging info", end: false },
            extendedData: {
                error: new Error("An error occurred"),
                context: { userId: "789", appID: "24324" },
                data: { additional: "info" }
            } as ExtendedLogPayloadInterface
        };

        const formatter = new JsonFormatter();
        const output = '{"level":2,"message":"This is a debug message","timestamp":"2021-08-31T12:00:00.000Z","data":{"debug":"Debugging info","end":false},"extendedData":{"error":{},"context":{"userId":"789","appID":"24324"},"data":{"additional":"info"}}}'

        expect(formatter.formatLog(logContent)).toEqual(output);
    });
})







