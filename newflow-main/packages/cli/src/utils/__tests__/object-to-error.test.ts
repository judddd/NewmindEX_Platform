/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { mock } from 'jest-mock-extended';
import type { INode, Workflow } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { objectToError } from '../object-to-error';

describe('objectToError', () => {
	describe('node error handling', () => {
		it('should create `NodeOperationError` when node is found', () => {
			const errorObject = {
				message: 'Test error',
				node: {
					name: 'testNode',
				},
			};
			const workflow = mock<Workflow>();
			const node = mock<INode>();
			workflow.getNode.mockReturnValue(node);

			const result = objectToError(errorObject, workflow);

			expect(workflow.getNode).toHaveBeenCalledWith('testNode');
			expect(result).toBeInstanceOf(NodeOperationError);
		});

		it('should create `Error` when node is not found', () => {
			const errorObject = {
				message: 'Test error',
				node: {
					// missing `name`
				},
			};
			const workflow = mock<Workflow>();

			const result = objectToError(errorObject, workflow);

			expect(workflow.getNode).not.toHaveBeenCalled();
			expect(result).toBeInstanceOf(Error);
			expect(result).not.toBeInstanceOf(NodeOperationError);
			expect(result.message).toBe('Test error');
		});
	});
});
