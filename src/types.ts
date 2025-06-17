export type Connection = { name: string; state: string }

export enum ConnectionState {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
}
