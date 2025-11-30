/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from '@n8n/typeorm';

import type { AnnotationTagEntity } from './annotation-tag-entity';
import type { ExecutionAnnotation } from './execution-annotation';

/**
 * Junction table entity that manages the many-to-many relationship between
 * execution annotations and their associated tags.
 *
 * This mapping allows a single annotation to have multiple tags, and a single
 * tag to be applied to multiple annotations, providing flexible categorization
 * of workflow execution records.
 *
 * @example
 * // An execution annotation can have multiple tags like:
 * // ['production', 'failed', 'needs-review']
 */
@Entity({
	name: 'execution_annotation_tags',
})
export class AnnotationTagMapping {
	/**
	 * Foreign key reference to the execution annotation.
	 * Part of the composite primary key.
	 */
	@PrimaryColumn()
	annotationId: number;

	/**
	 * The execution annotation this mapping belongs to.
	 * Many mappings can reference the same annotation (one annotation, many tags).
	 */
	@ManyToOne('ExecutionAnnotation', 'tagMappings')
	@JoinColumn({
		name: 'annotationId',
	})
	annotations: ExecutionAnnotation[];

	/**
	 * Foreign key reference to the annotation tag.
	 * Part of the composite primary key.
	 */
	@PrimaryColumn()
	tagId: string;

	/**
	 * The tag this mapping refers to.
	 * Many mappings can reference the same tag (one tag, many annotations).
	 */
	@ManyToOne('AnnotationTagEntity', 'annotationMappings')
	@JoinColumn({
		name: 'tagId',
	})
	tags: AnnotationTagEntity[];
}
