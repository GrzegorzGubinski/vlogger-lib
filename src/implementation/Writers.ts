import { LogWriterInterface, LoggerLevels, LogContent } from '@/api/LoggerInterface';

export class ConsoleWriter implements LogWriterInterface {
    write(formattedMessage: string, content: LogContent): void {
        if (content.level === LoggerLevels.ERROR || content.level === LoggerLevels.FATAL) {
            console.error(formattedMessage);
        } else if (content.level === LoggerLevels.WARN) {
            console.warn(formattedMessage);
        } else if (content.level === LoggerLevels.INFO) {
            console.warn(formattedMessage);
        } else if (content.level === LoggerLevels.DEBUG) {
            console.debug(formattedMessage);
        } else if (content.level === LoggerLevels.TRACE) {
            console.trace(formattedMessage);
        }
    }
}
