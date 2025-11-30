/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import { SignInType } from '@/constants';
import type { IUser } from '@newflow/rest-api-client/api/users';

export const userFactory = Factory.extend<IUser>({
	id(i: number) {
		return `${i}`;
	},
	firstName() {
		return faker.name.firstName();
	},
	lastName() {
		return faker.name.lastName();
	},
	isDefaultUser() {
		return false;
	},
	isPending() {
		return false;
	},
	isPendingUser() {
		return false;
	},
	signInType(): SignInType {
		return SignInType.EMAIL;
	},
	mfaEnabled() {
		return false;
	},
});
