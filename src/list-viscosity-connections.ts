import * as fs from 'fs'
import * as path from 'path'
import os from 'os'

const rootDir = path.join(
  os.homedir(),
  '/Library/Application Support/Viscosity/OpenVPN',
)

function extractViscosityName(configContent: string): string | null {
  const match = configContent.match(/#viscosity name (.+)/)
  return match ? match[1].trim() : null
}

function processConfigFile(configPath: string): string | null {
  try {
    const content = fs.readFileSync(configPath, 'utf8')
    return extractViscosityName(content)
  } catch (error) {
    console.error(`Error reading ${configPath}:`, error)
    return null
  }
}

export function getConnectionNames() {
  const subdirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const names: string[] = []

  subdirs.forEach((dir) => {
    const configPath = path.join(rootDir, dir, 'config.conf')
    if (fs.existsSync(configPath)) {
      const name = processConfigFile(configPath)
      if (name) {
        names.push(name)
      }
    }
  })

  return names
}
