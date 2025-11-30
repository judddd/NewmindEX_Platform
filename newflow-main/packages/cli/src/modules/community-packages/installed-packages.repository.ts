/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';
import { DataSource, Repository } from '@n8n/typeorm';
import type { PackageDirectoryLoader } from 'n8n-core';

import { InstalledNodesRepository } from './installed-nodes.repository';
import { InstalledPackages } from './installed-packages.entity';

@Service()
export class InstalledPackagesRepository extends Repository<InstalledPackages> {
	constructor(
		dataSource: DataSource,
		private installedNodesRepository: InstalledNodesRepository,
	) {
		super(InstalledPackages, dataSource.manager);
	}

	async saveInstalledPackageWithNodes(packageLoader: PackageDirectoryLoader) {
		const { packageJson, nodeTypes, loadedNodes } = packageLoader;
		const { name: packageName, version: installedVersion, author } = packageJson;

		let installedPackage: InstalledPackages;

		await this.manager.transaction(async (manager) => {
			installedPackage = await manager.save(
				this.create({
					packageName,
					installedVersion,
					authorName: author?.name,
					authorEmail: author?.email,
				}),
			);

			installedPackage.installedNodes = [];

			for (const loadedNode of loadedNodes) {
				const installedNode = this.installedNodesRepository.create({
					name: nodeTypes[loadedNode.name].type.description.displayName,
					type: `${packageName}.${loadedNode.name}`,
					latestVersion: loadedNode.version,
					package: { packageName },
				});

				installedPackage.installedNodes.push(installedNode);

				await manager.save(installedNode);
			}
		});

		return installedPackage!;
	}
}
