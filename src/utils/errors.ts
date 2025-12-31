import { showToast, Toast } from "@raycast/api"
import { Error as ErrorMessage } from "@/constants"

export const isPermissionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : JSON.stringify(error)
  return message.includes("-1743")
}

export const showErrorToast = async (error: unknown) => {
  await showToast({
    style: Toast.Style.Failure,
    title: isPermissionError(error) ? ErrorMessage.Permissions : ErrorMessage.Generic,
  })
}
