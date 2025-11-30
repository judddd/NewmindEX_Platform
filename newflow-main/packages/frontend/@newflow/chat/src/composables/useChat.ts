import { inject } from 'vue';

import { ChatSymbol } from '@newflow/chat/constants';
import type { Chat } from '@newflow/chat/types';

export function useChat() {
	return inject(ChatSymbol) as Chat;
}
