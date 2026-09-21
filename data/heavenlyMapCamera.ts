export type MapViewport = {
  width: number;
  height: number;
};

export type CameraPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function getWholeMountainPadding(
  viewport: MapViewport,
  resortView: boolean,
  basePadding: number,
  bottomInset = 0,
): CameraPadding {
  const compact = viewport.width < 600;
  if (compact) {
    const safePadding = Math.round(Math.min(40, Math.max(32, viewport.width * 0.09)));
    return {
      top: safePadding,
      right: safePadding,
      bottom: Math.max(safePadding, bottomInset + 18),
      left: safePadding,
    };
  }

  const horizontalSafeZone = Math.round(Math.max(basePadding, viewport.width * 0.06));
  const verticalSafeZone = Math.round(Math.max(basePadding, viewport.height * (resortView ? 0.08 : 0.06)));
  return {
    top: verticalSafeZone,
    right: horizontalSafeZone,
    bottom: verticalSafeZone,
    left: horizontalSafeZone,
  };
}

export function getSelectedRunPadding(
  viewport: MapViewport,
  bottomInset = 0,
): CameraPadding {
  const compact = viewport.width < 600;
  const safePadding = compact
    ? 48
    : Math.round(Math.min(104, Math.max(72, Math.min(viewport.width, viewport.height) * 0.11)));
  return {
    top: safePadding,
    right: safePadding,
    bottom: compact ? Math.max(safePadding, bottomInset + 24) : safePadding,
    left: safePadding,
  };
}

export function getResortPitchCompensation(viewport: MapViewport, pitch: number) {
  if (viewport.width / viewport.height <= 1.05) return 0;
  return Math.log2(1 / Math.cos((pitch * Math.PI) / 180)) * 0.9;
}

export function getSelectedRunOffset(viewport: MapViewport, resortView: boolean): [number, number] {
  if (!resortView || viewport.width < 600) return [0, 0];
  // Pitched DEM terrain projects elevated trail geometry lower than a flat
  // bounds calculation. Use a viewport-relative offset—not a fixed pan—to
  // retain visible terrain below the selected line.
  return [0, -Math.round(viewport.height * 0.09)];
}
