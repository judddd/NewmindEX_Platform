/**
 * External Secrets Management API
 *
 * This module provides integration with external secrets management systems
 * like HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, etc.
 *
 * External secrets allow you to:
 * - Store sensitive credentials in dedicated security systems
 * - Centralize secrets management across multiple applications
 * - Implement enterprise security policies and audit trails
 * - Rotate secrets without modifying n8n configurations
 *
 * @module externalSecrets
 */

import type { ExternalSecretsProvider } from '@newflow/api-types';

import type { IRestApiContext } from '../types';
import { makeRestApiRequest } from '../utils';

/**
 * Retrieve all available external secrets from configured providers.
 *
 * This function fetches a complete list of secrets that are accessible
 * through all connected external secrets providers. The secrets are
 * organized by provider name for easy identification.
 *
 * The returned data structure maps provider names to arrays of secret keys:
 * {
 *   'vault': ['database-password', 'api-key'],
 *   'aws': ['prod-db-secret', 'service-token']
 * }
 *
 * Note: This only returns secret *names*, not their actual values.
 * Secret values are fetched securely at runtime when needed by workflows.
 *
 * @param context - REST API context containing authentication and base URL
 * @returns Promise resolving to a record mapping provider names to secret key arrays
 *
 * @example
 * const secrets = await getExternalSecrets(context);
 * console.log(secrets);
 * // Output: { 'vault': ['db-password', 'api-key'], ... }
 *
 * @throws {Error} If any provider fails to respond or authentication fails
 */
export const getExternalSecrets = async (
	context: IRestApiContext,
): Promise<Record<string, string[]>> => {
	return await makeRestApiRequest(context, 'GET', '/external-secrets/secrets');
};

/**
 * Get a list of all configured external secrets providers.
 *
 * This function returns metadata about all external secrets providers
 * that have been configured in the system, including their connection
 * status, type, and configuration details.
 *
 * Provider information includes:
 * - Provider type (Vault, AWS, Azure, etc.)
 * - Connection state (connected, disconnected, error)
 * - Configuration metadata (URLs, regions, etc.)
 * - Available secret count
 *
 * @param context - REST API context containing authentication and base URL
 * @returns Promise resolving to an array of provider configurations
 *
 * @example
 * const providers = await getExternalSecretsProviders(context);
 * providers.forEach(p => {
 *   console.log(`${p.name}: ${p.state}`);
 * });
 *
 * @throws {Error} If the request fails or user lacks permission
 */
export const getExternalSecretsProviders = async (
	context: IRestApiContext,
): Promise<ExternalSecretsProvider[]> => {
	return await makeRestApiRequest(context, 'GET', '/external-secrets/providers');
};

/**
 * Get detailed information about a specific external secrets provider.
 *
 * This function retrieves the complete configuration and status of a single
 * external secrets provider, including sensitive connection details that
 * are not included in the list view.
 *
 * Use this when you need to:
 * - View the full configuration of a provider
 * - Check detailed connection status and diagnostics
 * - Retrieve provider-specific metadata
 *
 * @param context - REST API context containing authentication and base URL
 * @param id - The unique identifier of the provider to retrieve
 * @returns Promise resolving to the complete provider configuration
 *
 * @example
 * const provider = await getExternalSecretsProvider(context, 'vault-prod');
 * console.log(`URL: ${provider.data.url}`);
 * console.log(`Status: ${provider.state}`);
 *
 * @throws {Error} If the provider ID is invalid or doesn't exist
 * @throws {Error} If the user lacks permission to view this provider
 */
export const getExternalSecretsProvider = async (
	context: IRestApiContext,
	id: string,
): Promise<ExternalSecretsProvider> => {
	return await makeRestApiRequest(context, 'GET', `/external-secrets/providers/${id}`);
};

/**
 * Test the connection to an external secrets provider.
 *
 * This function validates that the provided configuration can successfully
 * connect to the external secrets service. It performs a live connection
 * test without modifying any existing configuration.
 *
 * The test verifies:
 * - Network connectivity to the provider
 * - Authentication credentials validity
 * - Required permissions for accessing secrets
 * - Provider-specific configuration correctness
 *
 * Use this before saving a new provider configuration or when troubleshooting
 * connection issues with an existing provider.
 *
 * @param context - REST API context containing authentication and base URL
 * @param id - The provider type identifier (e.g., 'vault', 'aws', 'azure')
 * @param data - Provider configuration data to test (URL, credentials, etc.)
 * @returns Promise resolving to test result with connection state
 *
 * @example
 * const result = await testExternalSecretsProviderConnection(
 *   context,
 *   'vault',
 *   {
 *     url: 'https://vault.example.com',
 *     token: 'hvs.xxxxx'
 *   }
 * );
 *
 * if (result.testState === 'connected') {
 *   console.log('Connection successful!');
 * }
 *
 * @throws {Error} If the test fails due to invalid configuration
 * @throws {Error} If the provider type is not supported
 */
export const testExternalSecretsProviderConnection = async (
	context: IRestApiContext,
	id: string,
	data: ExternalSecretsProvider['data'],
): Promise<{ testState: ExternalSecretsProvider['state'] }> => {
	return await makeRestApiRequest(context, 'POST', `/external-secrets/providers/${id}/test`, data);
};

/**
 * Update the configuration of an existing external secrets provider.
 *
 * This function modifies the settings of an already configured provider.
 * Changes may include updating credentials, changing URLs, or adjusting
 * provider-specific options.
 *
 * Important considerations:
 * - The provider will be temporarily disconnected during the update
 * - Workflows using secrets from this provider may fail during the update
 * - Validation is performed before applying changes
 * - Reverting to previous config requires manual reconfiguration
 *
 * @param context - REST API context containing authentication and base URL
 * @param id - The unique identifier of the provider to update
 * @param data - Updated provider configuration data
 * @returns Promise resolving to true if update was successful
 *
 * @example
 * const success = await updateProvider(context, 'vault-prod', {
 *   url: 'https://new-vault.example.com',
 *   token: 'hvs.new-token'
 * });
 *
 * @throws {Error} If the provider ID is invalid
 * @throws {Error} If the new configuration fails validation
 * @throws {Error} If the user lacks permission to update providers
 */
export const updateProvider = async (
	context: IRestApiContext,
	id: string,
	data: ExternalSecretsProvider['data'],
): Promise<boolean> => {
	return await makeRestApiRequest(context, 'POST', `/external-secrets/providers/${id}`, data);
};

/**
 * Reload secrets from an external provider.
 *
 * This function forces a refresh of the secret list from the external provider,
 * ensuring that n8n has the latest available secrets. This is useful when:
 * - New secrets have been added to the external provider
 * - Secrets have been deleted or renamed externally
 * - You suspect the cached secret list is outdated
 *
 * The reload operation:
 * - Fetches the current secret list from the provider
 * - Updates the internal cache
 * - Does not affect secret values themselves (values are always fetched fresh)
 * - May take several seconds for large secret stores
 *
 * @param context - REST API context containing authentication and base URL
 * @param id - The unique identifier of the provider to reload
 * @returns Promise resolving to an object indicating if secrets were updated
 *
 * @example
 * const result = await reloadProvider(context, 'vault-prod');
 * if (result.updated) {
 *   console.log('Secret list refreshed successfully');
 * }
 *
 * @throws {Error} If the provider is not connected
 * @throws {Error} If the provider ID is invalid
 * @throws {Error} If the reload operation fails
 */
export const reloadProvider = async (
	context: IRestApiContext,
	id: string,
): Promise<{ updated: boolean }> => {
	return await makeRestApiRequest(context, 'POST', `/external-secrets/providers/${id}/update`);
};

/**
 * Connect or disconnect an external secrets provider.
 *
 * This function controls the active state of a provider. When disconnected,
 * the provider's configuration is preserved but secrets are not accessible
 * to workflows.
 *
 * Use cases for disconnecting:
 * - Temporarily disable a provider during maintenance
 * - Test workflows without external dependencies
 * - Troubleshoot provider issues without deleting configuration
 * - Rotate credentials safely (disconnect, update, reconnect)
 *
 * Effects of disconnecting:
 * - Workflows using secrets from this provider will fail
 * - Secret list remains cached but won't be refreshed
 * - Provider configuration is preserved for reconnection
 *
 * @param context - REST API context containing authentication and base URL
 * @param id - The unique identifier of the provider
 * @param connected - True to connect the provider, false to disconnect
 * @returns Promise resolving to true if the operation was successful
 *
 * @example
 * // Disconnect a provider for maintenance
 * await connectProvider(context, 'vault-prod', false);
 *
 * // Reconnect after maintenance
 * await connectProvider(context, 'vault-prod', true);
 *
 * @throws {Error} If the provider ID is invalid
 * @throws {Error} If connection fails (when connecting)
 * @throws {Error} If the user lacks permission to manage providers
 */
export const connectProvider = async (
	context: IRestApiContext,
	id: string,
	connected: boolean,
): Promise<boolean> => {
	return await makeRestApiRequest(context, 'POST', `/external-secrets/providers/${id}/connect`, {
		connected,
	});
};
