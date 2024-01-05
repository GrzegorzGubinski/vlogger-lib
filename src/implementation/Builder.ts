import {
    LogFormatterInterface,
    LoggerConfig,
    LoggerInterface,
    LogWriterInterface,
    TypeOrLogWriterFactoryFunction,
    TypeOrLogFormatterFactoryFunction,
    BuiltInFormatterTypes,
    BuiltInWriterTypes,
    LoggerLevels,
    LoggerOptions,
    TimestampFactory,
    FormatterWriterPair
} from '@/api/LoggerInterface';

import { DefaultFormatter, JsonFormatter, XmlFormatter } from './Formatters';
import { ConsoleWriter } from './Writers';
import { Logger, FormatterWriterPairObjects } from './Logger';

/**
 * The LoggerBuilder class is a helper class responsible for creating a logger instance
 * according to the provided configuration. The access to the configured loggers is provided via 
 * the getLogger function.
 * 
 * @param configuration - the configuration of the logger
 */
class LoggerBuilder {
    private configuration!: LoggerOptions;
    private _defaultLogger!: Logger;
    private _loggers: { [x: string]: Logger } = {};

    private static readonly DEFAULT_LOGGER_NAME = 'default';
    private static readonly DEFAULT_LOG_LEVEL = LoggerLevels.DEBUG;


    constructor(configuration: LoggerOptions) {
        this.configuration = configuration;
    }

    createFormatter(formatter?: TypeOrLogFormatterFactoryFunction): LogFormatterInterface {
        if (typeof formatter === 'undefined') return new DefaultFormatter();
        if (typeof formatter === 'function')
            return formatter();
        let newFormatter = new DefaultFormatter();
        if (Object.values(BuiltInFormatterTypes).includes(formatter)) {
            switch (formatter) {
                case BuiltInFormatterTypes.DEFAULT:
                    newFormatter = new DefaultFormatter();
                    break;
                case BuiltInFormatterTypes.JSON:
                    newFormatter = new JsonFormatter();
                    break;
                case BuiltInFormatterTypes.XML:
                    newFormatter = new XmlFormatter();
                    break;
            }
        }
        return newFormatter;
    }

    createWriter(writer?: TypeOrLogWriterFactoryFunction): LogWriterInterface {
        //console.log("createWriter: ", writer);

        if (typeof writer === 'undefined') return new ConsoleWriter();
        if (typeof writer === 'function')
            return writer();
        let newWriter = new ConsoleWriter();
        if (Object.values(BuiltInWriterTypes).includes(writer)) {
            switch (writer) {
                case BuiltInWriterTypes.DEFAULT:
                    newWriter = new ConsoleWriter();
                    break;
            }
        }
        return newWriter;
    }

    private static createDefaultFormatterWriterPair(): FormatterWriterPair {
        return {
            formatter: BuiltInFormatterTypes.DEFAULT,
            writer: BuiltInWriterTypes.DEFAULT,
        }
    }

    private static createDefaultFormatterWriterPairs(): FormatterWriterPair[] {
        const formatterWriterPairs: FormatterWriterPair[] = [];
        formatterWriterPairs.push(LoggerBuilder.createDefaultFormatterWriterPair());
        return formatterWriterPairs;
    }

    private static createDefaultConfiguration(): LoggerConfig {
        return {
            formatterWriterPairs: LoggerBuilder.createDefaultFormatterWriterPairs(),
            defaultLevel: LoggerBuilder.DEFAULT_LOG_LEVEL,
        }
    }

    private static createDefaultTimestampFactory(): TimestampFactory {
        return () => new Date().toISOString();
    }



    private completeNamedLoggersConfiguration() {
        const namedLoggers = this.configuration.namedLoggers;
        for (const key in namedLoggers) {
            if (Object.prototype.hasOwnProperty.call(namedLoggers, key)) {
                const loggerConfig = namedLoggers[key];
                this.completePairs(loggerConfig);
            }
        }
    }

    private completeDefaultLoggerConfiguration(): void {
        // STEP 1: create complet default configuration for a default logger if not provided configuration is undefined
        this.createDefaultDefaultConfiguration();

        const loggerConfig = this.configuration.default;
        // STEP 2: add missing pair of formatter and writer if not provided // this.configuration.default.formatterWriterPairs.length === 0
        this.completePairs(loggerConfig);
    }

    private completePairs(loggerConfig: LoggerConfig) {
        if (loggerConfig.formatterWriterPairs.length === 0) {
            loggerConfig.formatterWriterPairs.push(LoggerBuilder.createDefaultFormatterWriterPair());
        }

        // STEP 3: for each pair of formatter and writer
        loggerConfig.formatterWriterPairs.forEach(pair => {
            //console.log("BEFORE => ", JSON.stringify(pair, null, 2));
            // STEP 3.1: add missing formatter if not provided
            if (pair.formatter === undefined) pair.formatter = BuiltInFormatterTypes.DEFAULT;

            // STEP 3.2: add missing writer if not provided
            if (pair.writer === undefined) pair.writer = BuiltInWriterTypes.DEFAULT;

        });
    }

    private addDefaultFormatterWriterPairs(): void {
        if (this.configuration.default.formatterWriterPairs === undefined || this.configuration.default.formatterWriterPairs.length === 0) {
            this.configuration.default.formatterWriterPairs = [];
            this.configuration.default.formatterWriterPairs.push(LoggerBuilder.createDefaultFormatterWriterPair());
        }
    }

    private createDefaultDefaultConfiguration(): void {
        if (this.configuration?.default === undefined) {
            this.configuration.default = LoggerBuilder.createDefaultConfiguration();
        }
        else {
            if (this.configuration.default.defaultLevel === undefined) {
                this.configuration.default.defaultLevel = LoggerBuilder.DEFAULT_LOG_LEVEL;
            }
        }
    }

    private buildNamedLoggers(): void {
        for (const key in this.configuration.namedLoggers) {
            if (Object.prototype.hasOwnProperty.call(this.configuration.namedLoggers, key)) {
                const loggerConfig = this.configuration.namedLoggers[key];
                const formatterWriterPairObjects: FormatterWriterPairObjects[] = this.buildFormatterWriterPairsArray(loggerConfig);

                const timestampFactory: TimestampFactory = this.configuration.timestamp || LoggerBuilder.createDefaultTimestampFactory();
                const logger = new Logger(loggerConfig, timestampFactory, formatterWriterPairObjects, key);
                this.addNamedLogger(key, logger);
            }
        }
    }

    private addNamedLogger(name: string, logger: Logger) {
        this._loggers[name] = logger;
    }

    private buidlDefaultLogger(): void {
        const loggerConfig = this.configuration.default;
        const formatterWriterPairObjects: FormatterWriterPairObjects[] = this.buildFormatterWriterPairsArray(loggerConfig);

        const timestampFactory: TimestampFactory = this.configuration.timestamp || LoggerBuilder.createDefaultTimestampFactory();
        this._defaultLogger = new Logger(this.configuration.default, timestampFactory, formatterWriterPairObjects);
    }

    public build(): LoggerInterface {
        //console.log("BEFORE this.completeConfiguration(); ", JSON.stringify(this.configuration, null, 2));

        this.completeDefaultLoggerConfiguration();
        this.completeNamedLoggersConfiguration();

        //console.log("right AFTER this.completeConfiguration(); ", JSON.stringify(this.configuration, null, 2));
        this.buildNamedLoggers();
        this.buidlDefaultLogger();

        return this._defaultLogger;
    }

    private buildFormatterWriterPairsArray(loggerConfig: LoggerConfig) {
        const formatterWriterPairObjects: FormatterWriterPairObjects[] = [];

        loggerConfig.formatterWriterPairs.forEach(element => {
            const writter = this.createWriter(element.writer);
            const formatter = this.createFormatter(element.formatter);
            formatterWriterPairObjects.push(new FormatterWriterPairObjects(formatter, writter, element.name));
        });
        return formatterWriterPairObjects;
    }

    getLogger(name?: string): LoggerInterface {
        //console.log("getLogger: ", name);
        //console.log("this._loggers: ", this._loggers);
        if (name !== undefined && this._loggers[name] === undefined)
            throw new Error("The logger " + name + " does not exist");

        if (name !== undefined && this._loggers[name] !== undefined) {
            //console.log("this._loggers[ ", name, " ]", this._loggers[name]);
            return this._loggers[name];
        }
        return this._defaultLogger;
    }

    setLogLevel(level: LoggerLevels) {
        // for every logger in _loggers set the level
        for (const key in this._loggers) {
            if (Object.prototype.hasOwnProperty.call(this._loggers, key)) {
                const logger = this._loggers[key];
                logger.level = level;
            }
        }
        this._defaultLogger.level = level;
    }
}


let mainLogBuilder: LoggerBuilder;
let resetLoggers = false;

export function createLoggers(configuration: LoggerOptions) {
    if (mainLogBuilder === undefined || resetLoggers) {
        const builder = new LoggerBuilder(configuration);
        builder.build();
        resetLoggers = false;
        mainLogBuilder = builder;
    }
    else {
        //console.log("createLoggers: ", mainLogBuilder);
        //console.log("createLoggers: ", configuration);
    }
}

export function deleteLoggers() {
    resetLoggers = true;
}

export function getLogger(name?: string): LoggerInterface {
    return mainLogBuilder.getLogger(name);
}

export function setLogLevel(level: LoggerLevels) {
    mainLogBuilder.setLogLevel(level);
}

export function setLogLevelForLogger(level: LoggerLevels, loggerName?: string) {
    const logger = mainLogBuilder.getLogger(loggerName);
    logger.level = level;
}
