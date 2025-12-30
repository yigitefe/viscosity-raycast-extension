import { showToast, Toast } from "@raycast/api"
import { Message, Error } from "@/constants"
import {
  getActiveConnections,
  disconnectAll,
  waitForAllDisconnected,
} from "@/api/viscosity"

export default async function main() {
  try {
    const activeConnections = await getActiveConnections()

    if (activeConnections.length === 0) {
      await showToast({
        style: Toast.Style.Success,
        title: Message.NoActiveConnections,
      })
      return
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: Message.Disconnecting,
    })

    await disconnectAll()

    const finalState = await waitForAllDisconnected()

    if (finalState) {
      toast.style = Toast.Style.Success
      toast.title = Message.Disconnected
    }
  } catch (e) {
    console.error(e)
    await showToast({
      style: Toast.Style.Failure,
      title: Error.Generic,
    })
  }
}
