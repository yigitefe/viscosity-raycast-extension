export enum ConnectionState {
  Connected = "Connected",
  Disconnected = "Disconnected",
}

export type Connection = { name: string; state: ConnectionState }
