/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// Simplified permissions module - all permissions allowed
// Removed commercial Enterprise Edition code

import { z } from 'zod';

export type Scope = string;
export type ProjectRole = string;
export type WorkflowSharingRole = string;
export type CredentialSharingRole = string;
export type GlobalRole = string;
export type ApiKeyScope = string;
export type AssignableProjectRole =
	| 'project:admin'
	| 'project:editor'
	| 'project:viewer'
	| 'project:personalOwner';
export type AssignableGlobalRole = 'global:owner' | 'global:admin' | 'global:member';

// Role namespace type
export type RoleNamespace = 'global' | 'project' | 'workflow' | 'credential';

// Role definition structure
export type Role = {
	slug: string;
	displayName: string;
	description: string | null;
	scopes: Scope[];
	roleType?: RoleNamespace;
	licensed?: boolean;
	usedByUsers?: number; // Number of users with this role
};

export type AuthPrincipal = {
	id: string;
	scopes?: Scope[];
};

// Role maps
export type AllRolesMap = {
	global: Role[];
	project: Role[];
	workflow: Role[];
	credential: Role[];
};

export const PROJECT_OWNER_ROLE_SLUG = 'project:personalOwner';
export const PROJECT_ADMIN_ROLE_SLUG = 'project:admin';
export const PROJECT_EDITOR_ROLE_SLUG = 'project:editor';
export const PROJECT_VIEWER_ROLE_SLUG = 'project:viewer';

// API Key Scopes - Basic CRUD operations for different resources
export const API_KEY_SCOPES = [
	// Workflow scopes
	'workflow:create',
	'workflow:read',
	'workflow:update',
	'workflow:delete',
	'workflow:list',
	'workflow:execute',
	'workflow:share',

	// Credential scopes
	'credential:create',
	'credential:read',
	'credential:update',
	'credential:delete',
	'credential:list',
	'credential:share',

	// Execution scopes
	'execution:read',
	'execution:list',
	'execution:delete',

	// Tag scopes
	'tag:create',
	'tag:read',
	'tag:update',
	'tag:delete',
	'tag:list',

	// User scopes (admin only)
	'user:create',
	'user:read',
	'user:update',
	'user:delete',
	'user:list',

	// Audit scopes (admin only)
	'auditLog:manage',

	// Variable scopes
	'variable:create',
	'variable:read',
	'variable:update',
	'variable:delete',
	'variable:list',

	// Source control scopes
	'sourceControl:pull',
	'sourceControl:push',
	'sourceControl:manage',
] as const;

export type ApiKeyScopeType = (typeof API_KEY_SCOPES)[number];

// Scopes available to different roles
export const GLOBAL_OWNER_SCOPES = [...API_KEY_SCOPES] as Scope[];
export const GLOBAL_ADMIN_SCOPES = API_KEY_SCOPES.filter((scope) => !scope.startsWith('auditLog:'));
export const GLOBAL_MEMBER_SCOPES = API_KEY_SCOPES.filter(
	(scope) =>
		!scope.startsWith('user:') &&
		!scope.startsWith('auditLog:') &&
		!scope.startsWith('sourceControl:manage'),
);
export const ALL_SCOPES = [...API_KEY_SCOPES] as Scope[];

// Stub role definitions (minimal structure)
export const ALL_ROLES: AllRolesMap = {
	global: [
		{
			slug: 'global:owner',
			displayName: 'Owner',
			description: 'Owner',
			scopes: [],
			roleType: 'global',
			licensed: true,
		},
		{
			slug: 'global:admin',
			displayName: 'Admin',
			description: 'Admin',
			scopes: [],
			roleType: 'global',
			licensed: true,
		},
		{
			slug: 'global:member',
			displayName: 'Member',
			description: 'Member',
			scopes: [],
			roleType: 'global',
			licensed: true,
		},
	],
	project: [
		{
			slug: 'project:personalOwner',
			displayName: 'Personal Owner',
			description: 'Personal Owner',
			scopes: [],
			roleType: 'project',
			licensed: true,
		},
		{
			slug: 'project:admin',
			displayName: 'Admin',
			description: 'Admin',
			scopes: [],
			roleType: 'project',
			licensed: true,
		},
		{
			slug: 'project:editor',
			displayName: 'Editor',
			description: 'Editor',
			scopes: [],
			roleType: 'project',
			licensed: true,
		},
		{
			slug: 'project:viewer',
			displayName: 'Viewer',
			description: 'Viewer',
			scopes: [],
			roleType: 'project',
			licensed: true,
		},
	],
	workflow: [
		{
			slug: 'workflow:owner',
			displayName: 'Owner',
			description: 'Owner',
			scopes: [],
			roleType: 'workflow',
			licensed: true,
		},
		{
			slug: 'workflow:editor',
			displayName: 'Editor',
			description: 'Editor',
			scopes: [],
			roleType: 'workflow',
			licensed: true,
		},
	],
	credential: [
		{
			slug: 'credential:owner',
			displayName: 'Owner',
			description: 'Owner',
			scopes: [],
			roleType: 'credential',
			licensed: true,
		},
		{
			slug: 'credential:user',
			displayName: 'User',
			description: 'User',
			scopes: [],
			roleType: 'credential',
			licensed: true,
		},
	],
};

// Export individual role arrays
export const PROJECT_ROLES = ALL_ROLES.project;
export const WORKFLOW_ROLES = ALL_ROLES.workflow;
export const CREDENTIAL_ROLES = ALL_ROLES.credential;

// Zod schemas (simplified, always pass validation)
export const scopeSchema = z.string();
export const assignableGlobalRoleSchema = z.enum(['global:owner', 'global:admin', 'global:member']);
export const assignableProjectRoleSchema = z.enum([
	'project:admin',
	'project:editor',
	'project:viewer',
]);
export const projectRoleSchema = z.enum([
	'project:admin',
	'project:editor',
	'project:viewer',
	'project:personalOwner',
]);

// All scope checks return true (no restrictions)
export function hasGlobalScope(
	user: any,
	scope: Scope | Scope[],
	options?: { mode?: 'allOf' | 'anyOf' },
): boolean {
	return true;
}

export function hasScope(user: any, scope: Scope | Scope[], resources?: any): boolean {
	return true;
}

export function combineScopes(...scopes: (Scope[] | Record<string, Scope[]>)[]): Scope[] {
	return [];
}

export function getGlobalScopes(role: string | any): Scope[] {
	return [];
}

export function getRoleScopes(role: any): Scope[] {
	return [];
}

export function staticRolesWithScope(namespace: RoleNamespace, scopes?: Scope[]): string[] {
	return [];
}

export function getResourcePermissions(scopes?: Scope[]): any {
	return {
		workflow: {
			create: true,
			read: true,
			update: true,
			delete: true,
			share: true,
			move: true,
			list: true,
		},
		credential: {
			create: true,
			read: true,
			update: true,
			delete: true,
			share: true,
			move: true,
			list: true,
		},
		project: { create: true, read: true, update: true, delete: true, list: true },
		user: { create: true, read: true, update: true, delete: true, list: true },
		folder: { create: true, read: true, update: true, delete: true, list: true },
		community: { register: true },
		insights: { list: true, view: true },
		dataStore: { create: true, read: true, update: true, delete: true, list: true },
	};
}

// API key scopes - return appropriate scopes based on user role
export function getApiKeyScopesForRole(params: { role: Role } | string | any): Scope[] {
	// Handle different parameter formats
	let roleSlug: string;

	if (typeof params === 'string') {
		roleSlug = params;
	} else if (params && typeof params === 'object' && 'role' in params) {
		roleSlug = params.role?.slug || params.role;
	} else {
		roleSlug = params?.slug || '';
	}

	// Return scopes based on role
	switch (roleSlug) {
		case 'global:owner':
			return GLOBAL_OWNER_SCOPES;
		case 'global:admin':
			return GLOBAL_ADMIN_SCOPES;
		case 'global:member':
			return GLOBAL_MEMBER_SCOPES;
		default:
			// Default to member scopes for unknown roles
			return GLOBAL_MEMBER_SCOPES;
	}
}

export function getOwnerOnlyApiKeyScopes(): Scope[] {
	return ['auditLog:manage'] as Scope[];
}

// Get scopes for an auth principal (user or API key)
export function getAuthPrincipalScopes(principal: any, types?: string[]): Scope[] {
	return [];
}

// Check if a role is built-in (system role)
export function isBuiltInRole(role: any): boolean {
	return true;
}

// Scope information with index signature
export const scopeInformation: Record<string, { displayName: string; description: string | null }> =
	{};
