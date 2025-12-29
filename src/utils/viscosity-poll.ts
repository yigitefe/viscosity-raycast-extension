import { ConnectionState } from "@/types"
import { getConnectionState, getConnectionNames } from "@/scripts"
import { poll } from "./poll"

export const pollConnectionState = async (
  name: string,
  targetState: ConnectionState,
): Promise<ConnectionState | null> => {
  return poll(
    () => getConnectionState(name),
    (state) => state === targetState,
  )
}

export const pollAllDisconnected = async (): Promise<boolean> => {
  const result = await poll(
    () => getConnectionNames(),
    (connections) =>
      connections.every((c) => c.state === ConnectionState.Disconnected),
  )
  return !!result
}
