/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// Simplified permission checks - all checks return true (no restrictions)
// Replaced Enterprise Edition permission system

import type { Scope } from '@newflow/permissions';

/**
 * Check if a user has the required scopes
 * Simplified: always returns true (all users have all permissions)
 */
export async function userHasScopes(
	user: any,
	scopes: Scope[],
	globalOnly: boolean = false,
	options?: { credentialId?: string; workflowId?: string; projectId?: string },
): Promise<boolean> {
	return true;
}
