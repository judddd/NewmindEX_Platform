/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type * as tsvfs from '@typescript/vfs';

export function getHoverTooltip({
	pos,
	fileName,
	env,
}: { pos: number; fileName: string; env: tsvfs.VirtualTypeScriptEnvironment }) {
	const quickInfo = env.languageService.getQuickInfoAtPosition(fileName, pos);

	if (!quickInfo) return null;

	const start = quickInfo.textSpan.start;

	const typeDef =
		env.languageService.getTypeDefinitionAtPosition(fileName, pos) ??
		env.languageService.getDefinitionAtPosition(fileName, pos);

	return {
		start,
		end: start + quickInfo.textSpan.length,
		typeDef,
		quickInfo,
	};
}
