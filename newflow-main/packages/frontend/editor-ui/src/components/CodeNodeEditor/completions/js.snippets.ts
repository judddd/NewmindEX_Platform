/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { snippets } from '@codemirror/lang-javascript';
import { completeFromList, snippetCompletion } from '@codemirror/autocomplete';

/**
 * https://github.com/codemirror/lang-javascript/blob/main/src/snippets.ts
 */
export const jsSnippets = completeFromList([
	...snippets.filter((snippet) => snippet.label !== 'class'),
	// eslint-disable-next-line n8n-local-rules/no-interpolation-in-regular-string
	snippetCompletion('console.log(${arg})', { label: 'console.log()' }),
	snippetCompletion('DateTime', { label: 'DateTime' }),
	snippetCompletion('Interval', { label: 'Interval' }),
	snippetCompletion('Duration', { label: 'Duration' }),
]);
