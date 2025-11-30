/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * n8n workflow. This is a simplified version of the actual workflow object.
 */
export type Workflow = {
	id: string;
	name: string;
	tags?: string[];
};

export type Credential = {
	id: string;
	name: string;
	type: string;
};
