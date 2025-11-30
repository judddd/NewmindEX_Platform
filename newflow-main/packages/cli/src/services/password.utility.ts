/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service as Utility } from '@newflow/di';
import { compare, hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

@Utility()
export class PasswordUtility {
	async hash(plaintext: string) {
		return await hash(plaintext, SALT_ROUNDS);
	}

	async compare(plaintext: string, hashed: string | null) {
		if (hashed === null) {
			return false;
		}
		return await compare(plaintext, hashed);
	}
}
