/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { type AllRolesMap, PROJECT_OWNER_ROLE_SLUG } from '@newflow/permissions';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as rolesApi from '@newflow/rest-api-client/api/roles';
import { useRootStore } from '@newflow/stores/useRootStore';

export const useRolesStore = defineStore('roles', () => {
	const rootStore = useRootStore();

	const roles = ref<AllRolesMap>({
		global: [],
		project: [],
		credential: [],
		workflow: [],
	});
	const projectRoleOrder = ref<string[]>(['project:viewer', 'project:editor', 'project:admin']);
	const projectRoleOrderMap = computed<Map<string, number>>(
		() => new Map(projectRoleOrder.value.map((role, idx) => [role, idx])),
	);

	const processedProjectRoles = computed<AllRolesMap['project']>(() =>
		roles.value.project
			.filter((role) => role.slug !== PROJECT_OWNER_ROLE_SLUG)
			.sort(
				(a, b) =>
					(projectRoleOrderMap.value.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
					(projectRoleOrderMap.value.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
			),
	);

	const processedCredentialRoles = computed<AllRolesMap['credential']>(() =>
		roles.value.credential.filter((role) => role.slug !== 'credential:owner'),
	);

	const processedWorkflowRoles = computed<AllRolesMap['workflow']>(() =>
		roles.value.workflow.filter((role) => role.slug !== 'workflow:owner'),
	);

	const fetchRoles = async () => {
		roles.value = await rolesApi.getRoles(rootStore.restApiContext);
	};

	return {
		roles,
		processedProjectRoles,
		processedCredentialRoles,
		processedWorkflowRoles,
		fetchRoles,
	};
});
