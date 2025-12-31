import { useCallback, useEffect, useState } from "react"
import { showToast, Toast } from "@raycast/api"
import { Connection, ConnectionState } from "@/types"
import { getConnectionNames } from "@/api/viscosity"
import { getStorageValue } from "@/api/storage"
import { compareConnections, sortConnections, isPermissionError } from "@/utils"
import { Error, StorageKeys } from "@/constants"

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadConnections = useCallback(async () => {
    setIsLoading(true)
    try {
      const [rawConnections, quickConnect] = await Promise.all([
        getConnectionNames(),
        getStorageValue(StorageKeys.QuickConnect),
      ])
      setConnections(sortConnections(rawConnections, quickConnect))
    } catch (e) {
      console.error(e)
      await showToast({
        style: Toast.Style.Failure,
        title: isPermissionError(e) ? Error.Permissions : Error.Generic,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  const updateConnectionState = useCallback(
    (selectedConnection: Connection, state: ConnectionState) => {
      setConnections((prev) =>
        prev
          .map((c) =>
            c.name === selectedConnection.name ? { ...c, state } : c,
          )
          .sort(compareConnections),
      )
    },
    [],
  )

  return {
    connections,
    isLoading,
    loadConnections,
    updateConnectionState,
    setConnections,
  }
}
