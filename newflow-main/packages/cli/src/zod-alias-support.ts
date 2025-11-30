/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

// Monkey-patch zod to support aliases
declare module 'zod' {
	interface ZodType {
		alias<T extends ZodType>(this: T, aliasName: string): T;
	}
	interface ZodTypeDef {
		_alias: string;
	}
}

z.ZodType.prototype.alias = function <T extends z.ZodType>(this: T, aliasName: string) {
	this._def._alias = aliasName;
	return this;
};
