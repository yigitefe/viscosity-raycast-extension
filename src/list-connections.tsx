import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useEffect, useState } from "react"
import { Connection, ConnectionState } from "./types"
import {
  connect,
  disconnect,
  getConnectionNames,
  getConnectionState,
} from "./scripts"
import { ActionTitles, ErrorMessages, Icons, StateMessages } from "./constants"

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

  const isConnectionActive = (connection: Connection) =>
    connection.state === ConnectionState.Connected

  const setConnectionState = (
    selectedConnection: Connection,
    state: ConnectionState,
  ) => {
    setConnections((prev) =>
      prev
        .map((c) => (c.name === selectedConnection.name ? { ...c, state } : c))
        .sort(compareConnections),
    )
    setTimeout(() => setSelectedId(selectedConnection.name), 50)
  }

  const handleSelect = async (selectedConnection: Connection) => {
    const isActive = isConnectionActive(selectedConnection)
    const actionMessage = isActive
      ? StateMessages.Disconnecting
      : StateMessages.Connecting

    try {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: actionMessage,
      })
      setConnectionState(selectedConnection, ConnectionState.Changing)

      isActive
        ? await disconnect(selectedConnection.name)
        : await connect(selectedConnection.name)

      const finalState = await pollConnectionState(
        selectedConnection.name,
        isActive ? ConnectionState.Disconnected : ConnectionState.Connected,
      )

      if (finalState) {
        // When the "Reset network interfaces on disconnect" preference is enabled in Viscosity, all
        // connections are disconnected after the network interface is reset. For that reason we
        // fetch all the connections again to get the correct state for all connections.
        await fetchConnections()

        toast.style = Toast.Style.Success
        toast.title =
          finalState === ConnectionState.Connected
            ? StateMessages.Connected
            : StateMessages.Disconnected
      }
    } catch (e) {
      console.error(e)
      await showToast({
        style: Toast.Style.Failure,
        title: ErrorMessages.Generic,
      })
    }
  }

  const pollConnectionState = async (
    name: string,
    targetState: ConnectionState,
  ): Promise<ConnectionState | null> => {
    for (let attempts = 0; attempts < 30; attempts++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const currentState = await getConnectionState(name)

      if (currentState === targetState) {
        return currentState
      }
    }
    return null
  }

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

  const RefreshAction = () => (
    <Action
      title="Refresh"
      onAction={() => fetchConnections()}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
    />
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
          <RefreshAction />
        </ActionPanel>
      }
    />
  )

  return (
    <List
      selectedItemId={selectedId || undefined}
      onSelectionChange={setSelectedId}
      filtering={{ keepSectionOrder: true }}
      actions={
        <ActionPanel>
          <RefreshAction />
        </ActionPanel>
      }
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
