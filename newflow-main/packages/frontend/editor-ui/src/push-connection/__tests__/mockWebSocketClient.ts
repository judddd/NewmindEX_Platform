/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { WebSocketState } from '@/push-connection/useWebSocketClient';

/** Mocked WebSocket class to help testing */
export class MockWebSocket extends EventTarget {
	readyState: number = WebSocketState.CONNECTING;

	constructor(public url: string) {
		super();
	}

	simulateConnectionOpen() {
		this.dispatchEvent(new Event('open'));
		this.readyState = WebSocketState.OPEN;
	}

	simulateConnectionClose(code: number) {
		this.dispatchEvent(new CloseEvent('close', { code }));
		this.readyState = WebSocketState.CLOSED;
	}

	simulateMessageEvent(data: string) {
		this.dispatchEvent(new MessageEvent('message', { data }));
	}

	dispatchErrorEvent() {
		this.dispatchEvent(new Event('error'));
	}

	send = vi.fn();

	close = vi.fn();
}
