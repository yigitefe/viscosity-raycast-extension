import { ConnectionState } from "@/types"
import { getConnectionNames, getConnectionState } from "@/api/viscosity"

export async function poll<T>(
  fn: () => Promise<T>,
  validate: (result: T) => boolean,
  interval = 1000,
  maxAttempts = 30,
): Promise<T | null> {
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    await new Promise((resolve) => setTimeout(resolve, interval))
    const result = await fn()

    if (validate(result)) {
      return result
    }
  }
  return null
}

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
