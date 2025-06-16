import { showToast, Toast } from '@raycast/api'
import { runAppleScript } from '@raycast/utils'

export type Connection = { name: string; state: string }

export default async function getConnectionNames(): Promise<Connection[]> {
  try {
    const connectionNames: string = await runAppleScript(`
      tell application "Viscosity"
        set connectionCount to count of connections
        set resultList to {}

        repeat with i from 1 to connectionCount
          set connectionName to name of connection i
          set connectionState to state of connection i
          set end of resultList to connectionName & "||" & connectionState
        end repeat

        return resultList
      end tell
    `)
    return connectionNames.split(',').map((cn) => {
      const [name, state] = cn.trim().split('||')
      return { name, state }
    })
  } catch (e) {
    console.error(e)
    await showToast({ style: Toast.Style.Failure, title: 'Error occurred' })
    return []
  }
}
