import { ActionPanel, List, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { Connection, ConnectionState } from "@/types"
import { connect, disconnect, waitForConnectionState } from "@/api/viscosity"
import { Error, Message, SectionTitle } from "@/constants"
import { setQuickConnect } from "@/api/storage"
import { useConnections } from "@/hooks/use-connections"
import { ConnectionListItem } from "@/components/connection-list-item"
import { RefreshAction } from "@/components/actions"
import { showErrorToast } from "@/utils"

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

      const finalState = await waitForConnectionState(
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
      await showErrorToast(e)
    }
  }

  const makeQuickConnect = async (connection: Connection) => {
    try {
      await setQuickConnect(connection.name)
      await loadConnections()
    } catch (e) {
      console.error(e)
      await showErrorToast(e)
    }
  }

  const activeConnections = connections.filter(
    (c) => c.state !== ConnectionState.Disconnected,
  )
  const disconnectedConnections = connections.filter(
    (c) => c.state === ConnectionState.Disconnected,
  )

  const renderConnection = (connection: Connection) => (
    <ConnectionListItem
      key={connection.name}
      connection={connection}
      onSelect={handleSelect}
      onQuickConnect={makeQuickConnect}
      onRefresh={loadConnections}
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
          <RefreshAction onAction={loadConnections} />
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
