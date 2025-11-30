/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { User } from '@newflow/db';
import {
	ApiKeyRepository,
	GLOBAL_OWNER_ROLE,
	SettingsRepository,
	UserRepository,
	generateNanoId,
} from '@newflow/db';
import { Service } from '@newflow/di';
import { GlobalConfig } from '@newflow/config';
import { Logger } from '@newflow/backend-common';
import config from '@/config';
import { PasswordUtility } from '@/services/password.utility';
import { PublicApiKeyService } from '@/services/public-api-key.service';
import { getApiKeyScopesForRole } from '@newflow/permissions';

/**
 * NewFlow: Auto-setup service for appliance/offline deployments
 * Automatically creates default owner user and predefined API key on first startup
 */
@Service()
export class AutoSetupService {
	constructor(
		private readonly logger: Logger,
		private readonly globalConfig: GlobalConfig,
		private readonly userRepository: UserRepository,
		private readonly settingsRepository: SettingsRepository,
		private readonly passwordUtility: PasswordUtility,
		private readonly publicApiKeyService: PublicApiKeyService,
		private readonly apiKeyRepository: ApiKeyRepository,
	) {
		this.logger = logger.scoped('license');
	}

	/**
	 * Main entry point for auto-setup
	 * Checks if setup is needed and creates default user + API key
	 */
	async ensureAutoSetup(): Promise<void> {
		const isSetUp = config.getEnv('userManagement.isInstanceOwnerSetUp');

		if (isSetUp) {
			this.logger.debug('Instance already set up, skipping auto-setup');
			return;
		}

		this.logger.info('Starting auto-setup for appliance mode...');

		try {
			// Create default owner user
			const user = await this.createDefaultUser();
			this.logger.info(`Default owner user created: ${user.email}`);

			// Create predefined API key
			const apiKey = await this.createPredefinedApiKey(user);
			this.logger.info('Predefined API key created successfully');
			this.logger.warn('═'.repeat(80));
			this.logger.warn('IMPORTANT: Save this API key for MCP tool integration:');
			this.logger.warn(`API Key: ${apiKey}`);
			this.logger.warn('This key will not be shown again!');
			this.logger.warn('═'.repeat(80));

			// Mark setup as complete
			await this.settingsRepository.update(
				{ key: 'userManagement.isInstanceOwnerSetUp' },
				{ value: JSON.stringify(true) },
			);

			config.set('userManagement.isInstanceOwnerSetUp', true);

			this.logger.info('Auto-setup completed successfully');
		} catch (error) {
			this.logger.error('Auto-setup failed', {
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Creates default owner user with personal project
	 */
	private async createDefaultUser(): Promise<User> {
		const { autoSetupEmail, autoSetupPassword } = this.globalConfig.credentials;

		// Check if shell owner already exists
		let owner = await this.userRepository.findOne({
			where: { role: { slug: GLOBAL_OWNER_ROLE.slug } },
			relations: ['role'],
		});

		if (owner) {
			// Update existing shell owner
			owner.email = autoSetupEmail;
			owner.firstName = 'Admin';
			owner.lastName = 'User';
			owner.password = await this.passwordUtility.hash(autoSetupPassword);
			owner = await this.userRepository.save(owner, { transaction: false });
		} else {
			// Create new owner user with personal project
			const result = await this.userRepository.createUserWithProject({
				email: autoSetupEmail,
				firstName: 'Admin',
				lastName: 'User',
				password: await this.passwordUtility.hash(autoSetupPassword),
				role: {
					slug: GLOBAL_OWNER_ROLE.slug,
				},
			});
			owner = result.user;
		}

		return owner;
	}

	/**
	 * Creates predefined API key or generates one if not provided
	 */
	private async createPredefinedApiKey(user: User): Promise<string> {
		let apiKey = this.globalConfig.credentials.predefinedApiKey?.trim();

		// Generate API key if not predefined
		if (!apiKey) {
			this.logger.debug('No predefined API key, generating new one...');
			const newApiKey = await this.publicApiKeyService.createPublicApiKeyForUser(user, {
				label: 'Predefined: MCP Tool Integration',
				scopes: getApiKeyScopesForRole(user),
				expiresAt: null,
			});
			return newApiKey.apiKey;
		}

		// Use predefined API key
		this.logger.debug('Using predefined API key from environment');

		// Check if API key already exists
		const existing = await this.apiKeyRepository.findOne({
			where: { apiKey },
		});

		if (existing) {
			this.logger.debug('Predefined API key already exists in database');
			return apiKey;
		}

		// Insert predefined API key with generated ID
		await this.apiKeyRepository.insert({
			id: generateNanoId(),
			userId: user.id,
			apiKey,
			label: 'Predefined: MCP Tool Integration',
			scopes: getApiKeyScopesForRole(user),
		});

		return apiKey;
	}
}
