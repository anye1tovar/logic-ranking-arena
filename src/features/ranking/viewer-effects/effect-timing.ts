const NOX_GIF_PLAYBACK_MS = 5_870;
const NOX_GIF_PLAYBACK_SECONDS = NOX_GIF_PLAYBACK_MS / 1000;

export const VIEWER_EFFECT_TIMING = {
	noxGifPlaybackMs: NOX_GIF_PLAYBACK_MS,
	scoreFlashCleanupMs: 1_600,
	card: {
		newPlayerMs: 2_000,
		winMs: NOX_GIF_PLAYBACK_MS,
		classifiedMs: NOX_GIF_PLAYBACK_MS,
		eliminatedMs: NOX_GIF_PLAYBACK_MS,
		championMs: NOX_GIF_PLAYBACK_MS,
		moveMs: 1_600,
	},
	overlay: {
		championMs: NOX_GIF_PLAYBACK_MS,
		classifiedMs: NOX_GIF_PLAYBACK_MS,
		eliminatedMs: NOX_GIF_PLAYBACK_MS,
		victoryMs: NOX_GIF_PLAYBACK_MS,
		resetMs: 2_000,
	},
	motion: {
		scoreRippleStrongSeconds: 1.45,
		scoreRippleSeconds: 1.2,
		classifiedSweepSeconds: NOX_GIF_PLAYBACK_SECONDS,
		eliminatedSeconds: NOX_GIF_PLAYBACK_SECONDS,
		newPlayerSeconds: 1.8,
		winSeconds: NOX_GIF_PLAYBACK_SECONDS,
		moveSeconds: 1.45,
		floatingSeconds: 1.55,
	},
};
