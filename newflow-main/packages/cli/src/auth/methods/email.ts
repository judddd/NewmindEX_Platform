/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { User } from '@newflow/db';
import { UserRepository } from '@newflow/db';
import { Container } from '@newflow/di';

import { AuthError } from '@/errors/response-errors/auth.error';
import { EventService } from '@/events/event.service';
import { PasswordUtility } from '@/services/password.utility';

export const handleEmailLogin = async (
	email: string,
	password: string,
): Promise<User | undefined> => {
	const user = await Container.get(UserRepository).findOne({
		where: { email },
		relations: ['authIdentities', 'role'],
	});

	if (user?.password && (await Container.get(PasswordUtility).compare(password, user.password))) {
		return user;
	}

	// LDAP enterprise feature has been removed

	return undefined;
};
