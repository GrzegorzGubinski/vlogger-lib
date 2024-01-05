import { LogContent, LogWriterInterface } from "../api/LoggerInterface";
import { v5 as uuidv5 } from 'uuid';

// The namespace constant remains unchanged, as it is a string.
const namespace: string = '02f3ca00-4e47-11ee-8717-559bdeecd42b';

// Explicitly specify the type of 'name' parameter as string and the return type as string
function generateDefaultID(name: string): string {
    const uuid: string = uuidv5(name, namespace);
    return uuid;
}

export class JSonServerWriter implements LogWriterInterface {

    constructor(private port: number = 3008, private name: string = 'logs', private host: string = 'localhost') { }

    get logsURL(): string {
        return `http://${this.host}:${this.port}/${this.name}`;
    }

    async write(formattedMessage: string, content: LogContent): Promise<void> {
        const path: string = '';
        const json: string = formattedMessage;
        const id: string = generateDefaultID(formattedMessage);
        //console.log("======== json: ", json);
        //console.log("======== logsURL: ", this.logsURL);
        await this.writeLog(json);
    }

    private async writeLog(log: string) {
        //console.log("addTask(", task, ")");

        // ADD remotely
        const resp: Response = await fetch(this.logsURL, {
            method: 'POST',
            body: log,
            headers: { 'Content-Type': 'application/json' }
        })
        if (!resp.ok) {
            console.log(resp.statusText);
        }
    }

}


