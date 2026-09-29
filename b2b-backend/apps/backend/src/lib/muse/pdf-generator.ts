import { spawn } from "node:child_process"
import * as crypto from "node:crypto"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"

export interface GenerateQuotePdfResult {
  filePath: string
  storageKey: string
  checksum: string
}

export interface GenerateQuotePdfOptions {
  /**
   * Optional custom Python binary (defaults to PYTHON_BIN env var or 'python3')
   */
  pythonBin?: string
  /**
   * Optional custom path to generate-quote-pdf.py
   */
  scriptPath?: string
  /**
   * Optional base storage directory (defaults to /home/ubuntu/hackday26/storage)
   */
  storageBaseDir?: string
  /**
   * If true, pass JSON payload via stdin instead of temporary file
   */
  useStdin?: boolean
  /**
   * Process execution timeout in milliseconds (defaults to 30000)
   */
  timeoutMs?: number
}

const DEFAULT_PYTHON_BIN = process.env.PYTHON_BIN || "python3"
const DEFAULT_SCRIPT_PATH =
  process.env.GENERATE_QUOTE_PDF_SCRIPT ||
  "/home/ubuntu/hackday26/scripts/generate-quote-pdf.py"
const DEFAULT_STORAGE_BASE_DIR =
  process.env.STORAGE_BASE_DIR || "/home/ubuntu/hackday26/storage"
const DEFAULT_TIMEOUT_MS = 30000

interface WorkerQueueItem {
  resolve: (res: any) => void
  reject: (err: any) => void
  timeout: NodeJS.Timeout
}

let persistentWorker: ReturnType<typeof spawn> | null = null
let workerStdoutBuffer = ""
const workerQueue: WorkerQueueItem[] = []

function getOrCreateWorker(pythonBin: string, scriptPath: string): ReturnType<typeof spawn> {
  if (persistentWorker && !persistentWorker.killed && persistentWorker.exitCode === null) {
    return persistentWorker
  }

  workerStdoutBuffer = ""
  const child = spawn(pythonBin, [scriptPath, "--worker"], {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      PYTHONUNBUFFERED: "1",
    },
  })

  child.stdout?.on("data", (chunk: Buffer) => {
    workerStdoutBuffer += chunk.toString("utf8")
    let newlineIdx: number
    while ((newlineIdx = workerStdoutBuffer.indexOf("\n")) !== -1) {
      const line = workerStdoutBuffer.slice(0, newlineIdx).trim()
      workerStdoutBuffer = workerStdoutBuffer.slice(newlineIdx + 1)
      if (line === "READY" || line === "PONG" || !line) {
        continue
      }
      if (workerQueue.length > 0) {
        const item = workerQueue.shift()!
        clearTimeout(item.timeout)
        try {
          const parsed = JSON.parse(line)
          if (parsed.ok) {
            item.resolve(parsed)
          } else {
            item.reject(new Error(parsed.error || "Worker error"))
          }
        } catch (err: any) {
          item.reject(new Error(`Failed to parse worker output: ${line}`))
        }
      }
    }
  })

  child.on("error", () => {
    persistentWorker = null
  })

  child.on("close", () => {
    persistentWorker = null
    while (workerQueue.length > 0) {
      const item = workerQueue.shift()!
      clearTimeout(item.timeout)
      item.reject(new Error("Worker process closed unexpectedly"))
    }
  })

  persistentWorker = child
  return child
}

async function generateViaWorker(
  quoteData: any,
  targetFilePath: string,
  pythonBin: string,
  scriptPath: string,
  timeoutMs: number
): Promise<void> {
  const worker = getOrCreateWorker(pythonBin, scriptPath)
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      // Find and remove from queue
      const idx = workerQueue.findIndex((q) => q.resolve === resolve)
      if (idx !== -1) workerQueue.splice(idx, 1)
      reject(new Error(`Worker timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    workerQueue.push({ resolve, reject, timeout: timer })
    const payload = JSON.stringify({ data: quoteData, output: targetFilePath }) + "\n"
    worker.stdin?.write(payload)
  })
}

/**
 * Generates a preliminary quote PDF using the Python ReportLab engine.
 *
 * Requirements met:
 * 1. Exports generateQuotePdf(quoteData: any): Promise<{ filePath: string, storageKey: string, checksum: string }>
 * 2. Spawns python3 /home/ubuntu/hackday26/scripts/generate-quote-pdf.py passing quote data via temp JSON file or stdin.
 * 3. Target output: `/home/ubuntu/hackday26/storage/quotes/${quoteData.opaque_public_id}.pdf`.
 * 4. Verifies the file was created and is > 1000 bytes.
 * 5. Computes SHA-256 checksum of generated PDF.
 * 6. Returns absolute path, storageKey (relative to storage), and checksum.
 * 7. Handles errors gracefully (rejects with descriptive error if python fails).
 */
export async function generateQuotePdf(
  quoteData: any,
  options: GenerateQuotePdfOptions = {}
): Promise<GenerateQuotePdfResult> {
  // 1. Validate quoteData payload
  if (!quoteData || typeof quoteData !== "object") {
    throw new Error(
      "generateQuotePdf: Invalid quoteData argument; expected a non-null object"
    )
  }

  const rawOpaqueId = quoteData.opaque_public_id
  if (
    typeof rawOpaqueId !== "string" ||
    rawOpaqueId.trim().length === 0
  ) {
    throw new Error(
      "generateQuotePdf: quoteData.opaque_public_id is required and must be a non-empty string"
    )
  }

  const opaquePublicId = rawOpaqueId.trim()
  // Anti-traversal check on opaque_public_id to prevent writing outside target directory
  if (!/^[a-zA-Z0-9_-]+$/.test(opaquePublicId)) {
    throw new Error(
      `generateQuotePdf: quoteData.opaque_public_id contains invalid characters: "${opaquePublicId}"`
    )
  }

  // 2. Configure target paths and storage key
  const storageBaseDir = path.resolve(
    options.storageBaseDir || DEFAULT_STORAGE_BASE_DIR
  )
  const quotesDir = path.join(storageBaseDir, "quotes")
  const targetFileName = `${opaquePublicId}.pdf`
  const targetFilePath = path.join(quotesDir, targetFileName)
  const storageKey = `quotes/${targetFileName}`

  // Ensure storage/quotes directory exists
  await fs.promises.mkdir(quotesDir, { recursive: true })

  // 3. Resolve python script and executable
  const pythonBin = options.pythonBin || DEFAULT_PYTHON_BIN
  const scriptPath = path.resolve(options.scriptPath || DEFAULT_SCRIPT_PATH)
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  if (!fs.existsSync(scriptPath)) {
    throw new Error(
      `generateQuotePdf: Python script not found at expected path: "${scriptPath}"`
    )
  }

  // High-performance worker path: when using default script without custom stdin flag
  if (!options.useStdin && scriptPath === DEFAULT_SCRIPT_PATH) {
    try {
      await generateViaWorker(quoteData, targetFilePath, pythonBin, scriptPath, timeoutMs)

      if (fs.existsSync(targetFilePath)) {
        const fileStat = await fs.promises.stat(targetFilePath)
        if (fileStat.size > 1000) {
          const pdfBuffer = await fs.promises.readFile(targetFilePath)
          const checksum = crypto.createHash("sha256").update(pdfBuffer).digest("hex")
          return {
            filePath: path.resolve(targetFilePath),
            storageKey,
            checksum,
          }
        }
      }
    } catch {
      // Fallback to standard one-shot spawn below if worker encounters an error
    }
  }

  const jsonString = JSON.stringify(quoteData, null, 2)
  const useStdin = options.useStdin === true
  let tempFilePath: string | null = null

  try {
    const spawnArgs: string[] = [scriptPath]

    if (useStdin) {
      spawnArgs.push("-", targetFilePath)
    } else {
      const tempId = crypto.randomBytes(6).toString("hex")
      tempFilePath = path.join(
        os.tmpdir(),
        `quote_${opaquePublicId}_${Date.now()}_${tempId}.json`
      )
      await fs.promises.writeFile(tempFilePath, jsonString, "utf8")
      spawnArgs.push("-i", tempFilePath, "-o", targetFilePath)
    }

    // 4. Spawn Python process and capture outputs
    await new Promise<void>((resolve, reject) => {
      let isSettled = false

      const child = spawn(pythonBin, spawnArgs, {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        },
      })

      let stdoutText = ""
      let stderrText = ""

      child.stdout.on("data", (chunk: Buffer) => {
        stdoutText += chunk.toString("utf8")
      })

      child.stderr.on("data", (chunk: Buffer) => {
        stderrText += chunk.toString("utf8")
      })

      const timeoutTimer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true
          child.kill("SIGKILL")
          reject(
            new Error(
              `generateQuotePdf: Execution timed out after ${timeoutMs}ms while generating PDF for opaque_public_id "${opaquePublicId}". Stderr: ${stderrText.trim()}`
            )
          )
        }
      }, timeoutMs)

      child.on("error", (err: Error) => {
        if (!isSettled) {
          isSettled = true
          clearTimeout(timeoutTimer)
          reject(
            new Error(
              `generateQuotePdf: Failed to spawn Python binary "${pythonBin}": ${err.message}`
            )
          )
        }
      })

      child.on("close", (code: number | null, signal: NodeJS.Signals | null) => {
        if (!isSettled) {
          isSettled = true
          clearTimeout(timeoutTimer)

          if (code !== 0) {
            const detailMsg =
              stderrText.trim() ||
              stdoutText.trim() ||
              (signal ? `Killed by signal ${signal}` : `Exit code ${code}`)
            reject(
              new Error(
                `generateQuotePdf: Python PDF generator failed with exit code ${code}. Error: ${detailMsg}`
              )
            )
          } else {
            resolve()
          }
        }
      })

      if (useStdin) {
        child.stdin.write(jsonString, "utf8")
        child.stdin.end()
      } else {
        child.stdin.end()
      }
    })

    // 5. Verify the file was created and is > 1000 bytes
    if (!fs.existsSync(targetFilePath)) {
      throw new Error(
        `generateQuotePdf: Target PDF file was not created at expected location: "${targetFilePath}"`
      )
    }

    const fileStat = await fs.promises.stat(targetFilePath)
    if (fileStat.size <= 1000) {
      throw new Error(
        `generateQuotePdf: Generated PDF file size verification failed: size is ${fileStat.size} bytes (must be > 1000 bytes). File: "${targetFilePath}"`
      )
    }

    // 6. Compute SHA-256 checksum of generated PDF
    const pdfBuffer = await fs.promises.readFile(targetFilePath)
    const checksum = crypto.createHash("sha256").update(pdfBuffer).digest("hex")

    // 7. Return absolute path, storageKey (relative to storage), and checksum
    return {
      filePath: path.resolve(targetFilePath),
      storageKey,
      checksum,
    }
  } finally {
    // Clean up temporary JSON file if one was created
    if (tempFilePath) {
      try {
        await fs.promises.unlink(tempFilePath)
      } catch {
        // Silently ignore temp file cleanup failures
      }
    }
  }
}
