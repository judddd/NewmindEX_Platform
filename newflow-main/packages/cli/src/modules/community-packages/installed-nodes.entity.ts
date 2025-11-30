/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from '@n8n/typeorm';

import { InstalledPackages } from './installed-packages.entity';

@Entity()
export class InstalledNodes extends BaseEntity {
	@Column()
	name: string;

	@PrimaryColumn()
	type: string;

	@Column()
	latestVersion: number;

	@ManyToOne('InstalledPackages', 'installedNodes')
	@JoinColumn({ name: 'package', referencedColumnName: 'packageName' })
	package: InstalledPackages;
}
