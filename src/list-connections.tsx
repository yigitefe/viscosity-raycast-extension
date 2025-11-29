import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useEffect, useState } from "react"
import { Connection, ConnectionState } from "./types"
import { connect, disconnect, getConnectionNames } from "./scripts"
import {
  ErrorMessages,
  Icons,
  SuccessMessages,
  ActionTitles,
} from "./constants"

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
    state: ConnectionState,
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
        title:
          targetState === ConnectionState.Connected
            ? SuccessMessages.Connecting
            : SuccessMessages.Disconnecting,
      })
    } catch (e) {
      console.error(e)
      setConnectionState(selectedConnection, selectedConnection.state)
      await showToast({
        style: Toast.Style.Failure,
        title: ErrorMessages.Generic,
      })
    }
  }

  return (
    <List>
      {connections.map((connection, index) => (
        <List.Item
          key={index}
          title={connection.name}
          icon={
            isConnectionActive(connection)
              ? Icons.Connected
              : Icons.Disconnected
          }
          actions={
            <ActionPanel>
              <Action
                title={
                  isConnectionActive(connection)
                    ? ActionTitles.Disconnect
                    : ActionTitles.Connect
                }
                onAction={() => handleSelect(connection)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
