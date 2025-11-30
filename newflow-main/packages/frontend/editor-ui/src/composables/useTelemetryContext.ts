/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { TelemetryContextSymbol } from '@/constants';
import type { TelemetryContext } from '@/types/telemetry';
import { inject, provide } from 'vue';

/**
 * Composable that injects/provides data for telemetry payload.
 *
 * Intended for populating telemetry payload in reusable components to include
 * contextual information that depends on which part of UI it is used.
 */
export function useTelemetryContext(overrides: TelemetryContext = {}): TelemetryContext {
	const ctx = inject(TelemetryContextSymbol, {});
	const merged = { ...ctx, ...overrides };

	provide(TelemetryContextSymbol, merged);

	return merged;
}
