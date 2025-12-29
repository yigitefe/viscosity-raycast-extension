import { Connection, ConnectionState } from "@/types"
import { StorageKeys } from "@/constants"
import { compareConnections } from "@/utils"
import { getStorageValue } from "@/api/storage"
import { ViscosityClient } from "@/api/viscosity"

export class ConnectionService {
  static async getConnectionNames(): Promise<Connection[]> {
    return await ViscosityClient.getConnectionNames()
  }

  static async getConnectionState(
    name: string,
  ): Promise<ConnectionState | null> {
    return await ViscosityClient.getConnectionState(name)
  }

  static async connect(name: string): Promise<void> {
    await ViscosityClient.connect(name)
  }

  static async disconnect(name: string): Promise<void> {
    await ViscosityClient.disconnect(name)
  }

  static async disconnectAll(): Promise<void> {
    await ViscosityClient.disconnectAll()
  }

  static async getSortedConnections(): Promise<Connection[]> {
    const [connectionNames, quickConnect] = await Promise.all([
      this.getConnectionNames(),
      getStorageValue(StorageKeys.QuickConnect),
    ])

    return connectionNames
      .map((c) => ({
        ...c,
        isQuickConnect: c.name === quickConnect,
      }))
      .sort(compareConnections)
  }

  static async getPrimaryConnection(): Promise<Connection | undefined> {
    const sortedConnections = await this.getSortedConnections()
    return sortedConnections[0]
  }
}
