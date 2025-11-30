/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { LintSource } from '@codemirror/lint';
import { typescriptWorkerFacet } from './facet';

export const typescriptLintSource: LintSource = async (view) => {
	const { worker } = view.state.facet(typescriptWorkerFacet);
	const docLength = view.state.doc.length;

	return (await worker.getDiagnostics()).filter((diag) => {
		return diag.from < docLength && diag.to <= docLength && diag.from >= 0;
	});
};
