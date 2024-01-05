import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

/** 
 * @returns the current UTC time as a string
 */
export function getTimestamp(): string {
    return dayjs().utc().format();
}

/**
 * Under the hood it uses the dayjs library to get the current UTC time object
 * @returns the current UTC time object as any
 */
export function getTimestampObj(): any {
    return dayjs().utc();
}

/** 
 * Accepts a Dayjs compatible object, converts it to Dayjs object, and returns the UTC string
 * @param obj - a Dayjs compatible object
 * @returns a string timestamp in a format of YYYY-MM-DDTHH:mm:ssZ
 */
export function getTimestampFromObject(obj: any): string {
    return dayjs(obj).utc().format();
}

/**  
 * Converts a string timestamp to a Dayjs object 
 * @param timestampStr - a string timestamp in a format of YYYY-MM-DDTHH:mm:ssZ
 * @returns a Dayjs object as any
 */
export function getObjectFromTimestamp(timestampStr: string): any {
    return dayjs(timestampStr).utc();
}

/** 
 * Checks if the string is a valid timestamp format
 * @param str - a string timestamp in a format of YYYY-MM-DDTHH:mm:ssZ
 * @returns true if the string is a valid timestamp format, false otherwise
 */
export function isCorrectTimestampString(str: string): boolean {
    const formatString = 'YYYY-MM-DDTHH:mm:ssZ';
    return dayjs(str, formatString, true).isValid();
}




