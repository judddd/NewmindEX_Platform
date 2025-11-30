/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: License Management feature removed - stub store for compatibility
import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import type { UsageState } from '@/Interface';
import { useSettingsStore } from '@/stores/settings.store';

export type UsageTelemetry = {
	instance_id: string;
	action: 'view_plans' | 'manage_plan' | 'add_activation_key' | 'desktop_view_plans';
	plan_name_current: string;
	usage: number;
	quota: number;
};

const DEFAULT_PLAN_NAME = 'Community';
const DEFAULT_STATE: UsageState = {
	loading: false,
	data: {
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
			planName: DEFAULT_PLAN_NAME,
		},
	},
};

export const useUsageStore = defineStore('usage', () => {
	const settingsStore = useSettingsStore();

	const state = reactive<UsageState>({ ...DEFAULT_STATE });

	// NewFlow: Always Community plan - no license activation
	const planName = computed(() => DEFAULT_PLAN_NAME);
	const planId = computed(() => '');
	const activeWorkflowTriggersLimit = computed(() => -1);
	const activeWorkflowTriggersCount = computed(() => 0);
	const workflowsWithEvaluationsLimit = computed(() => 0);
	const workflowsWithEvaluationsCount = computed(() => 0);
	const executionPercentage = computed(() => 0);
	const instanceId = computed(() => settingsStore.settings.instanceId);
	const managementToken = computed(() => '');
	const appVersion = computed(() => settingsStore.settings.versionCli);

	// NewFlow: License management disabled
	const setLoading = (_loading: boolean) => {
		// No-op
	};

	const setData = (_data: UsageState['data']) => {
		// No-op
	};

	const getLicenseInfo = async () => {
		// No-op - always returns default state
	};

	const activateLicense = async (_activationKey: string) => {
		throw new Error('License activation has been removed');
	};

	const refreshLicenseManagementToken = async () => {
		// No-op
	};

	const requestEnterpriseLicenseTrial = async () => {
		throw new Error('Enterprise license trial has been removed');
	};

	const registerCommunityEdition = async (_email: string) => {
		// No-op
	};

	return {
		setLoading,
		getLicenseInfo,
		setData,
		activateLicense,
		refreshLicenseManagementToken,
		requestEnterpriseLicenseTrial,
		registerCommunityEdition,
		planName,
		planId,
		activeWorkflowTriggersLimit,
		activeWorkflowTriggersCount,
		workflowsWithEvaluationsLimit,
		workflowsWithEvaluationsCount,
		executionPercentage,
		instanceId,
		managementToken,
		appVersion,
		isCloseToLimit: computed(() => false),
		viewPlansUrl: computed(() => ''),
		managePlanUrl: computed(() => ''),
		isLoading: computed(() => false),
		telemetryPayload: computed<UsageTelemetry>(() => ({
			instance_id: instanceId.value,
			action: 'view_plans',
			plan_name_current: DEFAULT_PLAN_NAME,
			usage: 0,
			quota: -1,
		})),
	};
});
