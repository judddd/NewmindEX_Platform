/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export {
	extend,
	extendOptional,
	hasExpressionExtension,
	hasNativeMethod,
	extendTransform,
	EXTENSION_OBJECTS as ExpressionExtensions,
} from './expression-extension';

export type {
	DocMetadata,
	NativeDoc,
	Extension,
	DocMetadataArgument,
	DocMetadataExample,
} from './extensions';
