/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * The credentials of a node in a template workflow. Map from credential
 * type name to credential name.
 * @example
 * {
 *  twitterOAuth1Api: "Twitter credentials"
 * }
 */
export type NormalizedTemplateNodeCredentials = Record<string, string>;
