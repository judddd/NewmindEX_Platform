/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * CustomAI Client - LangChain-based AI client compatible with OpenAI API
 * NewFlow: Replaces n8n AI Assistant SDK with custom AI backend
 *
 * Supports any OpenAI-compatible API backend:
 * - Ollama
 * - vLLM
 * - LocalAI
 * - DeepSeek
 * - OpenAI
 *
 * Configuration via environment variables:
 * - CUSTOM_AI_BASE_URL: Base URL of the AI service (e.g., http://localhost:11434/v1)
 * - CUSTOM_AI_API_KEY: API key for authentication (use 'ollama' or 'not-needed' for Ollama)
 * - CUSTOM_AI_MODEL: Model name (e.g., llama3.1, gpt-4, deepseek-chat)
 */

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import { Logger } from '@newflow/backend-common';
import { GlobalConfig } from '@newflow/config';
import { Service } from '@newflow/di';
import type { IUser } from 'n8n-workflow';

interface User {
	id: string;
}

interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	text: string;
}

interface ChatPayload {
	messages?: ChatMessage[];
	text?: string;
	role?: string;
	sessionId?: string;
	context?: any;
}

interface ChatRequestPayload {
	payload: ChatPayload;
	sessionId?: string;
}

interface ApplySuggestionPayload {
	sessionId: string;
	suggestionId: string;
}

export interface ApplySuggestionResponse {
	sessionId: string;
	parameters: object;
}

interface AskAiPayload {
	question: string;
	context: {
		schema: Array<{ nodeName: string; schema: unknown }>;
		inputSchema: { nodeName: string; schema: unknown };
		pushRef: string;
		ndvPushRef: string;
	};
	forNode: string;
}

export interface AskAiResponse {
	code: string;
}

export interface AiCreditResponse {
	apiKey: string;
	url: string;
}

@Service()
export class CustomAiClient {
	private chatModel: ChatOpenAI;
	private logger: Logger;

	constructor(
		logger: Logger,
		private readonly globalConfig: GlobalConfig,
	) {
		this.logger = logger.scoped('license'); // NewFlow: reusing existing scope for CustomAI client

		// Priority: CUSTOM_AI_* env vars > config properties > defaults
		const baseUrl =
			this.globalConfig.aiAssistant.customAiBaseUrl || this.globalConfig.aiAssistant.baseUrl || '';
		const apiKey = this.globalConfig.aiAssistant.apiKey || 'not-needed';
		const model = this.globalConfig.aiAssistant.model || 'gpt-3.5-turbo';

		this.logger.info('Initializing CustomAI client', {
			baseUrl: baseUrl || 'not configured',
			model,
			hasApiKey: !!apiKey && apiKey !== 'not-needed',
		});

		if (!baseUrl) {
			this.logger.warn('CUSTOM_AI_BASE_URL not configured. AI Assistant will not work properly.');
		}

		// NewFlow: Set OPENAI_API_KEY env var to make LangChain happy (even for non-OpenAI backends)
		if (apiKey && !process.env.OPENAI_API_KEY) {
			process.env.OPENAI_API_KEY = apiKey;
		}

		this.chatModel = new ChatOpenAI({
			openAIApiKey: apiKey,
			modelName: model,
			configuration: {
				baseURL: baseUrl,
			},
			streaming: true,
			temperature: 0.7,
			maxRetries: 2, // Add retry logic for reliability
		});
	}

	/**
	 * Chat with AI - streaming response
	 */
	async chat(payload: ChatRequestPayload, user: User): Promise<{ body: ReadableStream }> {
		this.logger.debug('CustomAI chat request', { userId: user.id, sessionId: payload.sessionId });

		try {
			// Convert payload to LangChain messages
			const messages = this.convertToLangChainMessages(payload.payload);

			this.logger.debug('CustomAI sending messages', { messageCount: messages.length });

			// Create streaming response
			const stream = await this.chatModel.stream(messages);

			// Convert LangChain stream to Web Streams API format compatible with controller
			// Frontend expects messages with separator: ⧉⇋⇋➽⌑⧉§§\n
			const STREAM_SEPARATOR = '⧉⇋⇋➽⌑⧉§§\n';
			const sessionId =
				payload.sessionId ??
				payload.payload.sessionId ??
				`custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

			const readable = new ReadableStream({
				async start(controller) {
					try {
						let fullContent = '';

						// Stream each chunk as it arrives
						for await (const chunk of stream) {
							fullContent += chunk.content;
							// Send incremental update wrapped in ResponsePayload expected by frontend
							const responsePayload = {
								sessionId,
								messages: [
									{
										role: 'assistant',
										type: 'message',
										text: fullContent,
									},
								],
							};

							// Encode with n8n's stream separator
							const line = JSON.stringify(responsePayload) + STREAM_SEPARATOR;
							controller.enqueue(new TextEncoder().encode(line));
						}

						controller.close();
					} catch (error) {
						controller.error(error);
					}
				},
			});

			// Return in format expected by ai.controller.ts (line 138)
			return { body: readable };
		} catch (error) {
			this.logger.error('CustomAI chat error', {
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Apply suggestion from AI
	 */
	async applySuggestion(
		payload: ApplySuggestionPayload,
		user: User,
	): Promise<ApplySuggestionResponse> {
		this.logger.debug('CustomAI applySuggestion request', {
			userId: user.id,
			sessionId: payload.sessionId,
		});

		// NewFlow: Simplified implementation - just return the session and empty parameters
		// This feature relies on session context which we don't maintain in CustomAI
		return {
			sessionId: payload.sessionId,
			parameters: {},
		};
	}

	/**
	 * Ask AI for code suggestions (Code Node Generator)
	 * Enhanced with better NewFlow code conventions
	 */
	async askAi(payload: AskAiPayload, user: User): Promise<AskAiResponse> {
		this.logger.debug('CustomAI askAi request', { userId: user.id, forNode: payload.forNode });

		try {
		// Build comprehensive system prompt for code generation
		const systemPrompt = `You are an expert JavaScript code generator for NewFlow workflow automation.

You are generating code for the "${payload.forNode}" node in NewFlow.

NEWFLOW CODE NODE CONVENTIONS:
1. Access input data:
   - $input.all() - Get all input items as array
   - $input.first() - Get first input item
   - $input.last() - Get last input item
   - $input.item - Get current item (in "Run Once for Each Item" mode)

2. Return format:
   - For "Run Once for All Items" mode: return items; (array of objects with "json" property)
   - For "Run Once for Each Item" mode: return item; (single object with "json" property)

3. Item structure:
   - Each item should have a "json" property containing the data
   - Example: { json: { name: "John", age: 30 } }

4. Common patterns:
   - Transform all items: const items = $input.all(); return items.map(item => ({ json: { ...item.json, newField: value } }));
   - Filter items: return $input.all().filter(item => condition);
   - Aggregate data: const sum = $input.all().reduce((acc, item) => acc + item.json.value, 0);

5. Available globals:
   - $json - Current item's JSON data (shorthand for $input.item.json)
   - $binary - Current item's binary data
   - $itemIndex - Current item index
   - $now - Current date/time
   - $today - Today's date
   - $workflow - Workflow information
   - $execution - Execution information

Generate clean, executable JavaScript code WITHOUT any markdown formatting, explanations, or comments.`;

			// Build context information
			const contextInfo = this.buildDetailedCodeContext(payload.context);

			// Build user prompt with question and context
			const userPrompt = `${payload.question}

${contextInfo}

IMPORTANT:
- Provide ONLY executable JavaScript code
- Use $input.all() or $input.item to access input data
- Return data using "return items;" or "return item;"
- Do NOT include explanations, comments, or markdown
- Follow NewFlow Code node conventions`;

			const messages = [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)];

			this.logger.debug('CustomAI askAi sending request', {
				systemPromptLength: systemPrompt.length,
				contextLength: contextInfo.length,
				questionLength: payload.question.length,
			});

			// Non-streaming request for code generation
			const response = await this.chatModel.invoke(messages);

			// Extract and clean code from response
			let code = response.content.toString();
			code = this.extractAndCleanCode(code);

			this.logger.debug('CustomAI askAi response received', {
				codeLength: code.length,
				userId: user.id,
			});

			return { code };
		} catch (error) {
			this.logger.error('CustomAI askAi error', {
				error: error instanceof Error ? error.message : String(error),
				userId: user.id,
				forNode: payload.forNode,
			});
			throw error;
		}
	}

	/**
	 * Generate AI credits credentials (n8n cloud feature)
	 * NewFlow: Not applicable for offline CustomAI - return empty credentials
	 */
	async generateAiCreditsCredentials(user: IUser): Promise<AiCreditResponse> {
		this.logger.debug('CustomAI generateAiCreditsCredentials request', { userId: user.id });

		// NewFlow: Return empty credentials - this feature is n8n cloud specific
		return {
			apiKey: '',
			url: '',
		};
	}

	/**
	 * Helper: safely truncate long JSON/strings for prompt construction
	 */
	private truncate(input: unknown, max = 4000): string {
		try {
			const s = typeof input === 'string' ? input : JSON.stringify(input);
			return s.length > max ? s.slice(0, max) + ' ...[truncated]' : s;
		} catch {
			return String(input);
		}
	}

	private formatActiveNode(activeNodeInfo: any): string {
		if (!activeNodeInfo) return '';
		const parts: string[] = [];
		if (activeNodeInfo.node) {
			parts.push(`- Node: ${activeNodeInfo.node.name} (${activeNodeInfo.node.type})`);
			if (activeNodeInfo.node.parameters) {
				parts.push(`- Parameters: ${this.truncate(activeNodeInfo.node.parameters, 1500)}`);
			}
		}
		if (activeNodeInfo.executionStatus) {
			parts.push(`- Execution: ${activeNodeInfo.executionStatus.status}`);
			if (activeNodeInfo.executionStatus.error) {
				parts.push(`- Error: ${this.truncate(activeNodeInfo.executionStatus.error, 500)}`);
			}
		}
		if (Array.isArray(activeNodeInfo.referencedNodes) && activeNodeInfo.referencedNodes.length) {
			const names = activeNodeInfo.referencedNodes.map((r: any) => r?.nodeName).filter(Boolean);
			if (names.length) parts.push(`- References: ${names.join(', ')}`);
		}
		return parts.join('\n');
	}

	private formatWorkflowSummary(workflow: any): string {
		if (!workflow) return '';
		const nodeSummaries = Array.isArray(workflow.nodes)
			? workflow.nodes.slice(0, 30).map((n: any) => `${n.name} (${n.type})`)
			: [];
		const more = (workflow.nodes?.length || 0) > 30 ? ` (+${workflow.nodes.length - 30} more)` : '';
		return [
			`- Name: ${workflow.name ?? ''}`,
			`- Active: ${workflow.active ? 'true' : 'false'}`,
			nodeSummaries.length ? `- Nodes: ${nodeSummaries.join(', ')}${more}` : '',
		]
			.filter(Boolean)
			.join('\n');
	}

	private buildSystemPrompt(context: any): string {
		const parts: string[] = [];
		parts.push(
			'You are an AI assistant for the NewFlow workflow editor. Always answer using the provided workflow context.',
		);
		if (context.currentView?.name) {
			parts.push(
				`\n[Current View]\n- Name: ${context.currentView.name}` +
					`${context.currentView.description ? `\n- Description: ${context.currentView.description}` : ''}`,
			);
		}
		const activeNodeBlock = this.formatActiveNode(context.activeNodeInfo);
		if (activeNodeBlock) parts.push(`\n[Active Node]\n${activeNodeBlock}`);
		const wf = this.formatWorkflowSummary(context.currentWorkflow);
		if (wf) parts.push(`\n[Workflow]\n${wf}`);
		if (context.executionData) {
			const exec = {
				lastNodeExecuted: context.executionData.lastNodeExecuted,
				error: context.executionData.error
					? this.truncate(context.executionData.error, 500)
					: undefined,
				metadata: context.executionData.metadata,
			};
			parts.push(`\n[Execution]\n${this.truncate(exec, 1000)}`);
		}
		parts.push(
			"\nWhen the user asks about 'current workflow', describe its purpose from nodes and connections. If unclear, ask a clarifying question.",
		);
		return parts.join('\n');
	}

	/**
	 * Convert n8n chat payload to LangChain messages
	 */
	private convertToLangChainMessages(payload: ChatPayload): BaseMessage[] {
		const messages: BaseMessage[] = [];

		// 1) Inject system prompt from visual context
		if (payload.context) {
			const sys = this.buildSystemPrompt(payload.context);
			if (sys?.trim()) messages.push(new SystemMessage(sys));
		}

		// 2) Multi-turn messages
		if (payload.messages && Array.isArray(payload.messages) && payload.messages.length) {
			for (const msg of payload.messages) {
				if (msg.role === 'system') messages.push(new SystemMessage(msg.text));
				else if (msg.role === 'assistant') messages.push(new AIMessage(msg.text));
				else messages.push(new HumanMessage(msg.text));
			}
		}

		// 3) Single-turn fallback
		if (payload.text) {
			if (payload.role === 'system') messages.push(new SystemMessage(payload.text));
			else if (payload.role === 'assistant') messages.push(new AIMessage(payload.text));
			else messages.push(new HumanMessage(payload.text));
		}

		// 4) Ensure at least one message
		if (!messages.length) {
			this.logger.warn('No messages found in payload, using default message');
			messages.push(new HumanMessage('Hello'));
		}

		return messages;
	}

	/**
	 * Build detailed context for code generation including schemas
	 */
	private buildDetailedCodeContext(context: AskAiPayload['context']): string {
		const parts: string[] = [];

		// Add input schema information
		if (context.inputSchema) {
			parts.push('=== INPUT DATA STRUCTURE ===');
			parts.push(`Source Node: ${context.inputSchema.nodeName}`);
			const schemaDesc = this.describeSchema(context.inputSchema.schema);
			if (schemaDesc) {
				parts.push('Data Schema:');
				parts.push(schemaDesc);
			}
		}

		// Add parent nodes schema information
		if (context.schema && context.schema.length > 0) {
			parts.push('\n=== AVAILABLE PARENT NODES ===');
			for (const parentNode of context.schema) {
				parts.push(`\nNode: ${parentNode.nodeName}`);
				const schemaDesc = this.describeSchema(parentNode.schema);
				if (schemaDesc) {
					parts.push('Schema:');
					parts.push(schemaDesc);
				}
			}
		}

		return parts.join('\n');
	}

	/**
	 * Describe schema structure in a readable format
	 */
	private describeSchema(schema: unknown, indent = 0): string {
		if (!schema || typeof schema !== 'object') {
			return '';
		}

		const parts: string[] = [];
		const prefix = '  '.repeat(indent);

		try {
			const s = schema as any;

			if (s.type === 'object' && Array.isArray(s.value)) {
				// Object with properties
				parts.push(`${prefix}{`);
				for (const field of s.value) {
					if (field.key) {
						const fieldType = field.type || 'any';
						if (field.type === 'array' || field.type === 'object') {
							parts.push(`${prefix}  ${field.key}: ${fieldType}`);
							if (Array.isArray(field.value)) {
								const nested = this.describeSchema(field, indent + 2);
								if (nested) parts.push(nested);
							}
						} else {
							parts.push(`${prefix}  ${field.key}: ${fieldType}`);
						}
					}
				}
				parts.push(`${prefix}}`);
			} else if (s.type === 'array' && Array.isArray(s.value) && s.value.length > 0) {
				// Array type
				parts.push(`${prefix}[`);
				const firstElement = s.value[0];
				if (firstElement) {
					const nested = this.describeSchema(firstElement, indent + 1);
					if (nested) parts.push(nested);
				}
				parts.push(`${prefix}]`);
			} else if (s.key) {
				// Simple field
				parts.push(`${prefix}${s.key}: ${s.type || 'any'}`);
			}
		} catch (error) {
			this.logger.warn('Failed to describe schema', {
				error: error instanceof Error ? error.message : String(error),
			});
			// Return simplified schema representation
			try {
				return `${prefix}${this.truncate(schema, 500)}`;
			} catch {
				return '';
			}
		}

		return parts.join('\n');
	}

	/**
	 * Extract and clean code from AI response
	 */
	private extractAndCleanCode(rawResponse: string): string {
		let code = rawResponse.trim();

		// Remove markdown code blocks
		code = code.replace(/```(?:javascript|typescript|js|ts|json)?\n?/gi, '');
		code = code.replace(/```\n?$/g, '');

		// Remove common explanatory prefixes
		code = code.replace(/^Here'?s? (?:the|your) code:?\s*/i, '');
		code = code.replace(/^This (?:code|script) (?:will|should|does):?\s*/i, '');
		code = code.replace(/^Solution:?\s*/i, '');

		// Remove trailing explanations (after the last semicolon or closing brace)
		const lines = code.split('\n');
		let lastCodeLineIndex = -1;

		for (let i = lines.length - 1; i >= 0; i--) {
			const line = lines[i].trim();
			if (
				line &&
				!line.startsWith('//') &&
				!line.startsWith('/*') &&
				!line.startsWith('*') &&
				(line.endsWith(';') ||
					line.endsWith('}') ||
					line.endsWith(']') ||
					line.endsWith(')') ||
					line === 'return items;' ||
					line === 'return item;')
			) {
				lastCodeLineIndex = i;
				break;
			}
		}

		if (lastCodeLineIndex >= 0 && lastCodeLineIndex < lines.length - 1) {
			code = lines.slice(0, lastCodeLineIndex + 1).join('\n');
		}

		// Final cleanup
		code = code.trim();

		// If code doesn't have a return statement, log warning
		if (!code.includes('return ')) {
			this.logger.warn('Generated code does not contain a return statement');
		}

		return code;
	}

	/**
	 * Build context string for askAi requests (deprecated - kept for compatibility)
	 * @deprecated Use buildDetailedCodeContext instead
	 */
	private buildContextString(context: AskAiPayload['context']): string {
		const parts: string[] = [];

		if (context.inputSchema) {
			parts.push(`Input from: ${context.inputSchema.nodeName}`);
		}

		if (context.schema && context.schema.length > 0) {
			const nodeNames = context.schema.map((s) => s.nodeName).join(', ');
			parts.push(`Available nodes: ${nodeNames}`);
		}

		return parts.join('\n');
	}
}
