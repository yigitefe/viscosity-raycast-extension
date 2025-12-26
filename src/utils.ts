import { LocalStorage } from "@raycast/api"

const FAVORITE_KEY = "favorite"

export async function getFavorite(): Promise<string> {
  return (await LocalStorage.getItem<string>(FAVORITE_KEY)) ?? ""
}

export async function setFavorite(fav: string) {
  await LocalStorage.setItem(FAVORITE_KEY, fav)
}

export async function toggleFavorite(name: string) {
  const fav = await getFavorite()
  const next = fav === name ? "" : name
  await setFavorite(next)
  return next
}
