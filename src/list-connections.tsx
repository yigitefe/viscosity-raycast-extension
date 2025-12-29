import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { Connection, ConnectionState } from "./types"
import { connect, disconnect } from "./scripts"
import {
  ActionTitle,
  Error,
  Icons,
  Message,
  SectionTitle,
  Tooltip,
} from "./constants"
import { pollConnectionState, setQuickConnect } from "./utils"
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
    const actionMessage = isActive ? Message.Disconnecting : Message.Connecting

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

      // When the "Reset network interfaces on disconnect" preference is enabled in Viscosity, all
      // connections are disconnected after the network interface is reset. For that reason we
      // fetch all the connections again to get the correct state for all connections.
      await loadConnections()

      if (finalState) {
        toast.style = Toast.Style.Success
        toast.title =
          finalState === ConnectionState.Connected
            ? Message.Connected
            : Message.Disconnected
      } else {
        toast.style = Toast.Style.Failure
        toast.title = Error.Generic
      }
    } catch (e) {
      console.error(e)
    }
  }

  const makeQuickConnect = async (connection: Connection) => {
    await setQuickConnect(connection.name)
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
      ? ActionTitle.Disconnect
      : ActionTitle.Connect
  }

  const activeConnections = connections.filter(
    (c) => c.state !== ConnectionState.Disconnected,
  )
  const disconnectedConnections = connections.filter(
    (c) => c.state === ConnectionState.Disconnected,
  )

  const RefreshAction = () => (
    <Action
      title={ActionTitle.Refresh}
      onAction={loadConnections}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
    />
  )

  const renderConnection = (connection: Connection) => (
    <List.Item
      key={connection.name}
      id={connection.name}
      title={connection.name}
      icon={{ source: getIcon(connection) }}
      accessories={
        connection.isQuickConnect
          ? [
              {
                icon: Icons.QuickConnect,
                tooltip: Tooltip.QuickConnectAccessory,
              },
            ]
          : []
      }
      actions={
        <ActionPanel>
          <Action
            title={getActionTitle(connection)}
            onAction={() => handleSelect(connection)}
          />
          <Action
            title={
              connection.isQuickConnect
                ? ActionTitle.RemoveQuickConnect
                : ActionTitle.MakeQuickConnect
            }
            onAction={() => makeQuickConnect(connection)}
            shortcut={{ modifiers: ["shift", "cmd"], key: "q" }}
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
      <List.Section title={SectionTitle.Active}>
        {activeConnections.map(renderConnection)}
      </List.Section>
      <List.Section title={SectionTitle.Disconnected}>
        {disconnectedConnections.map(renderConnection)}
      </List.Section>
    </List>
  )
}
