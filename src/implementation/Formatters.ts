import {
    LogFormatterInterface,
    ExtendedLogPayloadInterface,
    LoggerLevelsToNameMap,
    DirectPayload,
    LogContent
} from '@/api/LoggerInterface';



export class DefaultFormatter implements LogFormatterInterface {
    formatLog(content: LogContent): string {
        let formattedMessage = `${content.timestamp} | level: ${LoggerLevelsToNameMap[content.level]} | message: "${content.message}"`;
        //console.log("==== STEP 1 ===== formattedMessage: [", formattedMessage, "]");

        if (content && content.extendedData) {
            let extendedData = content.extendedData;
            if (extendedData.context) {
                Object.keys(extendedData.context).forEach(key => {
                    formattedMessage += ` | context.${key}: "${extendedData.context![key]}"`;
                });
            }
            //console.log("==== STEP 2 ===== formattedMessage: [", formattedMessage, "]");
            if (extendedData.error) {
                formattedMessage += ` | error: "${extendedData.error.message}"`;
            }
            //console.log("==== STEP 3 ===== formattedMessage: [", formattedMessage, "]");
        }

        if (content.data) {
            formattedMessage += ` | data: ${JSON.stringify(content.data)}`;
        }
        //console.log("==== STEP 4 ===== formattedMessage: [", formattedMessage, "]");

        if (content.extendedData) {

            if (content.extendedData.data) {
                formattedMessage += ` | extdata: ${JSON.stringify(content.extendedData.data)}`;
            }
        }
        //console.log("==== STEP 5 ===== formattedMessage: [", formattedMessage, "]");

        return formattedMessage + ' |';
    }
}


export class JsonFormatter implements LogFormatterInterface {
    formatLog(content: LogContent): string {
        return JSON.stringify(content);
    }
}


export class XmlFormatter implements LogFormatterInterface {

    private mergeData(data?: DirectPayload, extendedData?: ExtendedLogPayloadInterface): object {
        let merged = {};

        // Merge 'data'
        if (typeof data === 'string') {
            merged = { ...merged, string: data };
        } else if (typeof data === 'object') {
            if (data instanceof Map) {
                // If data is a Map, convert it to an object
                data.forEach((value, key) => {
                    //merged[key] = value;
                });
            } else {
                // If data is a regular object
                merged = { ...merged, object: data };
            }
        }

        // Merge 'extendedData'
        if (extendedData) {
            merged = { ...merged, ...extendedData };
        }

        return merged;
    }

    formatLog(content: LogContent): string {
        let logXml = `<log>\n<level>${content.level}</level>\n<message>${content.message}</message>\n`;
        if (content.timestamp) {
            logXml += `<timestamp>${content.timestamp}</timestamp>\n`;
        }
        const payload = { ...content.extendedData };

        if (payload) {
            for (const key in payload) {
                if (Object.prototype.hasOwnProperty.call(content.extendedData, key)) {
                    if (key === 'context' && typeof payload[key] === 'object') {
                        logXml += `<${key}>\n`;
                        for (const subKey in payload[key]) {
                            if (Object.prototype.hasOwnProperty.call(payload[key], subKey)) {
                                logXml += `<${subKey}>${(payload[key] as any)[subKey]}</${subKey}>\n`;
                            }
                        }
                        logXml += `</${key}>\n`;
                    } else {
                        logXml += `<${key}>${(content.extendedData as any)[key]}</${key}>\n`;
                    }
                }
            }
        }

        logXml += '</log>';

        return logXml;
    }
}
