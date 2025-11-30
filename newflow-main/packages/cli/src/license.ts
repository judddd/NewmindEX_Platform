/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: License system simplified for offline use - all features enabled
import type { LicenseProvider } from '@newflow/backend-common';
import { Logger } from '@newflow/backend-common';
import { GlobalConfig } from '@newflow/config';
import {
	LICENSE_FEATURES,
	LICENSE_QUOTAS,
	UNLIMITED_LICENSE_QUOTA,
	type BooleanLicenseFeature,
	type NumericLicenseFeature,
} from '@newflow/constants';
import { SettingsRepository } from '@newflow/db';
import { OnLeaderStepdown, OnLeaderTakeover, OnPubSubEvent, OnShutdown } from '@newflow/decorators';
import { Service } from '@newflow/di';
import type { TEntitlement, TLicenseBlock } from '@n8n_io/license-sdk';
import { InstanceSettings } from 'n8n-core';

import { LicenseMetricsService } from '@/metrics/license-metrics.service';

import { SETTINGS_LICENSE_CERT_KEY } from './constants';

export type FeatureReturnType = Partial<
	{
		planName: string;
	} & { [K in NumericLicenseFeature]: number } & { [K in BooleanLicenseFeature]: boolean }
>;

@Service()
export class License implements LicenseProvider {
	constructor(
		private readonly logger: Logger,
		private readonly instanceSettings: InstanceSettings,
		private readonly settingsRepository: SettingsRepository,
		private readonly licenseMetricsService: LicenseMetricsService,
		private readonly globalConfig: GlobalConfig,
	) {
		this.logger = this.logger.scoped('license');
	}

	// NewFlow: Simplified initialization - no remote license check
	async init({
		forceRecreate = false,
		isCli = false,
	}: { forceRecreate?: boolean; isCli?: boolean } = {}) {
		this.logger.info('License system initialized in offline mode - all features enabled');
	}

	async loadCertStr(): Promise<TLicenseBlock> {
		return '';
	}

	async saveCertStr(value: TLicenseBlock): Promise<void> {
		// No-op
	}

	async activate(activationKey: string): Promise<void> {
		this.logger.info('License activation skipped - offline mode');
	}

	@OnPubSubEvent('reload-license')
	async reload(): Promise<void> {
		// No-op
	}

	async renew() {
		// No-op
	}

	async clear() {
		// No-op
	}

	@OnShutdown()
	async shutdown() {
		this.logger.debug('License shut down');
	}

	// NewFlow: All license checks return true (all features enabled)
	isLicensed(feature: BooleanLicenseFeature) {
		return true;
	}

	isSharingEnabled() {
		return true;
	}

	isLogStreamingEnabled() {
		return false; // NewFlow: Feature removed
	}

	isLdapEnabled() {
		return false; // NewFlow: Feature removed
	}

	isSamlEnabled() {
		return false; // NewFlow: Feature removed
	}

	isApiKeyScopesEnabled() {
		return true;
	}

	isAiAssistantEnabled() {
		return true;
	}

	isAskAiEnabled() {
		return true;
	}

	isAiCreditsEnabled() {
		return true;
	}

	isAdvancedExecutionFiltersEnabled() {
		return true;
	}

	isAdvancedPermissionsLicensed() {
		return true;
	}

	isDebugInEditorLicensed() {
		return true;
	}

	isBinaryDataS3Licensed() {
		return true;
	}

	isMultiMainLicensed() {
		return false; // NewFlow: Feature removed
	}

	isVariablesEnabled() {
		return false; // NewFlow: Feature removed
	}

	isSourceControlLicensed() {
		return false; // NewFlow: Feature removed
	}

	isExternalSecretsEnabled() {
		return false; // NewFlow: Feature removed
	}

	isWorkflowHistoryLicensed() {
		return true; // NewFlow: Rewritten as self-controlled feature
	}

	isAPIDisabled() {
		return false; // API always enabled
	}

	isWorkerViewLicensed() {
		return true;
	}

	isProjectRoleAdminLicensed() {
		return true;
	}

	isProjectRoleEditorLicensed() {
		return true;
	}

	isProjectRoleViewerLicensed() {
		return true;
	}

	isCustomNpmRegistryEnabled() {
		return true;
	}

	isFoldersEnabled() {
		return true;
	}

	getCurrentEntitlements() {
		return [];
	}

	getValue<T extends keyof FeatureReturnType>(feature: T): FeatureReturnType[T] {
		// NewFlow: Return unlimited quotas
		if (feature === 'planName') {
			return 'NewFlow Enterprise' as FeatureReturnType[T];
		}
		return UNLIMITED_LICENSE_QUOTA as FeatureReturnType[T];
	}

	getManagementJwt(): string {
		return '';
	}

	getMainPlan(): TEntitlement | undefined {
		return undefined;
	}

	getConsumerId() {
		return this.instanceSettings.instanceId;
	}

	// Helper functions for computed data - all return unlimited
	getUsersLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getTriggerLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getVariablesLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getAiCredits() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getWorkflowHistoryPruneLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getTeamProjectLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getPlanName(): string {
		return 'NewFlow Enterprise';
	}

	getInfo(): string {
		return 'NewFlow Enterprise - Offline Mode (All Features Enabled)';
	}

	isWithinUsersLimit() {
		return true;
	}

	@OnLeaderTakeover()
	enableAutoRenewals() {
		// No-op
	}

	@OnLeaderStepdown()
	disableAutoRenewals() {
		// No-op
	}
}
