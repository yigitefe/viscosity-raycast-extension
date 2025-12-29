import { LocalStorage } from "@raycast/api"
import { Connection, ConnectionState } from "./types"
import { getConnectionState, getConnectionNames } from "./scripts"

const QUICK_CONNECT_KEY = "quick-connect"

export async function getQuickConnect(): Promise<string> {
  return (await LocalStorage.getItem<string>(QUICK_CONNECT_KEY)) ?? ""
}

export async function setQuickConnect(name: string) {
  await LocalStorage.setItem(QUICK_CONNECT_KEY, name)
}

export async function toggleQuickConnect(name: string) {
  const qc = await getQuickConnect()
  const newQC = qc === name ? "" : name
  await setQuickConnect(newQC)
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
