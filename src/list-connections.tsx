import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useEffect, useState } from "react"
import { Connection, ConnectionState } from "./types"
import { connect, disconnect, getConnectionNames } from "./scripts"
import { ActionTitles, ErrorMessages, Icons, StateMessages } from "./constants"

const stateChangeTimeout = 3000

export default function Command() {
  const [connections, setConnections] = useState<Connection[]>([])

  const fetchConnections = async () => {
    const connectionNames = await getConnectionNames()
    setConnections(connectionNames)
    return connectionNames
  }

  useEffect(() => {
    fetchConnections()
  }, [getConnectionNames])

  const handleSelect = async (selectedConnection: Connection) => {
    try {
      const targetState = getOppositeConnectionState(selectedConnection)
      const toast = await showToast({
        style: Toast.Style.Animated,
        title:
          targetState === ConnectionState.Connected
            ? StateMessages.Connecting
            : StateMessages.Disconnecting,
      })
      setConnectionState(selectedConnection, ConnectionState.Changing)

      if (isConnectionActive(selectedConnection))
        await disconnect(selectedConnection.name)
      else await connect(selectedConnection.name)

      setTimeout(async () => {
        const connections = await fetchConnections()
        const connection = connections.find(
          (c) => c.name === selectedConnection.name,
        )
        if (connection && isConnectionActive(connection)) {
          toast.style = Toast.Style.Success
          toast.title = StateMessages.Connected
        } else {
          toast.style = Toast.Style.Success
          toast.title = StateMessages.Disconnected
        }
      }, stateChangeTimeout)
    } catch (e) {
      console.error(e)
      await showToast({
        style: Toast.Style.Failure,
        title: ErrorMessages.Generic,
      })
    }
  }

  const getOppositeConnectionState = (connection: Connection) =>
    isConnectionActive(connection)
      ? ConnectionState.Disconnected
      : ConnectionState.Connected

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

  const getIcon = (connection: Connection) => {
    switch (connection.state) {
      case ConnectionState.Connected:
        return Icons.Connected
      case ConnectionState.Disconnected:
        return Icons.Disconnected
      default:
        return Icons.Changing
    }
  }

  const getTitle = (connection: Connection) => {
    return isConnectionActive(connection)
      ? ActionTitles.Disconnect
      : ActionTitles.Connect
  }

  return (
    <List>
      {connections.map((connection, index) => (
        <List.Item
          key={index}
          title={connection.name}
          icon={getIcon(connection)}
          actions={
            <ActionPanel>
              <Action
                title={getTitle(connection)}
                onAction={() => handleSelect(connection)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
