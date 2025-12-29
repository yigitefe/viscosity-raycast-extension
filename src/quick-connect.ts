import { showToast, Toast } from "@raycast/api"
import { ConnectionState } from "@/types"
import { Message, Error } from "@/constants"
import { ConnectionService } from "@/services/connection"
import { pollConnectionState } from "@/utils"

export default async function main() {
  const primaryConnection = await ConnectionService.getPrimaryConnection()

  if (!primaryConnection) {
    await showToast({
      style: Toast.Style.Failure,
      title: "No connections found",
    })
    return
  }

  try {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: Message.Connecting,
    })

    await ConnectionService.connect(primaryConnection.name)

    const finalState = await pollConnectionState(
      primaryConnection.name,
      ConnectionState.Connected,
    )

    if (finalState) {
      toast.style = Toast.Style.Success
      toast.title = `${Message.Connected} to "${primaryConnection.name}"`
    } else {
      toast.style = Toast.Style.Failure
      toast.title = Error.Generic
    }
  } catch (e) {
    console.error(e)
    await showToast({
      style: Toast.Style.Failure,
      title: Error.Generic,
    })
  }
}
