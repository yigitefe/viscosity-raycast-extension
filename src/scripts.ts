import { showToast, Toast } from "@raycast/api"
import { Connection, ConnectionState } from "./types"
import { Error, StorageKeys } from "./constants"
import { compareConnections, getStorageValue } from "./utils"
import { ViscosityClient } from "./api/viscosity"

export const getConnectionNames = async (): Promise<Connection[]> => {
  try {
    return await ViscosityClient.getConnectionNames()
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
    return await ViscosityClient.getConnectionState(name)
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
    await ViscosityClient.connect(name)
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
    await ViscosityClient.disconnect(name)
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
    await ViscosityClient.disconnectAll()
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
