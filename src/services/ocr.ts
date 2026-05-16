import Tesseract from 'tesseract.js'

interface OcrResult {
  text: string
  positionName?: string
  companyName?: string
  jobDescription: string
  rawText: string
}

// 从 OCR 识别的原始文本中提取结构化信息
function extractFields(rawText: string): { positionName?: string; companyName?: string; jobDescription: string } {
  const lines = rawText.split('\n').filter((l) => l.trim())

  let positionName: string | undefined
  let companyName: string | undefined

  // 尝试通过常见关键词定位岗位名和公司名
  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim()
    if (!positionName && /岗位|职位|Title|Job/i.test(trimmed)) {
      // 取后一行或冒号后的内容
      const after = trimmed.split(/[：:]/).pop()?.trim()
      if (after && after.length > 1 && after.length < 40) positionName = after
    }
    if (!companyName && /公司|Company|企业|集团/i.test(trimmed)) {
      const after = trimmed.split(/[：:]/).pop()?.trim()
      if (after && after.length > 1 && after.length < 30) companyName = after
    }
  }

  // 如果未通过关键词找到，尝试取前几行作为岗位名
  if (!positionName && lines.length > 0) {
    const candidate = lines.slice(0, 5).find((l) => l.trim().length > 2 && l.trim().length < 40)
    if (candidate) positionName = candidate.trim()
  }

  return {
    positionName,
    companyName,
    jobDescription: rawText,
  }
}

export async function recognizeImage(
  imageData: string,
  onProgress?: (progress: number, status: string) => void
): Promise<OcrResult> {
  const worker = await Tesseract.createWorker('chi_sim+eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress?.(m.progress * 100, '识别中...')
      } else if (m.status === 'loading language traineddata') {
        onProgress?.(Math.min(m.progress * 100, 99), '加载模型...')
      }
    },
  })

  try {
    const { data } = await worker.recognize(imageData)
    const rawText = data.text
    const fields = extractFields(rawText)

    return {
      text: rawText,
      ...fields,
      rawText,
    }
  } finally {
    await worker.terminate()
  }
}

export { type OcrResult }
