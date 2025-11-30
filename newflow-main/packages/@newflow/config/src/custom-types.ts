/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

abstract class StringArray<T extends string> extends Array<T> {
	constructor(str: string, delimiter: string) {
		super();
		const parsed = str.split(delimiter) as this;
		return parsed.filter((i) => typeof i === 'string' && i.length);
	}
}

export class CommaSeparatedStringArray<T extends string> extends StringArray<T> {
	constructor(str: string) {
		super(str, ',');
	}
}

export class ColonSeparatedStringArray<T extends string = string> extends StringArray<T> {
	constructor(str: string) {
		super(str, ':');
	}
}
