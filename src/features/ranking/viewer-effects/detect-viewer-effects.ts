import type { Player } from "../model/types";
import type {
	PlayerEffectState,
	ViewerEffectDetection,
	ViewerSoundEvent,
	ViewerSoundType,
} from "./types";

type ViewerEffectDetectionContext = {
	createTriggerBase?: (player: Player, index: number) => number;
	createResetId?: () => string;
};

const createDefaultTriggerBase = (_player: Player, index: number) =>
	Date.now() + Math.random() + index;
const createDefaultResetId = () => `reset-${Date.now()}`;

const mergePlayerEffect = (
	effects: Record<string, PlayerEffectState>,
	playerId: string,
	effect: PlayerEffectState,
) => {
	effects[playerId] = {
		...effects[playerId],
		...effect,
	};
};

const createSoundEvent = (
	type: ViewerSoundType,
	triggerBase: number | string,
	playerId?: string,
): ViewerSoundEvent => ({
	id: playerId
		? `${playerId}-${type}-${triggerBase}`
		: `${type}-${triggerBase}`,
	type,
	...(playerId ? { playerId } : {}),
});

export const detectViewerEffects = (
	previousPlayers: Player[],
	players: Player[],
	context: ViewerEffectDetectionContext = {},
): ViewerEffectDetection => {
	const createTriggerBase =
		context.createTriggerBase ?? createDefaultTriggerBase;
	const createResetId = context.createResetId ?? createDefaultResetId;
	const previousMap = new Map(
		previousPlayers.map((player, index) => [player.id, { player, index }]),
	);
	const playerEffects: Record<string, PlayerEffectState> = {};
	const soundEvents: ViewerSoundEvent[] = [];
	let championEffect: ViewerEffectDetection["championEffect"] = null;
	let classifiedEffect: ViewerEffectDetection["classifiedEffect"] = null;
	let victoryEffect: ViewerEffectDetection["victoryEffect"] = null;
	let eliminatedEffect: ViewerEffectDetection["eliminatedEffect"] = null;
	const currentIds = new Set(players.map((player) => player.id));

	players.forEach((player, index) => {
		const previousEntry = previousMap.get(player.id);
		const triggerBase = createTriggerBase(player, index);

		if (!previousEntry) {
			mergePlayerEffect(playerEffects, player.id, {
				newPlayerTrigger: triggerBase,
			});
			soundEvents.push(createSoundEvent("newPlayer", triggerBase, player.id));
			return;
		}

		const { player: previousPlayer, index: previousIndex } = previousEntry;
		const moveDelta = index - previousIndex;

		if (moveDelta !== 0) {
			mergePlayerEffect(playerEffects, player.id, {
				moveTrigger: triggerBase + 0.1,
				moveDelta,
			});
			soundEvents.push(
				createSoundEvent(
					moveDelta < 0 ? "moveUp" : "moveDown",
					triggerBase,
					player.id,
				),
			);
		}

		if (player.points !== previousPlayer.points) {
			soundEvents.push(
				createSoundEvent(
					player.points > previousPlayer.points ? "pointGain" : "pointLoss",
					triggerBase,
					player.id,
				),
			);
		}

		if (player.wins > previousPlayer.wins) {
			mergePlayerEffect(playerEffects, player.id, {
				winTrigger: triggerBase + 0.2,
			});
			soundEvents.push(createSoundEvent("win", triggerBase, player.id));
			victoryEffect = {
				id: `${player.id}-victory-${triggerBase}`,
				playerName: player.name,
			};
		}

		if (player.status !== previousPlayer.status) {
			if (player.status === "classified") {
				mergePlayerEffect(playerEffects, player.id, {
					classifiedTrigger: triggerBase + 0.3,
				});
				soundEvents.push(
					createSoundEvent("classified", triggerBase, player.id),
				);
				classifiedEffect = {
					id: `${player.id}-classified-${triggerBase}`,
					playerName: player.name,
				};
			}

			if (player.status === "eliminated") {
				mergePlayerEffect(playerEffects, player.id, {
					eliminatedTrigger: triggerBase + 0.4,
				});
				soundEvents.push(
					createSoundEvent("eliminated", triggerBase, player.id),
				);
				eliminatedEffect = {
					id: `${player.id}-eliminated-${triggerBase}`,
					playerName: player.name,
				};
			}

			if (player.status === "champion") {
				mergePlayerEffect(playerEffects, player.id, {
					championTrigger: triggerBase + 0.5,
				});
				soundEvents.push(createSoundEvent("champion", triggerBase, player.id));
				championEffect = {
					id: `${player.id}-${triggerBase}`,
					playerName: player.name,
				};
			}
		}
	});

	previousPlayers.forEach((previousPlayer, index) => {
		if (currentIds.has(previousPlayer.id)) return;

		const triggerBase = createTriggerBase(
			previousPlayer,
			players.length + index,
		);
		soundEvents.push(
			createSoundEvent("eliminated", triggerBase, previousPlayer.id),
		);
		eliminatedEffect = {
			id: `${previousPlayer.id}-removed-${triggerBase}`,
			playerName: previousPlayer.name,
		};
	});

	const previousTotalPoints = previousPlayers.reduce(
		(sum, player) => sum + player.points,
		0,
	);
	const currentTotalPoints = players.reduce(
		(sum, player) => sum + player.points,
		0,
	);
	const isReset =
		previousTotalPoints > 0 &&
		currentTotalPoints === 0 &&
		players.length > 0 &&
		players.every((player) => player.points === 0);
	const resetId = isReset ? createResetId() : null;

	if (resetId) {
		soundEvents.push(createSoundEvent("reset", resetId));
	}

	return {
		playerEffects,
		championEffect,
		classifiedEffect,
		victoryEffect,
		eliminatedEffect,
		resetEffect: resetId ? { id: resetId } : null,
		soundEvents,
	};
};
