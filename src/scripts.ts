import { Connection, ConnectionState } from "@/types"
import { StorageKeys } from "@/constants"
import { compareConnections } from "@/utils"
import { getStorageValue } from "@/api/storage"
import { ViscosityClient } from "@/api/viscosity"

export const getConnectionNames = async (): Promise<Connection[]> => {
  return await ViscosityClient.getConnectionNames()
}

export const getConnectionState = async (
  name: string,
): Promise<ConnectionState | null> => {
  return await ViscosityClient.getConnectionState(name)
}

export const connect = async (name: string): Promise<void> => {
  await ViscosityClient.connect(name)
}

export const disconnect = async (name: string): Promise<void> => {
  await ViscosityClient.disconnect(name)
}

export const disconnectAll = async (): Promise<void> => {
  await ViscosityClient.disconnectAll()
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
