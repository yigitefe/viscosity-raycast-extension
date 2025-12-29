import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { Connection, ConnectionState } from "@/types"
import { connect, disconnect } from "@/scripts"
import { ActionTitle, Error, Message, SectionTitle } from "@/constants"
import { pollConnectionState } from "@/utils"
import { setQuickConnect } from "@/api/storage"
import { useConnections } from "@/useConnections"
import { ConnectionListItem } from "@/components/ConnectionListItem"

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
      await showToast({
        style: Toast.Style.Failure,
        title: Error.Generic,
      })
    }
  }

  const makeQuickConnect = async (connection: Connection) => {
    try {
      await setQuickConnect(connection.name)
      await loadConnections()
    } catch (e) {
      console.error(e)
      await showToast({
        style: Toast.Style.Failure,
        title: Error.Generic,
      })
    }
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
        {activeConnections.map((connection) => (
          <ConnectionListItem
            key={connection.name}
            connection={connection}
            onSelect={handleSelect}
            onQuickConnect={makeQuickConnect}
            onRefresh={loadConnections}
          />
        ))}
      </List.Section>
      <List.Section title={SectionTitle.Disconnected}>
        {disconnectedConnections.map((connection) => (
          <ConnectionListItem
            key={connection.name}
            connection={connection}
            onSelect={handleSelect}
            onQuickConnect={makeQuickConnect}
            onRefresh={loadConnections}
          />
        ))}
      </List.Section>
    </List>
  )
}
