/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { arrayMethods } from './array.methods';
import { booleanMethods } from './boolean.methods';
import { numberMethods } from './number.methods';
import { objectMethods } from './object.methods';
import { stringMethods } from './string.methods';
import type { NativeDoc } from '../extensions/extensions';

const NATIVE_METHODS: NativeDoc[] = [
	stringMethods,
	arrayMethods,
	numberMethods,
	objectMethods,
	booleanMethods,
];

export { NATIVE_METHODS as NativeMethods };
