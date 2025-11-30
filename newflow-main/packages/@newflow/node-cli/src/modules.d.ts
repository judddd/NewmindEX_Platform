/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

declare module 'eslint-plugin-n8n-nodes-base' {
	import type { ESLint } from 'eslint';

	const plugin: ESLint.Plugin & {
		configs: {
			community: {
				rules: Record<string, Linter.RuleEntry>;
			};
			credentials: {
				rules: Record<string, Linter.RuleEntry>;
			};
			nodes: {
				rules: Record<string, Linter.RuleEntry>;
			};
		};
	};

	export default plugin;
}
