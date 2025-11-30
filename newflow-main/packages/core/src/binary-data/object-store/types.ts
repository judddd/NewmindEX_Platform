/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { BinaryData } from '../types';

export type MetadataResponseHeaders = Record<string, string> & {
	'content-length'?: string;
	'content-type'?: string;
	'x-amz-meta-filename'?: string;
	etag?: string;
	'last-modified'?: string;
} & BinaryData.PreWriteMetadata;
