/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { LicenseState, Logger } from '@newflow/backend-common';
import type { User } from '@newflow/db';
import { WorkflowRepository } from '@newflow/db';
import { Service } from '@newflow/di';
// NewFlow: axios import removed - no longer connecting to n8n servers
// import axios, { AxiosError } from 'axios';
// import { ensureError } from 'n8n-workflow';

import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { EventService } from '@/events/event.service';
import { License } from '@/license';
import { UrlService } from '@/services/url.service';

type LicenseError = Error & { errorId?: keyof typeof LicenseErrors };

export const LicenseErrors = {
	SCHEMA_VALIDATION: 'Activation key is in the wrong format',
	RESERVATION_EXHAUSTED: 'Activation key has been used too many times',
	RESERVATION_EXPIRED: 'Activation key has expired',
	NOT_FOUND: 'Activation key not found',
	RESERVATION_CONFLICT: 'Activation key not found',
	RESERVATION_DUPLICATE: 'Activation key has already been used on this instance',
};

@Service()
export class LicenseService {
	constructor(
		private readonly logger: Logger,
		private readonly license: License,
		private readonly licenseState: LicenseState,
		private readonly workflowRepository: WorkflowRepository,
		private readonly urlService: UrlService,
		private readonly eventService: EventService,
	) {}

	async getLicenseData() {
		const triggerCount = await this.workflowRepository.getActiveTriggerCount();
		const workflowsWithEvaluationsCount =
			await this.workflowRepository.getWorkflowsWithEvaluationCount();
		const mainPlan = this.license.getMainPlan();

		return {
			usage: {
				activeWorkflowTriggers: {
					value: triggerCount,
					limit: this.license.getTriggerLimit(),
					warningThreshold: 0.8,
				},
				workflowsHavingEvaluations: {
					value: workflowsWithEvaluationsCount,
					limit: this.licenseState.getMaxWorkflowsWithEvaluations(),
				},
			},
			license: {
				planId: mainPlan?.productId ?? '',
				planName: this.license.getPlanName(),
			},
		};
	}

	// NewFlow: Stub - Enterprise trial has been removed (offline mode)
	async requestEnterpriseTrial(user: User) {
		this.logger.info('Enterprise trial request skipped - offline mode', {
			email: user.email,
		});
		throw new BadRequestError(
			'Enterprise trial is not available in offline mode. All features are already enabled.',
		);
	}

	// NewFlow: Stub - Community registration has been removed (offline mode)
	async registerCommunityEdition({
		userId,
		email,
		instanceId,
		instanceUrl,
		licenseType,
	}: {
		userId: User['id'];
		email: string;
		instanceId: string;
		instanceUrl: string;
		licenseType: string;
	}): Promise<{ title: string; text: string }> {
		this.logger.info('Community edition registration skipped - offline mode', {
			email,
			instanceId,
			licenseType,
		});

		// Return a success message without contacting n8n servers
		return {
			title: 'NewFlow is ready to use',
			text: 'All features are already enabled in offline mode. No registration required.',
		};
	}

	getManagementJwt(): string {
		return this.license.getManagementJwt();
	}

	async activateLicense(activationKey: string) {
		try {
			await this.license.activate(activationKey);
		} catch (e) {
			const message = this.mapErrorMessage(e as LicenseError, 'activate');
			throw new BadRequestError(message);
		}
	}

	async renewLicense() {
		if (this.license.getPlanName() === 'Community') return; // unlicensed, nothing to renew

		try {
			await this.license.renew();
		} catch (e) {
			const message = this.mapErrorMessage(e as LicenseError, 'renew');

			this.eventService.emit('license-renewal-attempted', { success: false });
			throw new BadRequestError(message);
		}

		this.eventService.emit('license-renewal-attempted', { success: true });
	}

	private mapErrorMessage(error: LicenseError, action: 'activate' | 'renew') {
		let message = error.errorId && LicenseErrors[error.errorId];
		if (!message) {
			message = `Failed to ${action} license: ${error.message}`;
			this.logger.error(message, { stack: error.stack ?? 'n/a' });
		}
		return message;
	}
}
