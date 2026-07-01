import { describe, expect, test } from 'vitest'

describe('Native Gzip Streams Utility', () => {
  test('should compress and decompress string bytes using Gzip streams', async () => {
    const text = 'Hello, Toolify Gzip native streams test!'
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    
    const sourceBytes = encoder.encode(text)

    // Compress
    const compStream = new CompressionStream('gzip')
    const writer = compStream.writable.getWriter()
    writer.write(sourceBytes)
    writer.close()

    const compResponse = new Response(compStream.readable)
    const compBlob = await compResponse.blob()
    
    expect(compBlob.size).toBeGreaterThan(0)

    // Decompress
    const decompStream = new DecompressionStream('gzip')
    const decompWriter = decompStream.writable.getWriter()
    decompWriter.write(new Uint8Array(await compBlob.arrayBuffer()))
    decompWriter.close()

    const decompResponse = new Response(decompStream.readable)
    const decompBytes = await decompResponse.arrayBuffer()
    const resultText = decoder.decode(decompBytes)

    expect(resultText).toBe(text)
  })
})
