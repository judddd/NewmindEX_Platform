/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { isBuiltin } from 'node:module';

import { DisallowedModuleError } from './errors/disallowed-module.error';
import { ExecutionError } from './errors/execution-error';

export type RequireResolverOpts = {
	/**
	 * List of built-in nodejs modules that are allowed to be required in the
	 * execution sandbox. `"*"` means all are allowed.
	 */
	allowedBuiltInModules: Set<string> | '*';

	/**
	 * List of external modules that are allowed to be required in the
	 * execution sandbox. `"*"` means all are allowed.
	 */
	allowedExternalModules: Set<string> | '*';
};

export type RequireResolver = (request: string) => unknown;

export function createRequireResolver({
	allowedBuiltInModules,
	allowedExternalModules,
}: RequireResolverOpts) {
	return (request: string) => {
		const checkIsAllowed = (allowList: Set<string> | '*', moduleName: string) => {
			return allowList === '*' || allowList.has(moduleName);
		};

		const isAllowed = isBuiltin(request)
			? checkIsAllowed(allowedBuiltInModules, request)
			: checkIsAllowed(allowedExternalModules, request);

		if (!isAllowed) {
			const error = new DisallowedModuleError(request);
			throw new ExecutionError(error);
		}

		return require(request) as unknown;
	};
}
