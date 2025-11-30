/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/** Mocked EventSource class to help testing */
export class MockEventSource extends EventTarget {
	constructor(public url: string) {
		super();
	}

	simulateConnectionOpen() {
		this.dispatchEvent(new Event('open'));
	}

	simulateConnectionClose() {
		this.dispatchEvent(new Event('close'));
	}

	simulateMessageEvent(data: string) {
		this.dispatchEvent(new MessageEvent('message', { data }));
	}

	close = vi.fn();
}
