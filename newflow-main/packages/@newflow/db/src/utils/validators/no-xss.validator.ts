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
import xss from 'xss';

@ValidatorConstraint({ name: 'NoXss', async: false })
class NoXssConstraint implements ValidatorConstraintInterface {
	validate(value: unknown) {
		if (typeof value !== 'string') return false;

		return (
			value ===
			xss(value, {
				whiteList: {}, // no tags are allowed
			})
		);
	}

	defaultMessage() {
		return 'Potentially malicious string';
	}
}

export function NoXss(options?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'NoXss',
			target: object.constructor,
			propertyName,
			options,
			validator: NoXssConstraint,
		});
	};
}
