/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { faker } from '@faker-js/faker';
import type { IUser } from '@newflow/rest-api-client/api/users';
import { SignInType } from '@/constants';

export const createUser = (overrides?: Partial<IUser>): IUser => ({
	id: faker.string.uuid(),
	email: faker.internet.email(),
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
	isDefaultUser: false,
	isPending: false,
	isPendingUser: false,
	mfaEnabled: false,
	signInType: SignInType.EMAIL,
	...overrides,
});
