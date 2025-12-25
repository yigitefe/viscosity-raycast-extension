import raycastConfig from "@raycast/eslint-config"

export default [
  ...raycastConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
].flat()
