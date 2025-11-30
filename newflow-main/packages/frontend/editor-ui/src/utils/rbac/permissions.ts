/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import {
	hasRole,
	hasScope,
	isAuthenticated,
	isDefaultUser,
	isInstanceOwner,
	isEnterpriseFeatureEnabled,
	isGuest,
	isValid,
} from '@/utils/rbac/checks';
import type { PermissionType, PermissionTypeOptions, RBACPermissionCheck } from '@/types/rbac';

type Permissions = {
	[key in PermissionType]: RBACPermissionCheck<PermissionTypeOptions[key]>;
};

export const permissions: Permissions = {
	authenticated: isAuthenticated,
	custom: isValid,
	defaultUser: isDefaultUser,
	instanceOwner: isInstanceOwner,
	enterprise: isEnterpriseFeatureEnabled,
	guest: isGuest,
	rbac: hasScope,
	role: hasRole,
};

export function hasPermission(
	permissionNames: PermissionType[],
	options?: Partial<PermissionTypeOptions>,
) {
	// 强制返回 true，跳过所有权限检查，解锁所有企业功能
	return true;

	// 原始代码（已注释）
	// let valid = true;
	// for (const permissionName of permissionNames) {
	// 	const permissionOptions = options?.[permissionName] ?? {};
	// 	const permissionFn = permissions[permissionName] as RBACPermissionCheck<unknown>;
	// 	valid = valid && permissionFn(permissionOptions);
	// }
	// return valid;
}
