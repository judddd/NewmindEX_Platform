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
import type { ICredentialsResponse } from '@/Interface';

export const credentialFactory = Factory.extend<ICredentialsResponse>({
	id(i: number) {
		return `${i}`;
	},
	createdAt() {
		return faker.date.recent().toISOString();
	},
	name() {
		return faker.company.name();
	},
	type() {
		return 'notionApi';
	},
	updatedAt() {
		return '';
	},
	isManaged() {
		return false;
	},
});
