/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * Create an event queue that processes events sequentially.
 *
 * @param processEvent - Async function that processes a single event.
 * @returns A function that enqueues events for processing.
 */
export function createEventQueue<T>(processEvent: (event: T) => Promise<void>) {
	// The internal queue holding events.
	const queue: T[] = [];

	// Flag to indicate whether an event is currently being processed.
	let processing = false;

	/**
	 * Process the next event in the queue (if not already processing).
	 */
	async function processNext(): Promise<void> {
		if (processing || queue.length === 0) {
			return;
		}

		processing = true;
		const currentEvent = queue.shift();

		if (currentEvent !== undefined) {
			try {
				await processEvent(currentEvent);
			} catch (error) {
				console.error('Error processing event:', error);
			}
		}

		processing = false;

		// Recursively process the next event.
		await processNext();
	}

	/**
	 * Enqueue an event and trigger processing.
	 *
	 * @param event - The event to enqueue.
	 */
	function enqueue(event: T): void {
		queue.push(event);
		void processNext();
	}

	return { enqueue };
}
