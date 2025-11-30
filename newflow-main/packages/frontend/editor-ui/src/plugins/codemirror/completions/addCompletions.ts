/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ifIn } from '@codemirror/autocomplete';
import { blankCompletions } from './blank.completions';
import { bracketAccessCompletions } from './bracketAccess.completions';
import { datatypeCompletions } from './datatype.completions';
import { dollarCompletions } from './dollar.completions';
import { nonDollarCompletions } from './nonDollar.completions';

export function n8nCompletionSources() {
	return [
		blankCompletions,
		bracketAccessCompletions,
		datatypeCompletions,
		dollarCompletions,
		nonDollarCompletions,
	].map((source) => ({
		autocomplete: ifIn(['Resolvable'], source),
	}));
}
