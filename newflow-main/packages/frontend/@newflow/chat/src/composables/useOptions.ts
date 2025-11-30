import { inject } from 'vue';

import { ChatOptionsSymbol } from '@newflow/chat/constants';
import type { ChatOptions } from '@newflow/chat/types';

export function useOptions() {
	const options = inject(ChatOptionsSymbol) as ChatOptions;

	return {
		options,
	};
}
