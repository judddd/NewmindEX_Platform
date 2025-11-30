/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import get from 'lodash/get';
import { ApplicationError, resolveRelativePath, Workflow } from 'n8n-workflow';
import type {
	INodeParameterResourceLocator,
	IWorkflowExecuteAdditionalData,
	NodeParameterValueType,
	ILocalLoadOptionsFunctions,
	IWorkflowLoader,
	IWorkflowNodeContext,
	INodeTypes,
} from 'n8n-workflow';

import { LoadWorkflowNodeContext } from './workflow-node-context';

export class LocalLoadOptionsContext implements ILocalLoadOptionsFunctions {
	constructor(
		private nodeTypes: INodeTypes,
		private additionalData: IWorkflowExecuteAdditionalData,
		private path: string,
		private workflowLoader: IWorkflowLoader,
	) {}

	async getWorkflowNodeContext(nodeType: string): Promise<IWorkflowNodeContext | null> {
		const { value: workflowId } = this.getCurrentNodeParameter(
			'workflowId',
		) as INodeParameterResourceLocator;

		if (typeof workflowId !== 'string' || !workflowId) {
			throw new ApplicationError(`No workflowId parameter defined on node of type "${nodeType}"!`);
		}

		const dbWorkflow = await this.workflowLoader.get(workflowId);

		const selectedWorkflowNode = dbWorkflow.nodes.find((node) => node.type === nodeType);

		if (selectedWorkflowNode) {
			const selectedSingleNodeWorkflow = new Workflow({
				id: dbWorkflow.id,
				name: dbWorkflow.name,
				nodes: [selectedWorkflowNode],
				connections: {},
				active: false,
				nodeTypes: this.nodeTypes,
			});

			const workflowAdditionalData = {
				...this.additionalData,
				currentNodeParameters: selectedWorkflowNode.parameters,
			};

			return new LoadWorkflowNodeContext(
				selectedSingleNodeWorkflow,
				selectedWorkflowNode,
				workflowAdditionalData,
			);
		}

		return null;
	}

	getCurrentNodeParameter(parameterPath: string): NodeParameterValueType | object | undefined {
		const nodeParameters = this.additionalData.currentNodeParameters;

		parameterPath = resolveRelativePath(this.path, parameterPath);

		return get(nodeParameters, parameterPath);
	}
}
