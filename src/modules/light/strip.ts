import { ReadlineParser, SerialPort } from "serialport";
import { sleep } from '../flow'
import { Command } from './commands'

/**
 * Class that implements table light strip data protocol
 */
export class LightStrip {
    private port: SerialPort
    private data = -1
    private isLocked = false
    private isInLog = false

    constructor (path: string) {
        this.port = new SerialPort({
            path,
            baudRate: 9600
        });
        const parser = new ReadlineParser({ delimiter: '\n' })
        this.port
            .pipe(parser)
            .on('data', data => this.handleData(data))
    }

    public async ready() {
        return this.waitForCode(1)
    }

    public setPower(enabled: boolean) {
        return this.sendCommand(
            enabled
                ? Command.PowerOn
                : Command.PowerOff
        )
    }

    public setColor(r: number, g: number, b: number) {
        return this.sendCommand(Command.SetColor, [r, g, b])
    }

    public setBrightness(value: number) {
        return this.sendCommand(Command.SetBrightness, [value])
    }

    private async whenUnlocked () {
        while(true) {
            if (this.isLocked) {
                await sleep(5)
                continue
            }
            return
        }
    }

    private handleData(data: string) {
        if (this.isInLog) {
            console.log('log', data)
            this.isInLog = false
            return
        }
        const code = parseInt(data)
        if (code === 101010) {
            this.isInLog = true
            return
        }
        this.data = code
    }

    private async recieve () {
        while (true) {
            if (this.data === -1) {
                await sleep(5)
                continue
            }
            const value = this.data
            this.data = -1
            return value
        }
    }

    private async waitForCode(expected: number) {
        const actual = await this.recieve()
        if (actual !== expected) {
            throw new Error(`Wrong code. ${actual} given, ${expected} expected`)
        }
    }

    private async sendCommand(code: number, args?: number[]) {
        await this.whenUnlocked();
        this.isLocked = true
        if (!args?.length) {
            this.send([code])
            this.isLocked = false
            return
        }
        this.send([code, ...args])
        this.isLocked = false
    }

    private send(command: number[]) {
        console.log([...command, ])
        this.port.write(Buffer.from([...command, 0x256]))
    }
}
