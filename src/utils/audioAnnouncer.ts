/**
 * Web Audio API synthesizer for PTSP calling chime and Web Speech API Indonesian speech
 */

function playChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        resolve();
        return;
      }
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Classic two-tone or four-tone airport/counter chime (Do - Mi - Sol - Do)
      playTone(523.25, 0, 0.4);      // C5
      playTone(659.25, 0.25, 0.4);   // E5
      playTone(783.99, 0.5, 0.4);    // G5
      playTone(1046.50, 0.75, 0.8);  // C6

      setTimeout(() => {
        resolve();
      }, 1200);
    } catch {
      resolve();
    }
  });
}

export async function announceTicket(ticketNumber: string, loketName: string, guestName?: string) {
  await playChime();

  if (!('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  // Spell ticket number naturally in Indonesian: "A - Kosong Satu Dua" or "A dua belas"
  const formattedTicket = ticketNumber
    .split('')
    .map((char) => {
      if (char === '-') return ' ';
      return char;
    })
    .join(' ');

  const textToSpeak = `Nomor antrean ${formattedTicket}. Atas nama ${guestName || 'Bapak atau Ibu'}. Silakan menuju ke ${loketName}. Terima kasih.`;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = 'id-ID';
  utterance.rate = 0.9; // natural, clear pacing
  utterance.pitch = 1.05;

  // Attempt to select an Indonesian voice if available
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find((v) => v.lang.toLowerCase().includes('id') || v.lang.toLowerCase().includes('indonesia'));
  if (idVoice) {
    utterance.voice = idVoice;
  }

  window.speechSynthesis.speak(utterance);
}
