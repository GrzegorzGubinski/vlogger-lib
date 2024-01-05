
/**
 * The enum for the log levels. The log levels are used to determine the severity of the log message.
 */
export enum LoggerLevels {
    TRACE = 1,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL
}

/**
 * The helper map that maps the log levels to their names. 
 */
export const LoggerLevelsToNameMap = {
    [LoggerLevels.TRACE]: 'trace',
    [LoggerLevels.DEBUG]: 'debug',
    [LoggerLevels.INFO]: 'info',
    [LoggerLevels.WARN]: 'warn',
    [LoggerLevels.ERROR]: 'error',
    [LoggerLevels.FATAL]: 'fatal'
};

/**
 * The interface for the log formatter. All implementations of the log formatter are responsible 
 * for formatting the log message in a way that is suitable for the given writer.
 * The main method of the log formatter is the formatLog method, that returns a formatted log message.
 */
export interface LogFormatterInterface {
    formatLog(content: LogContent): string;
}

/**
 * The interface for the log writer. All implementations of the log writer are responsible for an actual
 * writing of the log message to the desired destination.
 * The wrirter should be paired with the log formatter, that formats the log message in a way that is acceptable 
 * for the given destination.
 */
export interface LogWriterInterface {
    /**
     * The main method of the log writer. It is responsible for the actual writing of the log message to the desired destination.
     * @param formattedMessage The message formated by the log formatter.
     * @param level Logging level for the message, Additional parametre that can be used by the writer for any cojnditional logisc.
     * @param originalMessage The original message that was passed to the logger. Additional parametre that can be used by the writer for any cojnditional logisc.
     * @param extendedData The orginal data that was passed to the logger. Additional parametre that can be used by the writer for any cojnditional logisc.
     */
    write(formattedMessage: string, content: LogContent): void;
}

type ApplicationContext = {
    [key: string]: string | undefined;
};

/**
 * The interface for the extended log payload. The extended log payload is an object that contains additional information
 * that can be used by the log writer or log formatter.
 */
export interface ExtendedLogPayloadInterface {
    error?: Error;
    context?: ApplicationContext;
    data?: object;
}

/**
 * The type for the direct payload. The direct payload is an object that is passed directly to the logger.
 * The direct payload is passed to the log formatter where is integrated into the output string.
 */
export type DirectPayload = object;

/**
 * The interface for the logger. All implementations of the logger are responsible for the actual logging of the message.
 * The logger is a facade that uses the log formatter and the log writer to format and write the log message.
 */
export interface LoggerInterface {

    get level(): LoggerLevels;
    set level(level: LoggerLevels);

    getName(): string;

    log(level: LoggerLevels, message: string, payload?: DirectPayload): void;
    trace(message: string, payload?: DirectPayload): void;
    debug(message: string, payload?: DirectPayload): void;
    info(message: string, payload?: DirectPayload): void;
    warn(message: string, payload?: DirectPayload): void;
    error(message: string, payload?: DirectPayload): void;
    fatal(message: string, payload?: DirectPayload): void;
}

/**
 * The enum for the build in types of the log formatters. The build in types of the log formatters are used to determine the
 * type of the log formatter that should be used by the logger.
 */
export enum BuiltInFormatterTypes {
    DEFAULT,
    JSON,
    XML,
}


/**
 * The enum for the build in types of the log writers. The build in types of the log writers are used to determine the 
 * type of the log writer that should be used by the logger.
 */
export enum BuiltInWriterTypes {
    DEFAULT,
    FIREBASE,
}


type LogFormatterFactory = () => LogFormatterInterface;
export type TypeOrLogFormatterFactoryFunction = BuiltInFormatterTypes | LogFormatterFactory;

type LogWriterFactory = () => LogWriterInterface;
export type TypeOrLogWriterFactoryFunction = BuiltInWriterTypes | LogWriterFactory;

export type ExtendedLogPayloadFactory = () => ExtendedLogPayloadInterface;

export type FormatterWriterPair = {
    name?: string;
    formatter?: TypeOrLogFormatterFactoryFunction;
    writer?: TypeOrLogWriterFactoryFunction;
};


export interface LoggerOptions {
    default: LoggerConfig;

    timestamp?: TimestampFactory;
    namedLoggers?: NamedLoggerConfigs;
}

export interface LoggerConfig {
    formatterWriterPairs: FormatterWriterPair[];

    //name?: string;
    defaultLevel?: LoggerLevels;

    extendedLogPayload?: ExtendedLogPayloadFactory;
}

export type TimestampFactory = () => string;

export interface NamedLoggerConfigs {
    [loggerName: string]: LoggerConfig;
}

export type LogContent = {
    timestamp: string;
    level: LoggerLevels;
    message: string;
    data?: DirectPayload;
    extendedData?: ExtendedLogPayloadInterface;
};





