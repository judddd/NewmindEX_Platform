/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { AuthenticatedRequest, ExecutionSummaries, ExecutionEntity } from '@newflow/db';
import type {
	AnnotationVote,
	ExecutionStatus,
	IDataObject,
	WorkflowExecuteMode,
} from 'n8n-workflow';

export declare namespace ExecutionRequest {
	namespace QueryParams {
		type GetMany = {
			filter: string; // stringified `FilterFields`
			limit: string;
			lastId: string;
			firstId: string;
		};
	}

	namespace BodyParams {
		type DeleteFilter = {
			deleteBefore?: Date;
			filters?: IDataObject;
			ids?: string[];
		};
	}

	namespace RouteParams {
		type ExecutionId = {
			id: ExecutionEntity['id'];
		};
	}

	type ExecutionUpdatePayload = {
		tags?: string[];
		vote?: AnnotationVote | null;
	};

	type GetMany = AuthenticatedRequest<{}, {}, {}, QueryParams.GetMany> & {
		rangeQuery: ExecutionSummaries.RangeQuery; // parsed from query params
	};

	type GetOne = AuthenticatedRequest<RouteParams.ExecutionId>;

	type Delete = AuthenticatedRequest<{}, {}, BodyParams.DeleteFilter>;

	type Retry = AuthenticatedRequest<RouteParams.ExecutionId, {}, { loadWorkflow?: boolean }, {}>;

	type Stop = AuthenticatedRequest<RouteParams.ExecutionId>;

	type Update = AuthenticatedRequest<RouteParams.ExecutionId, {}, ExecutionUpdatePayload, {}>;
}

export type StopResult = {
	mode: WorkflowExecuteMode;
	startedAt: Date;
	stoppedAt?: Date;
	finished: boolean;
	status: ExecutionStatus;
};
