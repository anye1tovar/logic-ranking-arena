import { afterEach, describe, expect, it, vi } from "vitest";

import type { ViewerSoundEvent } from "./types";

type FakeOscillator = {
	frequency: { setValueAtTime: ReturnType<typeof vi.fn> };
	connect: ReturnType<typeof vi.fn>;
	start: ReturnType<typeof vi.fn>;
	stop: ReturnType<typeof vi.fn>;
	type?: OscillatorType;
};

type FakeGain = {
	gain: {
		setValueAtTime: ReturnType<typeof vi.fn>;
		exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
	};
	connect: ReturnType<typeof vi.fn>;
};

type FakeAudioElement = {
	src: string;
	preload: string;
	duration: number;
	currentTime: number;
	load: ReturnType<typeof vi.fn>;
	play: ReturnType<typeof vi.fn>;
	cloneNode: ReturnType<typeof vi.fn>;
};

const flushPlayback = async () => {
	await Promise.resolve();
	await Promise.resolve();
};

describe("viewer action sounds", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	it("plays one sound pattern for each detected event, even when types repeat", async () => {
		const oscillators: FakeOscillator[] = [];
		const gains: FakeGain[] = [];

		class FakeAudioContext {
			currentTime = 10;
			destination = {};
			resume = vi.fn().mockResolvedValue(undefined);

			createOscillator = vi.fn(() => {
				const oscillator: FakeOscillator = {
					frequency: { setValueAtTime: vi.fn() },
					connect: vi.fn(),
					start: vi.fn(),
					stop: vi.fn(),
				};
				oscillators.push(oscillator);
				return oscillator;
			});

			createGain = vi.fn(() => {
				const gain: FakeGain = {
					gain: {
						setValueAtTime: vi.fn(),
						exponentialRampToValueAtTime: vi.fn(),
					},
					connect: vi.fn(),
				};
				gains.push(gain);
				return gain;
			});
		}

		const audios: FakeAudioElement[] = [];
		class FakeAudio {
			src: string;
			preload = "";
			duration = 1;
			currentTime = 0;
			load = vi.fn();
			play = vi.fn().mockResolvedValue(undefined);

			constructor(src: string) {
				this.src = src;
				audios.push(this);
			}

			cloneNode = vi.fn(() => {
				const clone: FakeAudioElement = {
					src: this.src,
					preload: this.preload,
					duration: this.duration,
					currentTime: 0,
					load: vi.fn(),
					play: vi.fn().mockResolvedValue(undefined),
					cloneNode: vi.fn(),
				};
				audios.push(clone);
				return clone;
			});
		}

		vi.stubGlobal("window", { AudioContext: FakeAudioContext, setTimeout });
		vi.stubGlobal("Audio", FakeAudio);
		const { enableViewerActionSounds, playViewerActionSounds } = await import(
			"./action-sounds"
		);
		const events: ViewerSoundEvent[] = [
			{ id: "a-pointGain-1", type: "pointGain", playerId: "a" },
			{ id: "b-pointGain-2", type: "pointGain", playerId: "b" },
		];

		expect(await enableViewerActionSounds()).toBe(true);
		playViewerActionSounds(events);
		await flushPlayback();

		expect(oscillators).toHaveLength(6);
		expect(oscillators.map((oscillator) => oscillator.start)).toEqual([
			expect.any(Function),
			expect.any(Function),
			expect.any(Function),
			expect.any(Function),
			expect.any(Function),
			expect.any(Function),
		]);
		expect(
			oscillators.every(
				(oscillator) => oscillator.start.mock.calls.length === 1,
			),
		).toBe(true);
		expect(gains).toHaveLength(6);
		expect(audios).toHaveLength(4);
	});

	it("uses imported audio assets for win, classified, eliminated, and champion", async () => {
		const plays: string[] = [];

		class FakeAudioContext {
			currentTime = 4;
			destination = {};
			state: AudioContextState = "running";
			resume = vi.fn().mockResolvedValue(undefined);
			createOscillator = vi.fn(() => ({
				frequency: { setValueAtTime: vi.fn() },
				connect: vi.fn(),
				start: vi.fn(),
				stop: vi.fn(),
			}));
			createGain = vi.fn(() => ({
				gain: {
					setValueAtTime: vi.fn(),
					exponentialRampToValueAtTime: vi.fn(),
				},
				connect: vi.fn(),
			}));
		}

		class FakeAudio {
			src: string;
			preload = "";
			duration = 1.5;
			currentTime = 0;
			load = vi.fn();
			play = vi.fn().mockImplementation(async () => {
				plays.push(this.src);
			});

			constructor(src: string) {
				this.src = src;
			}

			cloneNode = vi.fn(() => ({
				src: this.src,
				preload: this.preload,
				duration: this.duration,
				currentTime: 0,
				load: vi.fn(),
				play: vi.fn().mockImplementation(async () => {
					plays.push(this.src);
				}),
				cloneNode: vi.fn(),
			}));
		}

		vi.useFakeTimers();
		vi.stubGlobal("window", { AudioContext: FakeAudioContext, setTimeout });
		vi.stubGlobal("Audio", FakeAudio);

		const { enableViewerActionSounds, playViewerActionSounds } = await import(
			"./action-sounds"
		);

		expect(await enableViewerActionSounds()).toBe(true);
		playViewerActionSounds([
			{ id: "a-win", type: "win", playerId: "a" },
			{ id: "b-classified", type: "classified", playerId: "b" },
			{ id: "c-eliminated", type: "eliminated", playerId: "c" },
			{ id: "d-champion", type: "champion", playerId: "d" },
		]);
		await flushPlayback();
		await vi.runAllTimersAsync();

		expect(plays).toHaveLength(4);
		expect(plays.some((src) => src.includes("win-sound"))).toBe(true);
		expect(plays.some((src) => src.includes("classified-sound"))).toBe(true);
		expect(plays.some((src) => src.includes("eliminated-sound"))).toBe(true);
		expect(plays.some((src) => src.includes("champion-sound"))).toBe(true);

		vi.useRealTimers();
	});
});
