import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useEffect, useState } from "react"
import { Connection, ConnectionState } from "./types"
import { connect, disconnect, getConnectionNames } from "./scripts"

export default function Command() {
  const [connections, setConnections] = useState<Connection[]>([])
  useEffect(() => {
    const fetchConnections = async () => {
      setConnections(await getConnectionNames())
    }
    fetchConnections()
  }, [getConnectionNames])

  const setConnectionState = (
    selectedConnection: Connection,
    state: string,
  ) => {
    setConnections(
      connections.map((c) => (c === selectedConnection ? { ...c, state } : c)),
    )
  }

  const isConnectionActive = (connection: Connection) =>
    connection.state === ConnectionState.Connected

  const getOppositeConnectionState = (connection: Connection) =>
    isConnectionActive(connection)
      ? ConnectionState.Disconnected
      : ConnectionState.Connected

  const handleSelect = async (selectedConnection: Connection) => {
    try {
      const targetState = getOppositeConnectionState(selectedConnection)

      if (isConnectionActive(selectedConnection))
        await disconnect(selectedConnection.name)
      else await connect(selectedConnection.name)

      setConnectionState(selectedConnection, targetState)

      await showToast({
        style: Toast.Style.Success,
        title: targetState,
      })
    } catch (e) {
      console.error(e)
      setConnectionState(selectedConnection, selectedConnection.state)
      await showToast({ style: Toast.Style.Failure, title: "Error occurred" })
    }
  }

  return (
    <List>
      {connections.map((connection, index) => (
        <List.Item
          key={index}
          title={connection.name}
          icon={connection.state === "Connected" ? "🟢" : "🔴"}
          actions={
            <ActionPanel>
              <Action
                title="Select"
                onAction={() => handleSelect(connection)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
