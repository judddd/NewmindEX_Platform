/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Annotation } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

export const ignoreUpdateAnnotation = Annotation.define<boolean>();

/**
 * Simulate user action to force parser to catch up during scroll.
 */
export function forceParse(view: EditorView) {
	view.dispatch({
		changes: { from: view.viewport.to, insert: '_' },
		annotations: [ignoreUpdateAnnotation.of(true)],
	});

	view.dispatch({
		changes: { from: view.viewport.to - 1, to: view.viewport.to, insert: '' },
		annotations: [ignoreUpdateAnnotation.of(true)],
	});
}
