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

import { AnnotationTagEntity } from '../entities';

/**
 * Repository for managing annotation tags in the database.
 *
 * This repository provides standard CRUD operations for annotation tags,
 * which are used to categorize and organize workflow execution annotations.
 *
 * All operations inherit from TypeORM's base Repository class, providing
 * methods like find(), findOne(), save(), delete(), etc.
 *
 * @example
 * // Finding all tags
 * const tags = await annotationTagRepository.find();
 *
 * @example
 * // Creating a new tag
 * const tag = new AnnotationTagEntity();
 * tag.name = 'production';
 * await annotationTagRepository.save(tag);
 */
@Service()
export class AnnotationTagRepository extends Repository<AnnotationTagEntity> {
	/**
	 * Initialize the repository with database connection.
	 *
	 * @param dataSource - TypeORM data source for database operations
	 */
	constructor(dataSource: DataSource) {
		super(AnnotationTagEntity, dataSource.manager);
	}
}
