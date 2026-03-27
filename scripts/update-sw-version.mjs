import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const swPath = join(__dirname, '../public/sw.js')

const buildId = Date.now().toString(36)
const content = readFileSync(swPath, 'utf-8')
const updated = content.replace(
  /const CACHE_VERSION = '[^']*'/,
  `const CACHE_VERSION = '${buildId}'`
)
writeFileSync(swPath, updated)
console.log(`✓ sw.js CACHE_VERSION → ${buildId}`)
