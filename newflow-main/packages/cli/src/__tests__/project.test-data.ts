/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Project } from '@newflow/db';
import { nanoId, date, firstName, lastName, email } from 'minifaker';
import 'minifaker/locales/en';

type RawProjectData = Pick<Project, 'name' | 'type' | 'createdAt' | 'updatedAt' | 'id'>;

const projectName = `${firstName()} ${lastName()} <${email}>`;

export const createRawProjectData = (payload: Partial<RawProjectData>): Project => {
	return {
		createdAt: date(),
		updatedAt: date(),
		id: nanoId.nanoid(),
		name: projectName,
		type: 'personal',
		...payload,
	} as Project;
};
