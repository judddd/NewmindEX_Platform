/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { dollarOptions } from './dollar.completions';
import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { stripExcessParens } from './utils';

/**
 * Completions offered at the blank position: `{{ | }}`
 */
export function blankCompletions(context: CompletionContext): CompletionResult | null {
	const word = context.matchBefore(/\{\{\s/);

	if (!word) return null;

	if (word.from === word.to && !context.explicit) return null;

	const afterCursor = context.state.sliceDoc(context.pos, context.pos + ' }}'.length);

	if (afterCursor !== ' }}') return null;

	return {
		from: word.to,
		options: dollarOptions(context).map(stripExcessParens(context)),
		filter: false,
	};
}
