import { LocalStorage } from "@raycast/api"
import { Connection, ConnectionState } from "./types"
import { getConnectionState, getConnectionNames } from "./scripts"
import { StorageKeys } from "./constants"

export async function getStorageValue(key: string): Promise<string> {
  return (await LocalStorage.getItem<string>(key)) ?? ""
}

export async function setStorageValue(key: string, value: string) {
  await LocalStorage.setItem(key, value)
}

export async function setQuickConnect(name: string) {
  const qc = await getStorageValue(StorageKeys.QuickConnect)
  const newQC = qc === name ? "" : name
  await setStorageValue(StorageKeys.QuickConnect, newQC)
  return newQC
}

export const pollConnectionState = async (
  name: string,
  targetState: ConnectionState,
): Promise<ConnectionState | null> => {
  for (let attempts = 0; attempts < 30; attempts++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const currentState = await getConnectionState(name)

    if (currentState === targetState) {
      return currentState
    }
  }
  return null
}

export const pollAllDisconnected = async (): Promise<boolean> => {
  for (let attempts = 0; attempts < 30; attempts++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const connections = await getConnectionNames()
    const allDisconnected = connections.every(
      (c) => c.state === ConnectionState.Disconnected,
    )

    if (allDisconnected) {
      return true
    }
  }
  return false
}

export const compareConnections = (a: Connection, b: Connection) => {
  if (a.isQuickConnect && !b.isQuickConnect) return -1
  if (!a.isQuickConnect && b.isQuickConnect) return 1

  const priority = {
    [ConnectionState.Connected]: 0,
    [ConnectionState.Changing]: 0,
    [ConnectionState.Disconnected]: 1,
  }

  const stateA = priority[a.state] ?? 1
  const stateB = priority[b.state] ?? 1

  if (stateA !== stateB) {
    return stateA - stateB
  }

  return a.name.localeCompare(b.name)
}

export const escape = (str: string) => {
  return str.replace(/\\/g, "\\\\")
}
