/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ComputedRef } from 'vue';

export type TelemetryNdvType = 'ndv' | 'focus_panel' | 'zoomed_view';

export type TelemetryNdvSource =
	| 'added_new_node'
	| 'canvas_default_view'
	| 'canvas_zoomed_view'
	| 'focus_panel'
	| 'logs_view'
	| 'other';

export type TelemetryContext = Partial<{
	view_shown: TelemetryNdvType;
	ndv_source: ComputedRef<TelemetryNdvSource | undefined>;
}>;
