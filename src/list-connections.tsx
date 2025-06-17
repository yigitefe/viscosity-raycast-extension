import { Action, ActionPanel, List, showToast, Toast } from '@raycast/api'
import { useEffect, useState } from 'react'
import { Connection, ConnectionState } from './types'
import { connect, getConnectionNames } from './scripts'

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

  const handleSelect = async (selectedConnection: Connection) => {
    try {
      await connect(selectedConnection.name)
      setConnectionState(selectedConnection, ConnectionState.Connected)
      await showToast({
        style: Toast.Style.Success,
        title: ConnectionState.Connected,
      })
    } catch (e) {
      console.error(e)
      setConnectionState(selectedConnection, ConnectionState.Disconnected)
      await showToast({ style: Toast.Style.Failure, title: 'Error occurred' })
    }
  }

  return (
    <List>
      {connections.map((connection, index) => (
        <List.Item
          key={index}
          title={connection.name}
          icon={connection.state === 'Connected' ? '🟢' : '🔴'}
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
