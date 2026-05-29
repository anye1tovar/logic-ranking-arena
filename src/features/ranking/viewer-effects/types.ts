export type PlayerEffectState = {
	newPlayerTrigger?: number;
	winTrigger?: number;
	classifiedTrigger?: number;
	eliminatedTrigger?: number;
	championTrigger?: number;
	moveTrigger?: number;
	moveDelta?: number;
};

export type NamedViewerEffect = {
	id: string;
	playerName: string;
};

export type ResetViewerEffect = {
	id: string;
};

export type ViewerSoundType =
	| "pointGain"
	| "pointLoss"
	| "win"
	| "classified"
	| "eliminated"
	| "champion"
	| "newPlayer"
	| "moveUp"
	| "moveDown"
	| "reset";

export type ViewerSoundEvent = {
	id: string;
	type: ViewerSoundType;
	playerId?: string;
};

export type ViewerEffectDetection = {
	playerEffects: Record<string, PlayerEffectState>;
	championEffect: NamedViewerEffect | null;
	classifiedEffect: NamedViewerEffect | null;
	victoryEffect: NamedViewerEffect | null;
	eliminatedEffect: NamedViewerEffect | null;
	resetEffect: ResetViewerEffect | null;
	soundEvents: ViewerSoundEvent[];
};
