/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export type Class<T = object, A extends unknown[] = unknown[]> = new (...args: A) => T;

type EventHandlerFn = () => Promise<void> | void;
export type EventHandlerClass = Class<Record<string, EventHandlerFn>>;
export type EventHandler<T extends string> = {
	/** Class holding the method to call on an event. */
	eventHandlerClass: EventHandlerClass;

	/** Name of the method to call on an event. */
	methodName: string;

	/** Name of the event to listen to. */
	eventName: T;
};
