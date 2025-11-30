/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type {
	CredentialsEntity,
	User,
	WorkflowEntity,
	TagEntity,
	AnnotationTagEntity,
} from '@newflow/db';
import { validate } from 'class-validator';

import type { PersonalizationSurveyAnswersV4 } from './controllers/survey-answers.dto';
import { BadRequestError } from './errors/response-errors/bad-request.error';

export async function validateEntity(
	entity:
		| WorkflowEntity
		| CredentialsEntity
		| TagEntity
		| AnnotationTagEntity
		| User
		| PersonalizationSurveyAnswersV4,
): Promise<void> {
	const errors = await validate(entity);

	const errorMessages = errors
		.reduce<string[]>((acc, cur) => {
			if (!cur.constraints) return acc;
			acc.push(...Object.values(cur.constraints));
			return acc;
		}, [])
		.join(' | ');

	if (errorMessages) {
		throw new BadRequestError(errorMessages);
	}
}

export const DEFAULT_EXECUTIONS_GET_ALL_LIMIT = 20;
