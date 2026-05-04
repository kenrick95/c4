#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isWindows = process.platform === 'win32'

function spawnAsync(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    let proc
    if (isWindows) {
      // .cmd files require cmd.exe which may not be accessible; use powershell.exe
      // (a real .exe) to run yarn/npx instead
      const escapedArgs = args.map((a) => `"${a.replace(/"/g, '""')}"`)
      proc = spawn(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `& ${cmd} ${escapedArgs.join(' ')}`,
        ],
        { ...options, stdio: ['ignore', 'pipe', 'pipe'] },
      )
    } else {
      proc = spawn(cmd, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] })
    }
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d) => {
      console.log(d.toString())
      stdout += d.toString()
    })
    proc.stderr.on('data', (d) => {
      console.error(d.toString())
      stderr += d.toString()
    })
    proc.on('close', (code) => {
      if (code !== 0)
        reject(
          Object.assign(new Error(stderr || `exited with code ${code}`), {
            stdout,
            stderr,
          }),
        )
      else resolve({ stdout, stderr })
    })
    proc.on('error', reject)
  })
}

async function main() {
  // Pack the package using `yarn pack`; "prepack" will run and it will build the files (generating dist folder and create a c4.tgz file)
  await spawnAsync('yarn', ['pack', '--filename', 'c4.tgz'], {
    cwd: path.resolve(__dirname),
  })
  const tarballPath = path.resolve(__dirname, 'c4.tgz')

  // Check using attw
  await spawnAsync('yarn', ['attw', tarballPath])

  // Clean up the tarball
  fs.unlinkSync(tarballPath)
}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
