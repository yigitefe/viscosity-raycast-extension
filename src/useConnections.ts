import { useCallback, useEffect, useState } from "react"
import { Connection, ConnectionState } from "./types"
import { getConnectionNames } from "./scripts"
import { getFavorite } from "./utils"

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const compareConnections = (a: Connection, b: Connection) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1

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
      const [connectionNames, favoriteConnection] = await Promise.all([
        getConnectionNames(),
        getFavorite(),
      ])
      setConnections(
        connectionNames
          .map((c) => ({
            ...c,
            isFavorite: c.name === favoriteConnection,
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
