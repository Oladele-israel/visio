import crypto from 'crypto'

const ALGO = 'aes-256-gcm'

export function createCrypto(keyHex: string) {
  if (!keyHex) {
    throw new Error('Missing encryption key')
  }
  const KEY = Buffer.from(keyHex, 'hex')

  function encrypt(plainText: string): string {
    if (typeof plainText !== 'string') {
      throw new TypeError(`encrypt expects a string but got ${typeof plainText}`)
    }

    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGO, KEY, iv)

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ])

    return JSON.stringify({
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    })
  }

  function decrypt(payload: string): string {
    if (typeof payload !== 'string') {
      throw new TypeError(`decrypt expects a string but got ${typeof payload}`)
    }

    let parsed: { iv: string; content: string; tag: string }
    try {
      parsed = JSON.parse(payload)
    } catch {
      throw new Error('Failed to parse encrypted payload JSON')
    }

    const { iv, content, tag } = parsed

    if (!iv || !content || !tag) {
      throw new Error('Invalid encrypted payload: missing iv, content or tag')
    }

    const decipher = crypto.createDecipheriv(
      ALGO,
      KEY,
      Buffer.from(iv, 'hex'),
    )

    decipher.setAuthTag(Buffer.from(tag, 'hex'))

    return (
      decipher.update(Buffer.from(content, 'hex'), undefined, 'utf8') +
      decipher.final('utf8')
    )
  }

  return { encrypt, decrypt }
}
