import { getTimestamp } from '../timestamps/timestamps';
import { BuiltInFormatterTypes, BuiltInWriterTypes, LoggerLevels, LoggerOptions } from '../api/LoggerInterface';
import { createLoggers, getLogger } from '../implementation/Builder';
import { JsonFormatter } from '../implementation/Formatters';
import { JSonServerWriter } from './JSonServerWriter';


const configuration: LoggerOptions = {
    timestamp: () => getTimestamp(),
    default: {
        defaultLevel: LoggerLevels.ERROR,
        formatterWriterPairs: []
    },
    namedLoggers: {
        "pinia": {
            defaultLevel: LoggerLevels.TRACE,
            formatterWriterPairs: [
                {
                    name: 'json-server',
                    formatter: () => { return new JsonFormatter() },
                    writer: () => { return new JSonServerWriter() }
                },
                {
                    name: 'console',
                    formatter: BuiltInFormatterTypes.DEFAULT,
                    writer: BuiltInWriterTypes.DEFAULT
                }
            ]
        },
    }
};


createLoggers(configuration)
const defaultLogger = getLogger();


// class LoggerError extends Error {
//     constructor(message: string) {
//         super(message);
//         this.name = 'LoggerError';
//     }
// }

export { defaultLogger as logger, getLogger /*, LoggerError*/ };


