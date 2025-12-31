import { Action, Icon } from "@raycast/api"
import { Connection, ConnectionState } from "@/types"
import { ActionTitle } from "@/constants"

export function RefreshAction({ onAction }: { onAction: () => void }) {
  return (
    <Action
      title={ActionTitle.Refresh}
      icon={Icon.Repeat}
      onAction={onAction}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
    />
  )
}

export function ConnectionAction({
  connection,
  onAction,
}: {
  connection: Connection
  onAction: (connection: Connection) => void
}) {
  const isConnectionActive = connection.state === ConnectionState.Connected
  return (
    <Action
      title={isConnectionActive ? ActionTitle.Disconnect : ActionTitle.Connect}
      icon={isConnectionActive ? Icon.XMarkCircle : Icon.Circle}
      onAction={() => onAction(connection)}
    />
  )
}

export function QuickConnectAction({
  connection,
  onAction,
}: {
  connection: Connection
  onAction: (connection: Connection) => void
}) {
  return (
    <Action
      title={
        connection.isQuickConnect
          ? ActionTitle.RemoveQuickConnect
          : ActionTitle.MakeQuickConnect
      }
      icon={connection.isQuickConnect ? Icon.BoltDisabled : Icon.Bolt}
      onAction={() => onAction(connection)}
      shortcut={{ modifiers: ["shift", "cmd"], key: "q" }}
    />
  )
}
