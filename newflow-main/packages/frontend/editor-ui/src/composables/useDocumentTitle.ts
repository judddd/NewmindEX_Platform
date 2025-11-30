/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useSettingsStore } from '@/stores/settings.store';
import type { Ref } from 'vue';

const DEFAULT_TITLE = 'NewFlow';
const DEFAULT_TAGLINE = 'Workflow Automation';

export function useDocumentTitle(windowRef?: Ref<Window | undefined>) {
	const settingsStore = useSettingsStore();
	const { releaseChannel } = settingsStore.settings;
	const suffix =
		!releaseChannel || releaseChannel === 'stable'
			? DEFAULT_TITLE
			: `${DEFAULT_TITLE}[${releaseChannel.toUpperCase()}]`;

	const set = (title: string) => {
		const sections = [title || DEFAULT_TAGLINE, suffix];
		(windowRef?.value?.document ?? document).title = sections.join(' - ');
	};

	const reset = () => {
		set('');
	};

	return { set, reset };
}
