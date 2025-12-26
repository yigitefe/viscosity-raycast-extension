import { LocalStorage } from "@raycast/api"

const QUICK_CONNECT_KEY = "quickConnect"

export async function getQuickConnect(): Promise<string> {
  return (await LocalStorage.getItem<string>(QUICK_CONNECT_KEY)) ?? ""
}

export async function setQuickConnect(name: string) {
  await LocalStorage.setItem(QUICK_CONNECT_KEY, name)
}

export async function toggleQuickConnect(name: string) {
  const qc = await getQuickConnect()
  const newQC = qc === name ? "" : name
  await setQuickConnect(newQC)
  return newQC
}
