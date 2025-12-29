import { runAppleScript } from "@raycast/utils"
import { Connection, ConnectionState } from "../types"
import { escape } from "../utils"

export class ViscosityClient {
  private static async run(script: string): Promise<string> {
    return await runAppleScript(
      `tell application "Viscosity"\n${script}\nend tell`,
    )
  }

  static async getConnectionNames(): Promise<Connection[]> {
    const script = `
      set AppleScript's text item delimiters to "\\n"
      set connectionCount to count of connections
      set resultList to {}

      repeat with i from 1 to connectionCount
        set connectionName to name of connection i
        set connectionState to state of connection i
        set end of resultList to connectionName & "||" & connectionState
      end repeat

      return resultList as string
    `
    const response = await this.run(script)
    if (!response) return []

    return response.split("\n").map((cn) => {
      const [name, state] = cn.trim().split("||")
      return { name, state: state as ConnectionState }
    })
  }

  static async getConnectionState(
    name: string,
  ): Promise<ConnectionState | null> {
    const script = `
      set connectionCount to count of connections
      set connectionState to ""

      repeat with i from 1 to connectionCount
        set connectionName to name of connection i
        if connectionName is "${escape(name)}" then
          set connectionState to state of connection i
          exit repeat
        end if
      end repeat

      return connectionState
    `
    const state = await this.run(script)
    return (state as ConnectionState) || null
  }

  static async connect(name: string): Promise<void> {
    await this.run(`connect "${escape(name)}"`)
  }

  static async disconnect(name: string): Promise<void> {
    await this.run(`disconnect "${escape(name)}"`)
  }

  static async disconnectAll(): Promise<void> {
    await this.run("disconnectall")
  }
}
