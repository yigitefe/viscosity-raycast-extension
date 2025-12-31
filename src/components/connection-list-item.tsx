import { Action, ActionPanel, Icon, List } from "@raycast/api"
import { Connection, ConnectionState } from "@/types"
import { ActionTitle, Icons, Tooltip } from "@/constants"

interface ConnectionListItemProps {
  connection: Connection
  onSelect: (connection: Connection) => void
  onQuickConnect: (connection: Connection) => void
  onRefresh: () => void
}

export function ConnectionListItem({
  connection,
  onSelect,
  onQuickConnect,
  onRefresh,
}: ConnectionListItemProps) {
  const isConnectionActive = connection.state === ConnectionState.Connected

  const getIcon = () => {
    switch (connection.state) {
      case ConnectionState.Connected:
        return Icons.Connected
      case ConnectionState.Disconnected:
        return Icons.Disconnected
      default:
        return Icons.Changing
    }
  }

  return (
    <List.Item
      id={connection.name}
      title={connection.name}
      icon={{ source: getIcon() }}
      accessories={
        connection.isQuickConnect
          ? [
              {
                icon: Icon.Bolt,
                tooltip: Tooltip.QuickConnectAccessory,
              },
            ]
          : []
      }
      actions={
        <ActionPanel>
          <Action
            title={
              isConnectionActive ? ActionTitle.Disconnect : ActionTitle.Connect
            }
            icon={isConnectionActive ? Icon.XMarkCircle : Icon.Circle}
            onAction={() => onSelect(connection)}
          />
          <Action
            title={
              connection.isQuickConnect
                ? ActionTitle.RemoveQuickConnect
                : ActionTitle.MakeQuickConnect
            }
            icon={connection.isQuickConnect ? Icon.BoltDisabled : Icon.Bolt}
            onAction={() => onQuickConnect(connection)}
            shortcut={{ modifiers: ["shift", "cmd"], key: "q" }}
          />
          <Action
            title={ActionTitle.Refresh}
            icon={Icon.Repeat}
            onAction={onRefresh}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    />
  )
}
