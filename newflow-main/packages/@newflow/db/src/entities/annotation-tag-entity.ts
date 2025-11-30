/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Column, Entity, Index, ManyToMany, OneToMany } from '@n8n/typeorm';
import { IsString, Length } from 'class-validator';

import { WithTimestampsAndStringId } from './abstract-entity';
import type { AnnotationTagMapping } from './annotation-tag-mapping';
import type { ExecutionAnnotation } from './execution-annotation';

/**
 * Database entity representing a tag that can be applied to execution annotations.
 * Tags help organize and categorize workflow execution records for better tracking
 * and analysis.
 *
 * @example
 * // Creating a tag for marking successful executions
 * const tag = new AnnotationTagEntity();
 * tag.name = 'success';
 */
@Entity()
export class AnnotationTagEntity extends WithTimestampsAndStringId {
	/**
	 * The display name of the annotation tag.
	 * Must be unique across all tags and limited to 24 characters.
	 *
	 * @example 'production', 'failed', 'needs-review'
	 */
	@Column({
		length: 24,
	})
	@Index({
		unique: true,
	})
	@IsString({
		message: 'Tag name must be of type string.',
	})
	@Length(1, 24, {
		message: 'Tag name must be $constraint1 to $constraint2 characters long.',
	})
	name: string;

	/**
	 * All execution annotations that have this tag applied.
	 * This is a many-to-many relationship through the junction table.
	 */
	@ManyToMany('ExecutionAnnotation', 'tags')
	annotations: ExecutionAnnotation[];

	/**
	 * Mappings between this tag and execution annotations.
	 * Provides direct access to the junction table records.
	 */
	@OneToMany('AnnotationTagMapping', 'tags')
	annotationMappings: AnnotationTagMapping[];
}
