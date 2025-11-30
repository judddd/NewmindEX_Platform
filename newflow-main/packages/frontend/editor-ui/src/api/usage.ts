/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: License Management API removed - stub for compatibility
import type { CommunityRegisteredRequestDto } from '@newflow/api-types';
import type { UsageState } from '@/Interface';
import type { IRestApiContext } from '@newflow/rest-api-client';

const DEFAULT_LICENSE_DATA: UsageState['data'] = {
	usage: {
		activeWorkflowTriggers: {
			limit: -1,
			value: 0,
			warningThreshold: 0.8,
		},
		workflowsHavingEvaluations: {
			value: 0,
			limit: 0,
		},
	},
	license: {
		planId: '',
		planName: 'Community',
	},
};

export const getLicense = async (_context: IRestApiContext): Promise<UsageState['data']> => {
	return DEFAULT_LICENSE_DATA;
};

export const activateLicenseKey = async (
	_context: IRestApiContext,
	_data: { activationKey: string },
): Promise<UsageState['data']> => {
	throw new Error('License activation has been removed');
};

export const renewLicense = async (_context: IRestApiContext): Promise<UsageState['data']> => {
	return DEFAULT_LICENSE_DATA;
};

export const requestLicenseTrial = async (
	_context: IRestApiContext,
): Promise<UsageState['data']> => {
	throw new Error('Enterprise license trial has been removed');
};

export const registerCommunityEdition = async (
	_context: IRestApiContext,
	_params: CommunityRegisteredRequestDto,
): Promise<{ title: string; text: string }> => {
	return { title: '', text: '' };
};
