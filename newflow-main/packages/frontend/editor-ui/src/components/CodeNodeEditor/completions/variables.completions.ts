/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { addVarType } from '../utils';
import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { useEnvironmentsStore } from '@/stores/environments.store';

const escape = (str: string) => str.replace('$', '\\$');

export function useVariablesCompletions() {
	const environmentsStore = useEnvironmentsStore();

	/**
	 * Complete `$vars.` to `$vars.VAR_NAME`.
	 */
	const variablesCompletions = (
		context: CompletionContext,
		matcher = '$vars',
	): CompletionResult | null => {
		const pattern = new RegExp(`${escape(matcher)}\..*`);

		const preCursor = context.matchBefore(pattern);

		if (!preCursor || (preCursor.from === preCursor.to && !context.explicit)) return null;

		const options: Completion[] = environmentsStore.variables.map((variable) => ({
			label: `${matcher}.${variable.key}`,
			info: variable.value,
		}));

		return {
			from: preCursor.from,
			options: options.map(addVarType),
		};
	};

	return {
		variablesCompletions,
	};
}
