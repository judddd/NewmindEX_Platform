/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { AnnotationTagEntity } from './annotation-tag-entity';
import { AnnotationTagMapping } from './annotation-tag-mapping';
import { ApiKey } from './api-key';
import { AuthIdentity } from './auth-identity';
import { AuthProviderSyncHistory } from './auth-provider-sync-history';
import { CredentialsEntity } from './credentials-entity';
import { EventDestinations } from './event-destinations';
import { ExecutionAnnotation } from './execution-annotation';
import { ExecutionData } from './execution-data';
import { ExecutionEntity } from './execution-entity';
import { ExecutionMetadata } from './execution-metadata';
import { Folder } from './folder';
import { FolderTagMapping } from './folder-tag-mapping';
import { InvalidAuthToken } from './invalid-auth-token';
import { ProcessedData } from './processed-data';
import { Project } from './project';
import { ProjectRelation } from './project-relation';
import { Role } from './role';
import { Scope } from './scope';
import { Settings } from './settings';
import { SharedCredentials } from './shared-credentials';
import { SharedWorkflow } from './shared-workflow';
import { TagEntity } from './tag-entity';
import { User } from './user';
import { Variables } from './variables';
import { WebhookEntity } from './webhook-entity';
import { WorkflowEntity } from './workflow-entity';
import { WorkflowHistory } from './workflow-history';
import { WorkflowStatistics } from './workflow-statistics';
import { WorkflowTagMapping } from './workflow-tag-mapping';

export {
	EventDestinations,
	InvalidAuthToken,
	ProcessedData,
	Settings,
	Variables,
	ApiKey,
	WebhookEntity,
	AuthIdentity,
	CredentialsEntity,
	Folder,
	Project,
	ProjectRelation,
	Role,
	Scope,
	SharedCredentials,
	SharedWorkflow,
	TagEntity,
	User,
	WorkflowEntity,
	WorkflowStatistics,
	WorkflowTagMapping,
	FolderTagMapping,
	AuthProviderSyncHistory,
	WorkflowHistory,
	ExecutionData,
	ExecutionMetadata,
	AnnotationTagEntity,
	ExecutionAnnotation,
	AnnotationTagMapping,
	ExecutionEntity,
};

export const entities = {
	EventDestinations,
	InvalidAuthToken,
	ProcessedData,
	Settings,
	Variables,
	ApiKey,
	WebhookEntity,
	AuthIdentity,
	CredentialsEntity,
	Folder,
	Project,
	ProjectRelation,
	Scope,
	SharedCredentials,
	SharedWorkflow,
	TagEntity,
	User,
	WorkflowEntity,
	WorkflowStatistics,
	WorkflowTagMapping,
	FolderTagMapping,
	AuthProviderSyncHistory,
	WorkflowHistory,
	ExecutionData,
	ExecutionMetadata,
	AnnotationTagEntity,
	ExecutionAnnotation,
	AnnotationTagMapping,
	ExecutionEntity,
	Role,
};
