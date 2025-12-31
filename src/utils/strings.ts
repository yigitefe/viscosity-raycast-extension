export const escape = (str: string) => {
  return str.replace(/\\/g, "\\\\")
}

export const isPermissionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : JSON.stringify(error)
  return message.includes("-1743")
}
