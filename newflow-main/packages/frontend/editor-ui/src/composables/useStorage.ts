/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useStorage as useStorageComposable } from '@vueuse/core';
import type { Ref } from 'vue';

export function useStorage(key: string): Ref<string | null> {
	const data = useStorageComposable(key, null, undefined, { writeDefaults: false });

	// bug in 1.15.1
	if (data.value === 'undefined') {
		data.value = null;
	}

	return data;
}
