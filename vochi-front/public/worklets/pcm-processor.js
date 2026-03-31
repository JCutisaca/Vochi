/**
 * PCM processor para Vertex AI Gemini Live.
 *
 * Downsampleo con fase fraccional acumulada (resample remainder pattern).
 * Produce exactamente 16000 muestras por segundo independientemente del
 * sampleRate real del contexto (48000, 44100, etc.).
 */
class PcmProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        // ratio = cuántas muestras de entrada por cada muestra de salida
        // ej: 48000/16000 = 3.0, 44100/16000 = 2.75625
        this._ratio = sampleRate / 16000;
        // _phase acumula la fracción sobrante entre bloques de process()
        // Representa cuántas muestras de entrada quedan "pendientes" para la próxima salida
        this._phase = 0;
        this._outBuf = new Int16Array(1600);
        this._outLen = 0;
        this._rmsSumOut = 0;
        this.port.postMessage({ type: 'sampleRate', value: sampleRate, ratio: this._ratio });
    }

    process(inputs) {
        if (!inputs[0]?.length) return true;
        const input = inputs[0][0];
        const len = input.length;
        const ratio = this._ratio;
        let phase = this._phase;

        for (let i = 0; i < len; i++) {
            phase++;

            if (phase >= ratio) {
                phase -= ratio;

                // Muestra de salida = muestra actual (decimación simple, suficiente para voz)
                const s = input[i];
                const s16 = s < -1 ? -32768 : s > 1 ? 32767 : (s * 32768) | 0;
                this._outBuf[this._outLen++] = s16;
                this._rmsSumOut += s * s;

                if (this._outLen >= 1600) {
                    const rms = Math.sqrt(this._rmsSumOut / 1600);
                    this.port.postMessage(
                        { type: 'chunk', data: { int16arrayBuffer: this._outBuf.buffer }, rms },
                        [this._outBuf.buffer]
                    );
                    this._outBuf = new Int16Array(1600);
                    this._outLen = 0;
                    this._rmsSumOut = 0;
                }
            }
        }

        this._phase = phase;
        return true;
    }
}

registerProcessor('pcm-processor', PcmProcessor);
