/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Ref } from 'vue';
import { nextTick, ref } from 'vue';

export function useWorkflowResourceLocatorDropdown(
	isListMode: Ref<boolean>,
	inputRef: Ref<HTMLInputElement | undefined>,
) {
	const isDropdownVisible = ref(false);
	const resourceDropdownHiding = ref(false);

	function showDropdown() {
		if (!isListMode.value || resourceDropdownHiding.value) {
			return;
		}

		isDropdownVisible.value = true;
	}

	function hideDropdown() {
		isDropdownVisible.value = false;

		resourceDropdownHiding.value = true;
		void nextTick(() => {
			inputRef.value?.blur?.();
			resourceDropdownHiding.value = false;
		});
	}

	return {
		isDropdownVisible,
		showDropdown,
		hideDropdown,
	};
}
