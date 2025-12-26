import { useCallback, useEffect, useState } from "react"
import { Connection, ConnectionState } from "./types"
import { getSortedConnections } from "./scripts"
import { compareConnections } from "./utils"

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadConnections = useCallback(async () => {
    setIsLoading(true)
    try {
      const sortedConnections = await getSortedConnections()
      setConnections(sortedConnections)
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
