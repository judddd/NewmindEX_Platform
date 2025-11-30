/**
 * Event Bus API - Stub Implementation
 *
 * This module provides a compatibility layer for the event bus/log streaming functionality.
 * The actual log streaming feature has been removed from this version, but this stub
 * maintains the API interface to prevent breaking changes in components that reference it.
 *
 * Original functionality (now removed):
 * - Stream workflow execution logs to external systems
 * - Configure destinations (Syslog, Webhook, etc.)
 * - Test destination connectivity
 * - Manage event subscriptions
 *
 * Current behavior:
 * - All mutation operations throw descriptive errors
 * - Query operations return empty results
 * - Type definitions are preserved for compatibility
 *
 * @module eventbus-api
 */

import type { MessageEventBusDestinationOptions } from 'n8n-workflow';

import type { IRestApiContext } from '../types';

/**
 * Extended destination options with database ID.
 *
 * This type represents a destination configuration that has been
 * persisted to the database and assigned a unique identifier.
 */
export type ApiMessageEventBusDestinationOptions = MessageEventBusDestinationOptions & {
	/**
	 * Unique identifier for the destination in the database.
	 * Generated when the destination is first saved.
	 */
	id: string;
};

/**
 * Type guard to check if a destination has been persisted to the database.
 *
 * This function determines whether a destination object includes a database ID,
 * indicating that it has been saved and can be referenced by that ID.
 *
 * @param destination - The destination object to check
 * @returns True if the destination has an ID, false otherwise
 *
 * @example
 * const dest = { id: '123', type: 'webhook', url: '...' };
 * if (hasDestinationId(dest)) {
 *   console.log('Destination ID:', dest.id); // TypeScript knows dest.id exists
 * }
 */
export function hasDestinationId(
	destination: MessageEventBusDestinationOptions,
): destination is ApiMessageEventBusDestinationOptions {
	return 'id' in destination && typeof destination.id === 'string';
}

/**
 * Save a log streaming destination to the database.
 *
 * This function would configure and persist a new or updated destination
 * for receiving workflow execution logs. Destinations can include:
 * - Syslog servers
 * - Webhook endpoints
 * - Message queues
 * - Custom log aggregation services
 *
 * **Current Status:** Feature removed - this function always throws an error.
 *
 * @param _context - REST API context (unused in stub)
 * @param _destination - Destination configuration to save (unused in stub)
 * @param _subscribedEvents - Array of event types to stream (unused in stub)
 * @throws {Error} Always throws indicating feature has been removed
 *
 * @example
 * // This will throw an error
 * await saveDestinationToDb(context, {
 *   type: 'webhook',
 *   url: 'https://logs.example.com/webhook',
 *   credentials: { /* ... *\/ }
 * }, ['workflow.success', 'workflow.failed']);
 */
export async function saveDestinationToDb(
	_context: IRestApiContext,
	_destination: ApiMessageEventBusDestinationOptions,
	_subscribedEvents: string[] = [],
): Promise<void> {
	throw new Error(
		'Log Streaming feature has been removed. ' +
			'To collect execution logs, consider using: ' +
			'1. Workflow error triggers, ' +
			'2. Custom logging nodes, ' +
			'3. External monitoring solutions',
	);
}

/**
 * Delete a log streaming destination from the database.
 *
 * This function would remove a previously configured destination,
 * stopping all log streaming to that endpoint.
 *
 * **Current Status:** Feature removed - this function always throws an error.
 *
 * @param _context - REST API context (unused in stub)
 * @param _destinationId - ID of the destination to delete (unused in stub)
 * @throws {Error} Always throws indicating feature has been removed
 *
 * @example
 * // This will throw an error
 * await deleteDestinationFromDb(context, 'dest-123');
 */
export async function deleteDestinationFromDb(
	_context: IRestApiContext,
	_destinationId: string,
): Promise<void> {
	throw new Error(
		'Log Streaming feature has been removed. ' + 'Destination management is no longer available.',
	);
}

/**
 * Test connectivity to a log streaming destination.
 *
 * This function would validate that a destination configuration is correct
 * by attempting to send a test message. It would check:
 * - Network connectivity
 * - Authentication/credentials
 * - Message format compatibility
 * - Endpoint availability
 *
 * **Current Status:** Feature removed - this function always throws an error.
 *
 * @param _context - REST API context (unused in stub)
 * @param _destination - Destination configuration to test (unused in stub)
 * @returns Would return true if connection succeeds, false otherwise
 * @throws {Error} Always throws indicating feature has been removed
 *
 * @example
 * // This will throw an error
 * const isConnected = await sendTestMessageToDestination(context, {
 *   type: 'syslog',
 *   host: 'logs.example.com',
 *   port: 514
 * });
 */
export async function sendTestMessageToDestination(
	_context: IRestApiContext,
	_destination: ApiMessageEventBusDestinationOptions,
): Promise<boolean> {
	throw new Error(
		'Log Streaming feature has been removed. ' + 'Connection testing is no longer available.',
	);
}

/**
 * Get list of available event types from the backend.
 *
 * This function would retrieve a comprehensive list of all event types
 * that can be subscribed to for log streaming, such as:
 * - workflow.success
 * - workflow.failed
 * - workflow.started
 * - node.executed
 * - etc.
 *
 * **Current Status:** Feature removed - returns empty array for compatibility.
 *
 * @param _context - REST API context (unused in stub)
 * @returns Promise resolving to empty array (no events available)
 *
 * @example
 * const events = await getEventNamesFromBackend(context);
 * console.log(events); // Output: []
 */
export async function getEventNamesFromBackend(_context: IRestApiContext): Promise<string[]> {
	// Return empty array instead of throwing to maintain compatibility
	// with components that query available events
	return [];
}

/**
 * Get all configured log streaming destinations from the backend.
 *
 * This function would retrieve the complete list of destinations
 * that have been configured for receiving workflow execution logs,
 * including their current status and configuration details.
 *
 * **Current Status:** Feature removed - returns empty array for compatibility.
 *
 * @param _context - REST API context (unused in stub)
 * @returns Promise resolving to empty array (no destinations configured)
 *
 * @example
 * const destinations = await getDestinationsFromBackend(context);
 * console.log(destinations); // Output: []
 */
export async function getDestinationsFromBackend(
	_context: IRestApiContext,
): Promise<MessageEventBusDestinationOptions[]> {
	// Return empty array instead of throwing to maintain compatibility
	// with components that display destination lists
	return [];
}
