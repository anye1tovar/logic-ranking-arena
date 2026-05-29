import type { ViewerSoundEvent, ViewerSoundType } from "./types";
import championSoundUrl from "../../../app/assets/audio/champion-sound.mp3";
import classifiedSoundUrl from "../../../app/assets/audio/classified-sound.mp3";
import eliminatedSoundUrl from "../../../app/assets/audio/eliminated-sound.mp3";
import winSoundUrl from "../../../app/assets/audio/win-sound.mp3";

type SoundStep = {
	frequency: number;
	duration: number;
	type?: OscillatorType;
	gain?: number;
};

const SOUND_PATTERNS: Record<ViewerSoundType, SoundStep[]> = {
	pointGain: [
		{ frequency: 660, duration: 0.08, type: "sine" },
		{ frequency: 880, duration: 0.11, type: "sine" },
	],
	pointLoss: [
		{ frequency: 360, duration: 0.1, type: "triangle" },
		{ frequency: 240, duration: 0.16, type: "triangle" },
	],
	win: [
		{ frequency: 440, duration: 0.06, type: "square", gain: 0.06 },
		{ frequency: 660, duration: 0.07, type: "square", gain: 0.065 },
		{ frequency: 880, duration: 0.08, type: "triangle", gain: 0.07 },
		{ frequency: 1174.66, duration: 0.18, type: "sine", gain: 0.075 },
	],
	classified: [
		{ frequency: 493.88, duration: 0.09, type: "triangle", gain: 0.055 },
		{ frequency: 659.25, duration: 0.09, type: "triangle", gain: 0.06 },
		{ frequency: 987.77, duration: 0.12, type: "sine", gain: 0.07 },
		{ frequency: 1318.51, duration: 0.22, type: "sine", gain: 0.06 },
	],
	eliminated: [
		{ frequency: 392, duration: 0.07, type: "sawtooth", gain: 0.055 },
		{ frequency: 293.66, duration: 0.1, type: "sawtooth", gain: 0.052 },
		{ frequency: 220, duration: 0.14, type: "triangle", gain: 0.046 },
		{ frequency: 146.83, duration: 0.26, type: "sine", gain: 0.04 },
	],
	champion: [
		{ frequency: 523.25, duration: 0.1, type: "sine", gain: 0.06 },
		{ frequency: 659.25, duration: 0.1, type: "sine", gain: 0.065 },
		{ frequency: 783.99, duration: 0.12, type: "triangle", gain: 0.07 },
		{ frequency: 1046.5, duration: 0.16, type: "triangle", gain: 0.08 },
		{ frequency: 1318.51, duration: 0.22, type: "sine", gain: 0.075 },
		{ frequency: 1567.98, duration: 0.32, type: "sine", gain: 0.07 },
	],
	newPlayer: [
		{ frequency: 440, duration: 0.09, type: "triangle" },
		{ frequency: 660, duration: 0.14, type: "triangle" },
	],
	moveUp: [
		{ frequency: 500, duration: 0.07, type: "sine", gain: 0.045 },
		{ frequency: 700, duration: 0.09, type: "sine", gain: 0.045 },
	],
	moveDown: [
		{ frequency: 420, duration: 0.07, type: "sine", gain: 0.04 },
		{ frequency: 300, duration: 0.1, type: "sine", gain: 0.04 },
	],
	reset: [
		{ frequency: 300, duration: 0.08, type: "triangle", gain: 0.045 },
		{ frequency: 420, duration: 0.08, type: "triangle", gain: 0.045 },
		{ frequency: 300, duration: 0.12, type: "triangle", gain: 0.045 },
	],
};

const SOUND_ASSET_URLS: Partial<Record<ViewerSoundType, string>> = {
	win: winSoundUrl,
	classified: classifiedSoundUrl,
	eliminated: eliminatedSoundUrl,
	champion: championSoundUrl,
};

const SOUND_ASSET_FALLBACK_DURATIONS: Partial<Record<ViewerSoundType, number>> = {
	win: 1.6,
	classified: 1.3,
	eliminated: 1.1,
	champion: 2.2,
};

const SOUND_PRIORITY: ViewerSoundType[] = [
	"reset",
	"champion",
	"classified",
	"win",
	"pointGain",
	"pointLoss",
	"eliminated",
	"newPlayer",
	"moveUp",
	"moveDown",
];

let audioContext: AudioContext | null = null;
let audioUnlocked = false;
let audioAssets: Partial<Record<ViewerSoundType, HTMLAudioElement>> = {};

const getAudioContext = () => {
	if (typeof window === "undefined") return null;

	const AudioContextConstructor =
		window.AudioContext ??
		(window as typeof window & { webkitAudioContext?: typeof AudioContext })
			.webkitAudioContext;

	if (!AudioContextConstructor) return null;

	audioContext ??= new AudioContextConstructor();
	return audioContext;
};

const hasAudioAsset = (type: ViewerSoundType) => type in SOUND_ASSET_URLS;

const getAudioAsset = (type: ViewerSoundType) => {
	if (typeof window === "undefined" || typeof Audio === "undefined") return null;

	const src = SOUND_ASSET_URLS[type];
	if (!src) return null;

	const cached = audioAssets[type];
	if (cached) return cached;

	const audio = new Audio(src);
	audio.preload = "auto";
	audioAssets[type] = audio;
	return audio;
};

const patternDuration = (pattern: SoundStep[]) =>
	pattern.reduce((duration, step) => duration + step.duration + 0.025, 0);

const soundDuration = (type: ViewerSoundType) => {
	const audio = hasAudioAsset(type) ? getAudioAsset(type) : null;
	if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
		return audio.duration;
	}

	if (hasAudioAsset(type)) {
		return SOUND_ASSET_FALLBACK_DURATIONS[type] ?? 1.2;
	}

	return patternDuration(SOUND_PATTERNS[type]);
};

const playPattern = (
	context: AudioContext,
	pattern: SoundStep[],
	startTime: number,
) => {
	let cursor = startTime;

	pattern.forEach((step) => {
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		const attackEnd = cursor + 0.015;
		const releaseStart = Math.max(attackEnd, cursor + step.duration - 0.04);
		const end = cursor + step.duration;

		oscillator.type = step.type ?? "sine";
		oscillator.frequency.setValueAtTime(step.frequency, cursor);
		gain.gain.setValueAtTime(0.0001, cursor);
		gain.gain.exponentialRampToValueAtTime(step.gain ?? 0.06, attackEnd);
		gain.gain.setValueAtTime(step.gain ?? 0.06, releaseStart);
		gain.gain.exponentialRampToValueAtTime(0.0001, end);

		oscillator.connect(gain);
		gain.connect(context.destination);
		oscillator.start(cursor);
		oscillator.stop(end + 0.01);

		cursor = end + 0.025;
	});
};

const playAudioAsset = (type: ViewerSoundType) => {
	const audio = getAudioAsset(type);
	if (!audio) return false;

	try {
		const instance = audio.cloneNode(true);
		if (
			!instance ||
			typeof (instance as HTMLAudioElement).play !== "function"
		) {
			return false;
		}

		const playableInstance = instance as HTMLAudioElement;
		playableInstance.currentTime = 0;
		void playableInstance.play().catch(() => {
			// Asset playback is best-effort; fallback tones remain available.
		});
		return true;
	} catch {
		return false;
	}
};

export const enableViewerActionSounds = async () => {
	try {
		Object.keys(SOUND_ASSET_URLS).forEach((type) => {
			getAudioAsset(type as ViewerSoundType)?.load();
		});

		const context = getAudioContext();
		if (!context && Object.keys(SOUND_ASSET_URLS).length === 0) return false;

		if (context) {
			await context.resume();
			audioUnlocked = context.state !== "suspended";
		} else {
			audioUnlocked = true;
		}

		if (
			audioUnlocked &&
			context &&
			typeof context.createOscillator === "function" &&
			typeof context.createGain === "function"
		) {
			playPattern(
				context,
				SOUND_PATTERNS.newPlayer,
				context.currentTime + 0.01,
			);
		}

		return audioUnlocked;
	} catch {
		return false;
	}
};

export const playViewerActionSounds = (events: ViewerSoundEvent[]) => {
	if (events.length === 0 || !audioUnlocked) return;

	try {
		const context = getAudioContext();

		const runPlayback = () => {
			const orderedEvents = [...events].sort(
				(first, second) =>
					SOUND_PRIORITY.indexOf(first.type) -
					SOUND_PRIORITY.indexOf(second.type),
			);
			let cursor = context ? context.currentTime + 0.01 : 0;
			let cursorMs = 10;

			orderedEvents.forEach((event) => {
				if (hasAudioAsset(event.type)) {
					window.setTimeout(() => {
						if (!playAudioAsset(event.type) && context) {
							playPattern(context, SOUND_PATTERNS[event.type], context.currentTime + 0.01);
						}
					}, Math.max(0, cursorMs));
				} else if (context) {
					playPattern(context, SOUND_PATTERNS[event.type], cursor);
				}

				const duration = soundDuration(event.type);
				cursor += duration + 0.08;
				cursorMs += (duration + 0.08) * 1000;
			});
		};

		if (!context) {
			runPlayback();
			return;
		}

		void context.resume().then(() => {
			if (context.state === "suspended") {
				audioUnlocked = false;
				return;
			}

			runPlayback();
		}).catch(() => {
			audioUnlocked = false;
		});
	} catch {
		// Audio is best-effort. Browsers may block playback until user interaction.
		audioUnlocked = false;
	}
};
