import { ConnectionState } from "@/types"
import { ConnectionService } from "@/services/connection"
import { poll } from "./poll"

export const pollConnectionState = async (
  name: string,
  targetState: ConnectionState,
): Promise<ConnectionState | null> => {
  return poll(
    () => ConnectionService.getConnectionState(name),
    (state) => state === targetState,
  )
}

export const pollAllDisconnected = async (): Promise<boolean> => {
  const result = await poll(
    () => ConnectionService.getConnectionNames(),
    (connections) =>
      connections.every((c) => c.state === ConnectionState.Disconnected),
  )
  return !!result
}
