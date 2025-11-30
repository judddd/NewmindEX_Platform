/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import {
	Column,
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from '@n8n/typeorm';
import type { AnnotationVote } from 'n8n-workflow';

import type { AnnotationTagEntity } from './annotation-tag-entity';
import type { AnnotationTagMapping } from './annotation-tag-mapping';
import { ExecutionEntity } from './execution-entity';

/**
 * Database entity representing user annotations on workflow executions.
 *
 * This entity allows users to add metadata, feedback, and categorization to
 * workflow execution records. Users can vote on execution quality (thumbs up/down),
 * add text notes for context or debugging information, and apply tags for
 * organization and filtering.
 *
 * Each execution can have at most one annotation (one-to-one relationship),
 * but an annotation can have multiple tags (many-to-many relationship).
 *
 * @example
 * // Creating an annotation for a failed execution
 * const annotation = new ExecutionAnnotation();
 * annotation.vote = 'down';
 * annotation.note = 'API timeout - needs investigation';
 * annotation.tags = [productionTag, failedTag];
 */
@Entity({
	name: 'execution_annotations',
})
export class ExecutionAnnotation {
	/**
	 * Auto-generated unique identifier for this annotation.
	 */
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * User's vote on the execution quality.
	 * Can be 'up' (thumbs up), 'down' (thumbs down), or null (no vote).
	 *
	 * This helps track which executions were considered successful or
	 * problematic by the team.
	 */
	@Column({
		type: 'varchar',
		nullable: true,
	})
	vote: AnnotationVote | null;

	/**
	 * Custom text note added by the user to provide context or details.
	 * Can include debugging information, root cause analysis, or any
	 * relevant observations about the execution.
	 *
	 * @example
	 * 'API returned 429 - rate limit hit during peak hours'
	 * 'Expected behavior - customer requested manual trigger'
	 */
	@Column({
		type: 'varchar',
		nullable: true,
	})
	note: string | null;

	/**
	 * Foreign key to the associated execution.
	 * Extracted from the execution relation for quick lookups.
	 */
	@RelationId((annotation: ExecutionAnnotation) => annotation.execution)
	executionId: string;

	/**
	 * The workflow execution this annotation is attached to.
	 * One-to-one relationship: each execution can have at most one annotation.
	 *
	 * Cascade delete ensures annotations are removed when executions are deleted.
	 */
	@Index({
		unique: true,
	})
	@OneToOne('ExecutionEntity', 'annotation', {
		onDelete: 'CASCADE',
	})
	@JoinColumn({
		name: 'executionId',
	})
	execution: ExecutionEntity;

	/**
	 * Tags applied to this annotation for categorization and filtering.
	 * Many-to-many relationship through the junction table.
	 *
	 * @example ['production', 'failed', 'needs-review']
	 */
	@ManyToMany('AnnotationTagEntity', 'annotations')
	@JoinTable({
		name: 'execution_annotation_tags',
		joinColumn: {
			name: 'annotationId',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'tagId',
			referencedColumnName: 'id',
		},
	})
	tags?: AnnotationTagEntity[];

	/**
	 * Direct access to the junction table records linking this annotation to tags.
	 * Useful for bulk operations or when you need the mapping metadata.
	 */
	@OneToMany('AnnotationTagMapping', 'annotations')
	tagMappings: AnnotationTagMapping[];
}
