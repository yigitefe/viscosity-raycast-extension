import { showToast, Toast } from "@raycast/api"
import { ConnectionState } from "@/types"
import { Message, Error, StorageKeys } from "@/constants"
import {
  getConnectionNames,
  connect,
  waitForConnectionState,
} from "@/api/viscosity"
import { getStorageValue } from "@/api/storage"
import { sortConnections } from "@/utils"

export default async function main() {
  const [rawConnections, quickConnect] = await Promise.all([
    getConnectionNames(),
    getStorageValue(StorageKeys.QuickConnect),
  ])
  const primaryConnection = sortConnections(rawConnections, quickConnect)[0]

  if (!primaryConnection) {
    await showToast({
      style: Toast.Style.Failure,
      title: Error.NoConnections,
    })
    return
  }

  try {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: Message.Connecting,
    })

    await connect(primaryConnection.name)

    const finalState = await waitForConnectionState(
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
