/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * Object Store Service - Stub Implementation
 *
 * This is a simplified stub version that replaces the original S3/external object
 * storage integration. External object storage has been removed from this version.
 *
 * The system now uses local filesystem storage only. For large-scale deployments
 * requiring distributed storage, consider:
 * - Network-attached storage (NAS)
 * - Distributed filesystems (GlusterFS, Ceph)
 * - External file management solutions
 *
 * @module object-store-service
 */

import { Service } from '@newflow/di';
import type { Readable } from 'node:stream';

import type { MetadataResponseHeaders } from './types';
import type { BinaryData } from '../types';

/**
 * Stub implementation of the Object Store Service.
 *
 * All methods throw errors indicating that external object storage
 * is not available in this version. This maintains interface compatibility
 * while preventing usage of removed functionality.
 *
 * @example
 * // This will throw an error
 * const service = new ObjectStoreService();
 * await service.checkConnection(); // Throws: External object storage is not available
 */
@Service()
export class ObjectStoreService {
	/**
	 * Logger instance for error reporting.
	 * Using console.warn as fallback since Logger requires DI container setup.
	 */
	private readonly logger = {
		warn: (message: string) => console.warn('[ObjectStoreService]', message),
	};

	/**
	 * Constructor - logs a warning about removed functionality.
	 */
	constructor() {
		this.logger.warn(
			'ObjectStoreService: External object storage is not available in this version',
		);
	}

	/**
	 * Initialize the object storage service.
	 *
	 * @throws {Error} Always throws as object storage is not available
	 */
	async init(): Promise<void> {
		throw new Error(
			'External object storage (S3/MinIO) is not available. ' +
				'Please use local filesystem storage or implement your own storage solution.',
		);
	}

	/**
	 * Check connection to object storage.
	 *
	 * @throws {Error} Always throws as object storage is not available
	 */
	async checkConnection(): Promise<void> {
		throw new Error(
			'External object storage (S3/MinIO) is not available. ' +
				'Please use local filesystem storage or implement your own storage solution.',
		);
	}

	/**
	 * Upload a file to object storage.
	 *
	 * @param _fileId - The identifier for the file
	 * @param _buffer - The file data as a Buffer
	 * @param _metadata - Optional metadata for the file
	 * @throws {Error} Always throws as object storage is not available
	 */
	async put(
		_fileId: string,
		_buffer: Buffer,
		_metadata?: BinaryData.PreWriteMetadata,
	): Promise<void> {
		throw new Error(
			'Cannot upload to object storage: External object storage is not available. ' +
				'Use local filesystem storage instead.',
		);
	}

	/**
	 * Download a file from object storage.
	 *
	 * @param _fileId - The identifier for the file to download
	 * @param _options - Download options (buffer or stream mode)
	 * @throws {Error} Always throws as object storage is not available
	 */
	async get(_fileId: string, _options: { mode: 'buffer' }): Promise<Buffer>;
	async get(_fileId: string, _options: { mode: 'stream' }): Promise<Readable>;
	async get(
		_fileId: string,
		_options: { mode: 'buffer' } | { mode: 'stream' },
	): Promise<Buffer | Readable> {
		throw new Error(
			'Cannot download from object storage: External object storage is not available. ' +
				'Use local filesystem storage instead.',
		);
	}

	/**
	 * Get metadata for a file in object storage.
	 *
	 * @param _fileId - The identifier for the file
	 * @returns Promise that would resolve to file metadata
	 * @throws {Error} Always throws as object storage is not available
	 */
	async getMetadata(_fileId: string): Promise<MetadataResponseHeaders> {
		throw new Error(
			'Cannot get metadata from object storage: External object storage is not available. ' +
				'Use local filesystem storage instead.',
		);
	}

	/**
	 * Delete a single file from object storage.
	 *
	 * @param _fileId - The identifier for the file to delete
	 * @throws {Error} Always throws as object storage is not available
	 */
	async deleteOne(_fileId: string): Promise<void> {
		throw new Error(
			'Cannot delete from object storage: External object storage is not available. ' +
				'Use local filesystem storage instead.',
		);
	}

	/**
	 * Delete multiple files from object storage.
	 *
	 * @param _prefix - The prefix to match files for deletion
	 * @throws {Error} Always throws as object storage is not available
	 */
	async deleteMany(_prefix: string): Promise<void> {
		throw new Error(
			'Cannot delete from object storage: External object storage is not available. ' +
				'Use local filesystem storage instead.',
		);
	}

	/**
	 * List files in object storage with a given prefix.
	 *
	 * @param _prefix - The prefix to filter files
	 * @param _delimiter - Optional delimiter for hierarchical listing
	 * @returns Promise that would resolve to file list
	 * @throws {Error} Always throws as object storage is not available
	 */
	async list(_prefix: string, _delimiter?: string): Promise<string[]> {
		throw new Error(
			'Cannot list object storage: External object storage is not available. ' +
				'Use local filesystem storage instead.',
		);
	}
}
