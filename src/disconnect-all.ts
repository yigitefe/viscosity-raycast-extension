import { showToast, Toast } from "@raycast/api"
import { Message } from "./constants"
import { disconnectAll } from "./scripts"
import { pollAllDisconnected } from "./utils"

export default async function main() {
  try {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: Message.Disconnecting,
    })

    await disconnectAll()

    const finalState = await pollAllDisconnected()

    if (finalState) {
      toast.style = Toast.Style.Success
      toast.title = Message.Disconnected
    }
  } catch (e) {
    console.error(e)
  }
}
