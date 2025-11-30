import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useEffect, useState } from "react"
import { Connection, ConnectionState } from "./types"
import { connect, disconnect, getConnectionNames } from "./scripts"
import { ActionTitles, ErrorMessages, Icons, StateMessages } from "./constants"

const stateChangeTimeout = 3000

export default function Command() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const compareConnections = (a: Connection, b: Connection) => {
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

  const fetchConnections = async () => {
    const connectionNames = await getConnectionNames()
    connectionNames.sort(compareConnections)
    setConnections(connectionNames)
    return connectionNames
  }

  useEffect(() => {
    fetchConnections()
  }, [])

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
    const connectionNames = connections
      .map((c) => (c === selectedConnection ? { ...c, state } : c))
      .sort(compareConnections)
    setConnections(connectionNames)
    setTimeout(() => setSelectedId(selectedConnection.name), 50)
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

  const activeConnections = connections.filter(
    (c) => c.state !== ConnectionState.Disconnected,
  )
  const disconnectedConnections = connections.filter(
    (c) => c.state === ConnectionState.Disconnected,
  )

  const renderConnection = (connection: Connection) => (
    <List.Item
      key={connection.name}
      id={connection.name}
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
  )

  return (
    <List
      selectedItemId={selectedId || undefined}
      onSelectionChange={setSelectedId}
      filtering={{ keepSectionOrder: true }}
    >
      <List.Section title="Active">
        {activeConnections.map(renderConnection)}
      </List.Section>
      <List.Section title="Disconnected">
        {disconnectedConnections.map(renderConnection)}
      </List.Section>
    </List>
  )
}
