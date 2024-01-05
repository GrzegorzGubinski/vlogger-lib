import {
    LoggerLevels,
    LogFormatterInterface,
    LoggerConfig,
    LoggerInterface,
    LogWriterInterface,
    ExtendedLogPayloadInterface,
    ExtendedLogPayloadFactory, TimestampFactory, DirectPayload,
    LogContent
} from '@/api/LoggerInterface';

export class FormatterWriterPairObjects {
    formatter: LogFormatterInterface;
    writer: LogWriterInterface;
    name?: string;
    payload?: ExtendedLogPayloadFactory;

    constructor(formatter: LogFormatterInterface, writer: LogWriterInterface, name?: string) {
        this.formatter = formatter;
        this.writer = writer;
        this.name = name;
    }
}

export class Logger implements LoggerInterface {
    private _configuration: LoggerConfig;
    private _name: string;

    private _timestampFactory: TimestampFactory;
    private _formatterWriterPairs: FormatterWriterPairObjects[];
    private _currentLevel: LoggerLevels;

    constructor(configuration: LoggerConfig, fimestampFactory: TimestampFactory, formatterWriterPairObjects: FormatterWriterPairObjects[], name?: string) {
        this._configuration = configuration;
        this._timestampFactory = fimestampFactory;
        this._currentLevel = configuration.defaultLevel || LoggerLevels.DEBUG;

        this._formatterWriterPairs = formatterWriterPairObjects;
        this._name = name || 'default';
    }

    getName(): string {
        return this._name;
    }

    get level(): LoggerLevels {
        return this._currentLevel;
    }

    set level(level: LoggerLevels) {
        this._currentLevel = level;
    }

    getWriter(position?: number): LogWriterInterface {
        return this._formatterWriterPairs[position || 0].writer;
    }

    getFormatter(position?: number): LogFormatterInterface {
        return this._formatterWriterPairs[position || 0].formatter;
    }

    log(level: LoggerLevels, message: string, payload?: DirectPayload): void {

        if (level < this._currentLevel) {
            return;
        }

        const timestamp: string = (typeof this._timestampFactory === 'function') ? this._timestampFactory() : new Date().toISOString();
        const data: ExtendedLogPayloadInterface = this._configuration.extendedLogPayload?.() || {};

        // Merge 'data'
        const content: LogContent = {
            timestamp,
            level,
            message,
            data: payload,
            extendedData: data
        }

        this._formatterWriterPairs.forEach(pair => {
            //console.log(level, message, timestamp, data);
            const formattedMessage = pair.formatter.formatLog(content);
            //console.log(formattedMessage);
            pair.writer.write(formattedMessage, content);
        });

    }

    trace(message: string, payload?: DirectPayload): void {
        this.log(LoggerLevels.TRACE, message, payload);
    }

    debug(message: string, payload?: DirectPayload): void {
        this.log(LoggerLevels.DEBUG, message, payload);
    }

    info(message: string, payload?: DirectPayload): void {
        this.log(LoggerLevels.INFO, message, payload);
    }

    warn(message: string, payload?: DirectPayload): void {
        this.log(LoggerLevels.WARN, message, payload);
    }

    error(message: string, payload?: DirectPayload): void {
        this.log(LoggerLevels.ERROR, message, payload);
    }

    fatal(message: string, payload?: DirectPayload): void {
        this.log(LoggerLevels.FATAL, message, payload);
    }
}
