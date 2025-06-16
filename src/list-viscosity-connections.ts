import { showToast, Toast } from '@raycast/api'
import { runAppleScript } from '@raycast/utils'

export default async function getConnectionNames(): Promise<string[]> {
  try {
    const connectionNames: string = await runAppleScript(`
      tell application "Viscosity"
        set connectionNames to {}
        set connectionCount to count of connections

        repeat with i from 1 to connectionCount
          set connectionName to name of connection i
          set end of connectionNames to connectionName
        end repeat

        return connectionNames
      end tell
    `)
    return connectionNames.split(',').map((name) => name.trim())
  } catch (e) {
    console.error(e)
    await showToast({ style: Toast.Style.Failure, title: 'Error occurred' })
    return []
  }
}
