import { Command } from './commands'
import { DapConnector } from '../dap'

/**
 * Class that implements table light strip data protocol
 */
export class LightStrip {
    private _brightness = 128
    private _state = false
    private _color: [number, number, number] = [255, 255, 255]

    constructor (
      private connection: DapConnector
    ) { }

    public async getProperties () {
      return {
        color: this._color,
        state: this._state,
        brightness: this._brightness
      }
    }

    public async sendRaw (command: number[]) {
      await this.connection.send(command)
    }

    public async powerOff () {
      this._state = false
      await this.connection.send([Command.PowerOff])
    }

    public async powerOn () {
      this._state = true
      await this.connection.send([Command.PowerOn, ...this._color])
    }

    public async setColor (colors: number[], brightness: number) {
      if (colors.length === 3) {
        this._color = colors.slice(0, 3) as [number, number, number]
      }
      this._brightness = brightness
      await this.connection.send([
        Command.SetColor,
        this._brightness,
        ...colors
      ])
    }

    public async setColorZones (mapping: number[]) {
      await this.connection.send([
        Command.SetColorZones,
        mapping.length,
        ...mapping
      ])
    }
}
