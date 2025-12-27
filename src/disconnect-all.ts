import { showToast, Toast } from "@raycast/api"
import { StateMessages } from "./constants"
import { disconnectAll } from "./scripts"
import { pollAllDisconnected } from "./utils"

export default async function main() {
  try {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: StateMessages.Disconnecting,
    })

    await disconnectAll()

    const finalState = await pollAllDisconnected()

    if (finalState) {
      toast.style = Toast.Style.Success
      toast.title = StateMessages.Disconnected
    }
  } catch (e) {
    console.error(e)
  }
}
