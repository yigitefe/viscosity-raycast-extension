import { useCallback, useEffect, useState } from "react"
import { showToast, Toast } from "@raycast/api"
import { Connection, ConnectionState } from "@/types"
import { ConnectionService } from "@/services/connection"
import { compareConnections } from "@/utils"
import { Error } from "@/constants"

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadConnections = useCallback(async () => {
    setIsLoading(true)
    try {
      const sortedConnections = await ConnectionService.getSortedConnections()
      setConnections(sortedConnections)
    } catch (e) {
      console.error(e)
      await showToast({
        style: Toast.Style.Failure,
        title: Error.Generic,
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
