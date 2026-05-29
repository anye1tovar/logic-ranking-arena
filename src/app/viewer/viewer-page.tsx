import VolumeUpRounded from "@mui/icons-material/VolumeUpRounded";
import { Button, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { Leaderboard } from "../../components/leaderboard/leaderboard";
import stylesShell from "../../components/shared/shell.module.scss";
import { TournamentHeader } from "../../components/tournament-header/tournament-header";
import { ViewerEffectsLayer } from "../../components/viewer-effects/viewer-effects-layer";
import {
	enableViewerActionSounds,
	playViewerActionSounds,
} from "../../features/ranking/viewer-effects/action-sounds";
import { detectViewerEffects } from "../../features/ranking/viewer-effects/detect-viewer-effects";
import { VIEWER_EFFECT_TIMING } from "../../features/ranking/viewer-effects/effect-timing";
import { useRankingStore } from "../../store/ranking-store";
import type { Player, RankingLastAction } from "../../types/ranking";
import type {
	NamedViewerEffect,
	PlayerEffectState,
	ResetViewerEffect,
} from "../../types/viewer-effects";
import styles from "./viewer-page.module.scss";

export const ViewerPage = () => {
	const { event, players, lastAction, clearFlashes } = useRankingStore();
	const previousPlayersRef = useRef<Player[]>(players);
	const previousLastActionRef = useRef<RankingLastAction | null>(lastAction);
	const [championEffect, setChampionEffect] =
		useState<NamedViewerEffect | null>(null);
	const [classifiedEffect, setClassifiedEffect] =
		useState<NamedViewerEffect | null>(null);
	const [victoryEffect, setVictoryEffect] = useState<NamedViewerEffect | null>(
		null,
	);
	const [eliminatedEffect, setEliminatedEffect] =
		useState<NamedViewerEffect | null>(null);
	const [resetEffect, setResetEffect] = useState<ResetViewerEffect | null>(
		null,
	);
	const [playerEffects, setPlayerEffects] = useState<
		Record<string, PlayerEffectState>
	>({});
	const [soundEnabled, setSoundEnabled] = useState(false);

	const clearOverlayEffects = () => {
		setChampionEffect(null);
		setClassifiedEffect(null);
		setVictoryEffect(null);
		setEliminatedEffect(null);
		setResetEffect(null);
	};

	const replayStatusAction = (
		action: Extract<RankingLastAction, { playerId?: string }>,
	) => {
		const player = action.playerId
			? players.find(({ id }) => id === action.playerId)
			: null;
		if (!player) return false;

		const triggerBase = action.createdAt;
		const playerName = player.name;

		switch (action.type) {
			case "classified": {
				setPlayerEffects((current) => ({
					...current,
					[player.id]: {
						...current[player.id],
						classifiedTrigger: triggerBase + 0.3,
					},
				}));
				playViewerActionSounds([
					{
						id: `${player.id}-classified-replay-${action.id}`,
						type: "classified",
						playerId: player.id,
					},
				]);
				clearOverlayEffects();
				setClassifiedEffect({
					id: `${player.id}-classified-replay-${action.id}`,
					playerName,
				});
				const timeout = window.setTimeout(
					() => setClassifiedEffect(null),
					VIEWER_EFFECT_TIMING.overlay.classifiedMs,
				);
				return () => window.clearTimeout(timeout);
			}
			case "eliminated": {
				setPlayerEffects((current) => ({
					...current,
					[player.id]: {
						...current[player.id],
						eliminatedTrigger: triggerBase + 0.4,
					},
				}));
				playViewerActionSounds([
					{
						id: `${player.id}-eliminated-replay-${action.id}`,
						type: "eliminated",
						playerId: player.id,
					},
				]);
				clearOverlayEffects();
				setEliminatedEffect({
					id: `${player.id}-eliminated-replay-${action.id}`,
					playerName,
				});
				const timeout = window.setTimeout(
					() => setEliminatedEffect(null),
					VIEWER_EFFECT_TIMING.overlay.eliminatedMs,
				);
				return () => window.clearTimeout(timeout);
			}
			case "champion": {
				setPlayerEffects((current) => ({
					...current,
					[player.id]: {
						...current[player.id],
						championTrigger: triggerBase + 0.5,
					},
				}));
				playViewerActionSounds([
					{
						id: `${player.id}-champion-replay-${action.id}`,
						type: "champion",
						playerId: player.id,
					},
				]);
				clearOverlayEffects();
				setChampionEffect({
					id: `${player.id}-champion-replay-${action.id}`,
					playerName,
				});
				const timeout = window.setTimeout(
					() => setChampionEffect(null),
					VIEWER_EFFECT_TIMING.overlay.championMs,
				);
				return () => window.clearTimeout(timeout);
			}
			default:
				return false;
		}
	};

	useEffect(() => {
		const timeouts = players.flatMap((player) =>
			player.scoreFlashes.map((flash) =>
				window.setTimeout(
					() => clearFlashes(player.id),
					Math.max(
						0,
						VIEWER_EFFECT_TIMING.scoreFlashCleanupMs -
							(Date.now() - flash.createdAt),
					),
				),
			),
		);

		return () => {
			timeouts.forEach(window.clearTimeout);
		};
	}, [clearFlashes, players]);

	useEffect(() => {
		const detection = detectViewerEffects(previousPlayersRef.current, players);
		const previousLastAction = previousLastActionRef.current;
		const resetEventTriggered =
			lastAction?.type === "resetEvent" &&
			lastAction.id !== previousLastAction?.id;
		const replayableStatusActionTriggered =
			!!lastAction &&
			(lastAction.type === "classified" ||
				lastAction.type === "eliminated" ||
				lastAction.type === "champion") &&
			lastAction.id !== previousLastAction?.id;
		const soundEvents = resetEventTriggered && lastAction
			? [{ id: `reset-event-${lastAction.id}`, type: "reset" as const }]
			: detection.soundEvents;

		previousPlayersRef.current = players;
		previousLastActionRef.current = lastAction;

		playViewerActionSounds(soundEvents);

		if (Object.keys(detection.playerEffects).length > 0) {
			setPlayerEffects((current) => {
				const updated = { ...current };
				Object.entries(detection.playerEffects).forEach(([id, effect]) => {
					updated[id] = {
						...updated[id],
						...effect,
					};
				});
				return updated;
			});
		} else if (players.length === 0) {
			setPlayerEffects({});
		}

		if (resetEventTriggered && lastAction) {
			clearOverlayEffects();
			setResetEffect({ id: lastAction.id });
			const resetTimeout = window.setTimeout(
				() => setResetEffect(null),
				VIEWER_EFFECT_TIMING.overlay.resetMs,
			);
			return () => window.clearTimeout(resetTimeout);
		}

		if (
			replayableStatusActionTriggered &&
			lastAction &&
			((lastAction.type === "classified" && !detection.classifiedEffect) ||
				(lastAction.type === "eliminated" && !detection.eliminatedEffect) ||
				(lastAction.type === "champion" && !detection.championEffect))
		) {
			const cleanup = replayStatusAction(lastAction);
			if (cleanup) {
				return cleanup;
			}
		}

		if (detection.championEffect) {
			clearOverlayEffects();
			setChampionEffect(detection.championEffect);
			const championTimeout = window.setTimeout(
				() => setChampionEffect(null),
				VIEWER_EFFECT_TIMING.overlay.championMs,
			);
			return () => window.clearTimeout(championTimeout);
		}

		if (detection.classifiedEffect) {
			clearOverlayEffects();
			setClassifiedEffect(detection.classifiedEffect);
			const classifiedTimeout = window.setTimeout(
				() => setClassifiedEffect(null),
				VIEWER_EFFECT_TIMING.overlay.classifiedMs,
			);
			return () => window.clearTimeout(classifiedTimeout);
		}

		if (detection.victoryEffect) {
			clearOverlayEffects();
			setVictoryEffect(detection.victoryEffect);
			const victoryTimeout = window.setTimeout(
				() => setVictoryEffect(null),
				VIEWER_EFFECT_TIMING.overlay.victoryMs,
			);
			return () => window.clearTimeout(victoryTimeout);
		}

		if (detection.eliminatedEffect) {
			clearOverlayEffects();
			setEliminatedEffect(detection.eliminatedEffect);
			const eliminatedTimeout = window.setTimeout(
				() => setEliminatedEffect(null),
				VIEWER_EFFECT_TIMING.overlay.eliminatedMs,
			);
			return () => window.clearTimeout(eliminatedTimeout);
		}

		if (detection.resetEffect) {
			clearOverlayEffects();
			setResetEffect(detection.resetEffect);
			const resetTimeout = window.setTimeout(
				() => setResetEffect(null),
				VIEWER_EFFECT_TIMING.overlay.resetMs,
			);
			return () => window.clearTimeout(resetTimeout);
		}
	}, [lastAction, players]);

	const handleEnableSound = async () => {
		setSoundEnabled(await enableViewerActionSounds());
	};

	return (
		<main className={`${stylesShell.pageShell} ${styles.viewerShell}`}>
			<ViewerEffectsLayer
				championEffect={championEffect}
				classifiedEffect={classifiedEffect}
				victoryEffect={victoryEffect}
				eliminatedEffect={eliminatedEffect}
				resetEffect={resetEffect}
			/>
			<div className={`${stylesShell.contentGrid} ${styles.viewerGrid}`}>
				<TournamentHeader event={event} players={players} mode="viewer" />
				<div className={styles.viewerToolbar}>
					<Typography className={styles.viewerHint}>
						Vista pública lista para fullscreen, TV o proyector
					</Typography>
					{soundEnabled ? (
						<Typography className={styles.soundReady}>Sonido activo</Typography>
					) : (
						<Button
							className={styles.soundButton}
							variant="contained"
							color="secondary"
							startIcon={<VolumeUpRounded />}
							onClick={handleEnableSound}
						>
							Activar sonido
						</Button>
					)}
				</div>
				<Leaderboard
					players={players}
					viewerMode
					playerEffects={playerEffects}
				/>
			</div>
		</main>
	);
};
