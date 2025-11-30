/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Extension, ExtensionMap } from './extensions';

export function toBoolean(value: boolean) {
	return value;
}

export function toInt(value: boolean) {
	return value ? 1 : 0;
}

export function toDateTime() {
	return undefined;
}

const toFloat = toInt;
const toNumber: Extension = toInt.bind({});

toNumber.doc = {
	name: 'toNumber',
	description:
		'Converts <code>true</code> to <code>1</code> and <code>false</code> to <code>0</code>.',
	examples: [
		{ example: 'true.toNumber()', evaluated: '1' },
		{ example: 'false.toNumber()', evaluated: '0' },
	],
	section: 'cast',
	returnType: 'number',
	docURL:
		'http://newflow.ee/code/builtin/data-transformation-functions/booleans/#boolean-toNumber',
};

export const booleanExtensions: ExtensionMap = {
	typeName: 'Boolean',
	functions: {
		toBoolean,
		toInt,
		toFloat,
		toNumber,
		toDateTime,
	},
};
