import { useCallback, useEffect, useState } from "react"
import { Connection, ConnectionState } from "./types"
import { getConnectionNames } from "./scripts"
import { getQuickConnect } from "./utils"

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const compareConnections = (a: Connection, b: Connection) => {
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

  const loadConnections = useCallback(async () => {
    setIsLoading(true)
    try {
      const [connectionNames, quickConnect] = await Promise.all([
        getConnectionNames(),
        getQuickConnect(),
      ])
      setConnections(
        connectionNames
          .map((c) => ({
            ...c,
            isQuickConnect: c.name === quickConnect,
          }))
          .sort(compareConnections),
      )
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
