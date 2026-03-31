"use client";

const INPUT_SAMPLE_RATE = 16000;
export const LIVE_AUDIO_SAMPLE_RATE = 24000;

function convertFloat32ToPcm16(samples: Float32Array) {
  const pcm16 = new Int16Array(samples.length);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    pcm16[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return pcm16;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export async function convertBlobToPcm16Base64(blob: Blob) {
  const encodedAudio = await blob.arrayBuffer();
  const decodeContext = new AudioContext();

  try {
    const audioBuffer = await decodeContext.decodeAudioData(encodedAudio);
    const frameCount = Math.max(
      1,
      Math.round(audioBuffer.duration * INPUT_SAMPLE_RATE),
    );
    const offlineContext = new OfflineAudioContext(
      1,
      frameCount,
      INPUT_SAMPLE_RATE,
    );
    const source = offlineContext.createBufferSource();

    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    const pcm16 = convertFloat32ToPcm16(renderedBuffer.getChannelData(0));

    return bytesToBase64(new Uint8Array(pcm16.buffer));
  } finally {
    void decodeContext.close();
  }
}

function base64ToBytes(base64: string) {
  const normalized = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function createWavBlobFromPcm16(
  pcmBytes: Uint8Array,
  sampleRate: number = LIVE_AUDIO_SAMPLE_RATE,
) {
  const header = new ArrayBuffer(44);
  const audioBytes = Uint8Array.from(pcmBytes);
  const view = new DataView(header);
  const channels = 1;
  const bitsPerSample = 16;
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmBytes.byteLength, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, pcmBytes.byteLength, true);

  return new Blob([header, audioBytes], { type: "audio/wav" });
}

export function convertPcm16Base64ToWavUrl(
  base64: string,
  sampleRate: number = LIVE_AUDIO_SAMPLE_RATE,
) {
  return URL.createObjectURL(
    createWavBlobFromPcm16(base64ToBytes(base64), sampleRate),
  );
}

export function convertPcm16BytesToWavUrl(
  bytes: Uint8Array,
  sampleRate: number = LIVE_AUDIO_SAMPLE_RATE,
) {
  return URL.createObjectURL(createWavBlobFromPcm16(bytes, sampleRate));
}

export function convertPcm16BytesToFloat32(bytes: Uint8Array) {
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const samples = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    const lower = bytes[index * 2] ?? 0;
    const upper = bytes[index * 2 + 1] ?? 0;
    let sample = (upper << 8) | lower;

    if (sample >= 0x8000) {
      sample -= 0x10000;
    }

    samples[index] = sample / 0x8000;
  }

  return samples;
}

export function convertPcm16Base64ToFloat32(base64: string) {
  return convertPcm16BytesToFloat32(base64ToBytes(base64));
}
