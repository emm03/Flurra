import manualReview from './maps/heavenly/manual-reviewed-matches.json';
import type { OfficialRunDifficulty } from './heavenlyOfficialRuns';

export type HeavenlyCanyonSubarea = 'killebrew-canyon' | 'mott-canyon' | 'shared-access';
export type HeavenlyAccessRestriction = 'experts-only-gated-terrain' | null;

type CanyonAssignment = {
  flurraRunId: string;
  subarea: HeavenlyCanyonSubarea;
};

const assignments = manualReview.canyonAssignments as CanyonAssignment[];
const assignmentByRunId = new Map(assignments.map((assignment) => [assignment.flurraRunId, assignment]));
const effectivePolicy = manualReview.effectiveClassificationPolicy;
const restrictedSubareas = new Set<HeavenlyCanyonSubarea>(
  effectivePolicy.appliesToSubareas as HeavenlyCanyonSubarea[],
);

/**
 * Canonical run difficulty is a permanent map-derived fact and remains untouched.
 * Effective difficulty is a separate product presentation field: Heavenly's current
 * map applies a double-black, experts-only gated-terrain restriction to every run
 * inside Mott and Killebrew, even when an individual source symbol differs.
 */
export function getHeavenlyEffectiveClassification(
  runId: string,
  sourceDifficulty: OfficialRunDifficulty,
) {
  const canyonSubarea = assignmentByRunId.get(runId)?.subarea ?? null;
  const isRestrictedCanyon = canyonSubarea !== null && restrictedSubareas.has(canyonSubarea);

  return {
    canyonSubarea,
    effectiveDifficulty: (isRestrictedCanyon
      ? effectivePolicy.effectiveMapDifficulty
      : sourceDifficulty) as OfficialRunDifficulty,
    accessRestriction: (isRestrictedCanyon
      ? effectivePolicy.accessRestriction
      : null) as HeavenlyAccessRestriction,
    presentationBasis: isRestrictedCanyon
      ? 'official-gated-area-restriction'
      : 'source-run-difficulty',
    classificationSourceMapRef: isRestrictedCanyon ? effectivePolicy.sourceMapRef : null,
  } as const;
}
