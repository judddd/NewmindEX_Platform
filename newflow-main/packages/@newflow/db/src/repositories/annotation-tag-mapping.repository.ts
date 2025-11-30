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

import { AnnotationTagMapping } from '../entities';

/**
 * Repository for managing the many-to-many relationship between
 * execution annotations and their tags.
 *
 * This repository handles the junction table that links annotations to tags,
 * providing specialized operations for bulk tag updates and mappings.
 *
 * @example
 * // Replace all tags for an annotation
 * await repository.overwriteTags(annotationId, ['tag1', 'tag2', 'tag3']);
 */
@Service()
export class AnnotationTagMappingRepository extends Repository<AnnotationTagMapping> {
	/**
	 * Initialize the repository with database connection.
	 *
	 * @param dataSource - TypeORM data source for database operations
	 */
	constructor(dataSource: DataSource) {
		super(AnnotationTagMapping, dataSource.manager);
	}

	/**
	 * Replace all tags for a specific annotation in a single transaction.
	 *
	 * This method performs a complete replacement of an annotation's tags:
	 * 1. Deletes all existing tag mappings for the annotation
	 * 2. Creates new mappings for the provided tag IDs
	 *
	 * The operation is atomic - if any step fails, all changes are rolled back.
	 *
	 * @param annotationId - The ID of the annotation to update
	 * @param tagIds - Array of tag IDs to associate with the annotation
	 * @returns Promise that resolves when the operation completes
	 *
	 * @example
	 * // Update an annotation to have only 'production' and 'failed' tags
	 * await repository.overwriteTags(123, [
	 *   'production-tag-id',
	 *   'failed-tag-id'
	 * ]);
	 *
	 * @throws Will throw an error if the annotation doesn't exist
	 * @throws Will throw an error if any tag ID is invalid
	 */
	async overwriteTags(annotationId: number, tagIds: string[]) {
		return await this.manager.transaction(async (transactionManager) => {
			// Step 1: Remove all existing tag associations
			await transactionManager.delete(AnnotationTagMapping, {
				annotationId,
			});

			// Step 2: Create new tag associations
			const tagMappings = tagIds.map((tagId) => ({
				annotationId,
				tagId,
			}));

			return await transactionManager.insert(AnnotationTagMapping, tagMappings);
		});
	}
}
