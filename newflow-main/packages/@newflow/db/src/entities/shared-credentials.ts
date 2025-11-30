/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { CredentialSharingRole } from '@newflow/permissions';
import { Column, Entity, ManyToOne, PrimaryColumn } from '@n8n/typeorm';

import { WithTimestamps } from './abstract-entity';
import { CredentialsEntity } from './credentials-entity';
import { Project } from './project';

@Entity()
export class SharedCredentials extends WithTimestamps {
	@Column({ type: 'varchar' })
	role: CredentialSharingRole;

	@ManyToOne('CredentialsEntity', 'shared')
	credentials: CredentialsEntity;

	@PrimaryColumn()
	credentialsId: string;

	@ManyToOne('Project', 'sharedCredentials')
	project: Project;

	@PrimaryColumn()
	projectId: string;
}
