/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
import { registerDecorator, ValidatorConstraint } from 'class-validator';

const URL_REGEX = /^(https?:\/\/|www\.)|(\.[\p{L}\d-]+)/iu;

@ValidatorConstraint({ name: 'NoUrl', async: false })
class NoUrlConstraint implements ValidatorConstraintInterface {
	validate(value: string) {
		return !URL_REGEX.test(value);
	}

	defaultMessage() {
		return 'Potentially malicious string';
	}
}

export function NoUrl(options?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'NoUrl',
			target: object.constructor,
			propertyName,
			options,
			validator: NoUrlConstraint,
		});
	};
}
