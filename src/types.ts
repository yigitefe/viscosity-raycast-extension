export enum ConnectionState {
  Changing = "Changing",
  Connected = "Connected",
  Disconnected = "Disconnected",
}

export type Connection = { name: string; state: ConnectionState }
