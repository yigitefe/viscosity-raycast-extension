import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { Connection, ConnectionState } from "./types"
import { connect, disconnect, getConnectionState } from "./scripts"
import { ActionTitles, ErrorMessages, Icons, StateMessages } from "./constants"
import { toggleFavorite } from "./utils"
import { useConnections } from "./useConnections"

export default function Command() {
  const { connections, isLoading, loadConnections, updateConnectionState } =
    useConnections()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const isConnectionActive = (connection: Connection) =>
    connection.state === ConnectionState.Connected

  const setConnectionState = (
    selectedConnection: Connection,
    state: ConnectionState,
  ) => {
    updateConnectionState(selectedConnection, state)
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

      if (isActive) await disconnect(selectedConnection.name)
      else await connect(selectedConnection.name)

      const finalState = await pollConnectionState(
        selectedConnection.name,
        isActive ? ConnectionState.Disconnected : ConnectionState.Connected,
      )

      if (finalState) {
        // When the "Reset network interfaces on disconnect" preference is enabled in Viscosity, all
        // connections are disconnected after the network interface is reset. For that reason we
        // fetch all the connections again to get the correct state for all connections.
        await loadConnections()

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

  const makeFavorite = async (connection: Connection) => {
    await toggleFavorite(connection.name)
    await loadConnections()
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

  const getActionTitle = (connection: Connection) => {
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
      onAction={loadConnections}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
    />
  )

  const renderConnection = (connection: Connection) => (
    <List.Item
      key={connection.name}
      id={connection.name}
      title={`${connection.isFavorite ? "⭐" : ""} ${connection.name}`}
      icon={getIcon(connection)}
      actions={
        <ActionPanel>
          <Action
            title={getActionTitle(connection)}
            onAction={() => handleSelect(connection)}
          />
          <Action
            title="Make Favorite"
            onAction={() => makeFavorite(connection)}
            shortcut={{ modifiers: ["cmd"], key: "f" }}
          />
          <RefreshAction />
        </ActionPanel>
      }
    />
  )

  return (
    <List
      isLoading={isLoading}
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
