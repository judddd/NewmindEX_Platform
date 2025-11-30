/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { InjectionKey } from 'vue';
import { inject } from 'vue';

export function injectStrict<T>(key: InjectionKey<T>, fallback?: T) {
	const resolved = inject(key, fallback);
	if (!resolved) {
		throw new Error(`Could not resolve ${key.description}`);
	}
	return resolved;
}
