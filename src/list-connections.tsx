import { Action, ActionPanel, List, showToast, Toast } from '@raycast/api'
import { runAppleScript } from '@raycast/utils'
import getConnectionNames from './list-viscosity-connections'
import { useEffect, useState } from 'react'

export default function Command() {
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    const fetchConnections = async () => {
      const names = await getConnectionNames()
      setItems(names)
    }
    fetchConnections()
  }, [])

  const handleSelect = async (item: string) => {
    try {
      await runAppleScript(`
        tell application "Viscosity"
            connect "${item}"
        end tell
     `)
      await showToast({ style: Toast.Style.Success, title: 'Connected' })
    } catch (e) {
      console.error(e)
      await showToast({ style: Toast.Style.Failure, title: 'Error occurred' })
    }
  }

  return (
    <List>
      {items.map((item, index) => (
        <List.Item
          key={index}
          title={item}
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => handleSelect(item)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
