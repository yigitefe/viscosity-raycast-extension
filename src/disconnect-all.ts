import { showToast, Toast } from "@raycast/api"
import { StateMessages } from "./constants"
import { disconnectAll } from "./scripts"

export default async function main() {
  try {
    await disconnectAll()
    await showToast({
      style: Toast.Style.Success,
      title: StateMessages.Disconnected,
    })
  } catch (e) {
    console.error(e)
  }
}
