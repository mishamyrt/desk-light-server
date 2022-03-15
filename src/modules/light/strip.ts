import { ReadlineParser, SerialPort } from 'serialport'
import { sleep } from '../flow'
import { Command } from './commands'
import { Task } from './types'

/**
 * Class that implements table light strip data protocol
 */
export class LightStrip {
    private port: SerialPort
    private data = -1
    private isInLog = false
    private stack: Task[] = []
    private _brightness = 128
    private _state = false
    private _color: [number, number, number] = [255, 255, 255]

    constructor (path: string) {
      this.port = new SerialPort({
        path,
        baudRate: 2000000
      })
      const parser = new ReadlineParser({ delimiter: '\n' })
      this.port
        .pipe(parser)
        .on('data', data => this.handleData(data))
      this.runTasks()
    }

    public async ready () {
      return this.waitForCode(1)
    }

    // COMMAND_AMBILIGHT invert zones_count {start_index count}
    // 4 1 3 0 40 41 40 81 40
    public startAmbilight (params: number[]) {
      return this.sendCommand(Command.StartAmbilight, params)
    }

    public stopAnimation () {
      return this.sendCommand(Command.StopAnimation)
    }

    public async setAmbilightColor (colors: number[]) {
      return this.sendCommand(Command.SetAmbilightColor, colors)
    }

    public async getProperties () {
      return {
        color: this._color,
        state: this._state,
        brightness: this._brightness
      }
    }

    public powerOff () {
      this._state = false
      return this.sendCommand(Command.PowerOff)
    }

    public powerOn () {
      this._state = true
      return this.sendCommand(Command.PowerOn, this._color)
    }

    public setColor (r: number, g: number, b: number) {
      this._color[0] = r
      this._color[1] = g
      this._color[2] = b
      return this.sendCommand(Command.SetColor, [r, g, b])
    }

    public setBrightness (value: number) {
      this._brightness = value
      return this.sendCommand(Command.SetBrightness, [value])
    }

    private async runTasks () {
      while (true) {
        if (this.stack.length > 0) {
          const task = this.stack.shift()
          if (!task) {
            throw Error('There is no task')
          }
          await task()
        }
        await sleep(5)
      }
    }

    private handleData (data: string) {
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

    private async waitForCode (expected: number) {
      const actual = await this.recieve()
      if (actual !== expected) {
        throw new Error(`Wrong code. ${actual} given, ${expected} expected`)
      }
    }

    private async sendCommand (code: number, args?: number[]) {
      if (!args?.length) {
        this.send([code])
        return
      }
      this.send([code, ...args])
      return {
        status: 'ok'
      }
    }

    private createTask (payload: Buffer): Task {
      return () => new Promise(resolve => {
        this.port.write(payload)
        this.port.drain(() => resolve())
      })
    }

    private send (command: number[]) {
      const request = Buffer.from([...command, 0x1337])
      this.stack.push(
        this.createTask(request)
      )
    }
}
