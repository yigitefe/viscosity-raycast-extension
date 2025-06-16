import { Action, ActionPanel, List, showToast, Toast } from '@raycast/api'
import { runAppleScript } from '@raycast/utils'
import getConnectionNames, { Connection } from './list-viscosity-connections'
import { useEffect, useState } from 'react'

export default function Command() {
  const [connections, setConnections] = useState<Connection[]>([])
  useEffect(() => {
    const fetchConnections = async () => {
      setConnections(await getConnectionNames())
    }
    fetchConnections()
  }, [getConnectionNames])

  const handleSelect = async (selectedConnection: Connection) => {
    try {
      await runAppleScript(`
        tell application "Viscosity"
            connect "${selectedConnection.name}"
        end tell
     `)
      setConnections(
        connections.map((c) =>
          c === selectedConnection ? { ...c, state: 'Connected' } : c,
        ),
      )
      await showToast({ style: Toast.Style.Success, title: 'Connected' })
    } catch (e) {
      console.error(e)
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
