/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { execSync } from 'child_process';

import { runCommand } from './child-process';

type GitUser = {
	name?: string;
	email?: string;
};

export function tryReadGitUser(): GitUser {
	const user: GitUser = { name: '', email: '' };

	try {
		const name = execSync('git config --get user.name', {
			stdio: ['pipe', 'pipe', 'ignore'],
		})
			.toString()
			.trim();
		if (name) user.name = name;
	} catch {
		// ignore
	}

	try {
		const email = execSync('git config --get user.email', {
			stdio: ['pipe', 'pipe', 'ignore'],
		})
			.toString()
			.trim();
		if (email) user.email = email;
	} catch {
		// ignore
	}

	return user;
}

export async function initGit(dir: string): Promise<void> {
	await runCommand('git', ['init', '-b', 'main'], { cwd: dir });
}
