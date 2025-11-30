/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { NativeDoc } from '../extensions/extensions';

export const booleanMethods: NativeDoc = {
	typeName: 'Boolean',
	functions: {
		toString: {
			doc: {
				name: 'toString',
				description:
					"Converts <code>true</code> to the string <code>'true'</code> and <code>false</code> to the string <code>'false'</code>.",
				examples: [
					{ example: 'true.toString()', evaluated: "'true'" },
					{ example: 'false.toString()', evaluated: "'false'" },
				],
				docURL:
					'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean/toString',
				returnType: 'string',
			},
		},
	},
};
