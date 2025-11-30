/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { mock } from 'vitest-mock-extended';
import type { IWorkflowTemplateNode } from '@newflow/rest-api-client/api/templates';
import {
	keyFromCredentialTypeAndName,
	replaceAllTemplateNodeCredentials,
} from '@/utils/templates/templateTransforms';

describe('templateTransforms', () => {
	describe('replaceAllTemplateNodeCredentials', () => {
		it('should replace credentials of nodes that have credentials', () => {
			const nodeTypeProvider = {
				getNodeType: vitest.fn(),
			};
			const node = mock<IWorkflowTemplateNode>({
				id: 'twitter',
				type: 'n8n-nodes-base.twitter',
				credentials: {
					twitterOAuth1Api: 'old1',
				},
			});

			const toReplaceWith = {
				[keyFromCredentialTypeAndName('twitterOAuth1Api', 'old1')]: {
					id: 'new1',
					name: 'Twitter creds',
				},
			};

			const [replacedNode] = replaceAllTemplateNodeCredentials(
				nodeTypeProvider,
				[node],
				toReplaceWith,
			);

			expect(replacedNode.credentials).toEqual({
				twitterOAuth1Api: { id: 'new1', name: 'Twitter creds' },
			});
		});

		it('should not replace credentials of nodes that do not have credentials', () => {
			const nodeTypeProvider = {
				getNodeType: vitest.fn(),
			};
			const node = mock<IWorkflowTemplateNode>({
				id: 'twitter',
				type: 'n8n-nodes-base.twitter',
			});
			const toReplaceWith = {
				[keyFromCredentialTypeAndName('twitterOAuth1Api', 'old1')]: {
					id: 'new1',
					name: 'Twitter creds',
				},
			};

			const [replacedNode] = replaceAllTemplateNodeCredentials(
				nodeTypeProvider,
				[node],
				toReplaceWith,
			);

			expect(replacedNode.credentials).toBeUndefined();
		});
	});
});
