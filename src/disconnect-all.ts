import { showToast, Toast } from "@raycast/api"
import { runAppleScript } from "@raycast/utils"

export default async function main() {
  try {
    await runAppleScript('tell application "Viscosity" to disconnectall')
    await showToast({ style: Toast.Style.Success, title: "Disconnected" })
  } catch (e) {
    console.error(e)
    await showToast({ style: Toast.Style.Failure, title: "Error occurred" })
  }
}
