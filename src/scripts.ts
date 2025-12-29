import { showToast, Toast } from "@raycast/api"
import { runAppleScript } from "@raycast/utils"
import { Connection, ConnectionState } from "./types"
import { Error, StorageKeys } from "./constants"
import { compareConnections, getStorageValue, escape } from "./utils"

export const getConnectionNames = async (): Promise<Connection[]> => {
  try {
    const connectionNames: string = await runAppleScript(`
      set AppleScript's text item delimiters to "\n"
      tell application "Viscosity"
        set connectionCount to count of connections
        set resultList to {}

        repeat with i from 1 to connectionCount
          set connectionName to name of connection i
          set connectionState to state of connection i
          set end of resultList to connectionName & "||" & connectionState
        end repeat

        return resultList as string
      end tell
    `)
    return connectionNames.split("\n").map((cn) => {
      const [name, state] = cn.trim().split("||")
      return { name, state: state as ConnectionState }
    })
  } catch (e) {
    console.error(e)
    await showToast({
      style: Toast.Style.Failure,
      title: Error.Generic,
    })
    return []
  }
}

export const getConnectionState = async (
  name: string,
): Promise<ConnectionState | null> => {
  try {
    const state = await runAppleScript(`
      tell application "Viscosity"
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
      end tell
    `)
    return state as ConnectionState
  } catch (e) {
    console.error(e)
    await showToast({
      style: Toast.Style.Failure,
      title: Error.Generic,
    })
    return null
  }
}

export const connect = async (name: string): Promise<void> => {
  try {
    await runAppleScript(`
      tell application "Viscosity"
        connect "${escape(name)}"
      end tell
    `)
  } catch (e) {
    console.error(e)
    await showToast({
      style: Toast.Style.Failure,
      title: Error.Generic,
    })
  }
}

export const disconnect = async (name: string): Promise<void> => {
  try {
    await runAppleScript(
      `tell application "Viscosity" to disconnect "${escape(name)}"`,
    )
  } catch (e) {
    console.error(e)
    await showToast({
      style: Toast.Style.Failure,
      title: Error.Generic,
    })
  }
}

export const disconnectAll = async (): Promise<void> => {
  try {
    await runAppleScript('tell application "Viscosity" to disconnectall')
  } catch (e) {
    console.error(e)
    await showToast({
      style: Toast.Style.Failure,
      title: Error.Generic,
    })
  }
}

export async function getSortedConnections(): Promise<Connection[]> {
  const [connectionNames, quickConnect] = await Promise.all([
    getConnectionNames(),
    getStorageValue(StorageKeys.QuickConnect),
  ])

  return connectionNames
    .map((c) => ({
      ...c,
      isQuickConnect: c.name === quickConnect,
    }))
    .sort(compareConnections)
}

export async function getPrimaryConnection(): Promise<Connection | undefined> {
  const sortedConnections = await getSortedConnections()
  return sortedConnections[0]
}
