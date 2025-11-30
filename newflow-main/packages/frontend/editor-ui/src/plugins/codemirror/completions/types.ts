/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { DocMetadata } from 'n8n-workflow';

export type Resolved = unknown;

export type ExtensionTypeName = 'number' | 'string' | 'date' | 'array' | 'object' | 'boolean';

export type FnToDoc = { [fnName: string]: { doc?: DocMetadata } };

export type FunctionOptionType = 'native-function' | 'extension-function';
export type KeywordOptionType = 'keyword';
export type AutocompleteOptionType = FunctionOptionType | KeywordOptionType;
export type AutocompleteInput<R = Resolved> = {
	resolved: R;
	base: string;
	tail: string;
	transformLabel?: (label: string) => string;
};
