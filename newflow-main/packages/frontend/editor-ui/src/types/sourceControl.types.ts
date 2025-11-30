/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { TupleToUnion } from '@/utils/typeHelpers';

export type SshKeyTypes = ['ed25519', 'rsa'];

export type SourceControlPreferences = {
	connected: boolean;
	repositoryUrl: string;
	branchName: string;
	branches: string[];
	branchReadOnly: boolean;
	branchColor: string;
	publicKey?: string;
	keyGeneratorType?: TupleToUnion<SshKeyTypes>;
	currentBranch?: string;
};

export interface SourceControlStatus {
	ahead: number;
	behind: number;
	conflicted: string[];
	created: string[];
	current: string;
	deleted: string[];
	detached: boolean;
	files: Array<{
		path: string;
		index: string;
		working_dir: string;
	}>;
	modified: string[];
	not_added: string[];
	renamed: string[];
	staged: string[];
	tracking: null;
}
