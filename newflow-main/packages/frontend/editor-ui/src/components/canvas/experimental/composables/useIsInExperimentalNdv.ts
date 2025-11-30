/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ExpressionLocalResolveContextSymbol } from '@/constants';
import { computed, inject } from 'vue';

export function useIsInExperimentalNdv() {
	const expressionLocalResolveCtx = inject(ExpressionLocalResolveContextSymbol, undefined);

	// This condition is correct as long as ExpressionLocalResolveContext is used only in experimental NDV
	return computed(() => expressionLocalResolveCtx?.value !== undefined);
}
