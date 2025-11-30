/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createEventBus } from '@newflow/utils/event-bus';

export type HighlightLineEvent = number | 'last';

export interface CodeNodeEditorEventBusEvents {
	/** Event that a diff have been applied to the code node editor */
	codeDiffApplied: never;

	/** Command to highlight a specific line in the code node editor */
	highlightLine: HighlightLineEvent;
}

export const codeNodeEditorEventBus = createEventBus<CodeNodeEditorEventBusEvents>();
