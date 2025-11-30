/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export type NodeTypeData = {
	name: string;
	version: number;
};

export type ReloadNodeType = {
	type: 'reloadNodeType';
	data: NodeTypeData;
};

export type RemoveNodeType = {
	type: 'removeNodeType';
	data: NodeTypeData;
};

export type NodeDescriptionUpdated = {
	type: 'nodeDescriptionUpdated';
	data: {};
};

export type HotReloadPushMessage = ReloadNodeType | RemoveNodeType | NodeDescriptionUpdated;
