#!/usr/bin/env node
/**
 * Build n8n Docker image locally
 *
 * This script simulates the CI build process for local testing.
 * Default output: 'n8nio/n8n:local'
 * 
 * Environment variables:
 * - IMAGE_BASE_NAME: Override image base name (default: 'newflow')
 * - IMAGE_TAG: Override image tag (default: '1.0.0')
 * - TARGET_PLATFORM: Override target platform (default: auto-detect)
 *   Supported values: linux/amd64, linux/arm64
 * 
 * Examples:
 *   pnpm build:docker                              # Build for current platform
 *   TARGET_PLATFORM=linux/amd64 pnpm build:docker  # Build for AMD64 (x86_64)
 *   TARGET_PLATFORM=linux/arm64 pnpm build:docker  # Build for ARM64
 */

import { $, echo, fs, chalk, os } from 'zx';
import { fileURLToPath } from 'url';
import path from 'path';

// Disable verbose mode for cleaner output
$.verbose = false;
process.env.FORCE_COLOR = '1';

// #region ===== Helper Functions =====

/**
 * Get Docker platform string based on host architecture
 * @returns {string} Platform string (e.g., 'linux/amd64')
 */
function getDockerPlatform() {
	const arch = os.arch();
	const dockerArch = {
		x64: 'amd64',
		arm64: 'arm64',
	}[arch];

	if (!dockerArch) {
		throw new Error(`Unsupported architecture: ${arch}. Only x64 and arm64 are supported.`);
	}

	return `linux/${dockerArch}`;
}

/**
 * Validate and normalize platform string
 * @param {string} platform - Platform string to validate
 * @returns {string} Normalized platform string
 */
function validatePlatform(platform) {
	const supportedPlatforms = ['linux/amd64', 'linux/arm64'];
	
	if (!supportedPlatforms.includes(platform)) {
		echo(chalk.red(`Error: Unsupported platform '${platform}'`));
		echo(chalk.yellow(`Supported platforms: ${supportedPlatforms.join(', ')}`));
		process.exit(1);
	}
	
	return platform;
}

/**
 * Format duration in seconds
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
	return `${Math.floor(ms / 1000)}s`;
}

/**
 * Get Docker image size
 * @param {string} imageName - Full image name with tag
 * @returns {Promise<string>} Image size or 'Unknown'
 */
async function getImageSize(imageName) {
	try {
		const { stdout } = await $`docker images ${imageName} --format "{{.Size}}"`;
		return stdout.trim();
	} catch {
		return 'Unknown';
	}
}

/**
 * Check if a command exists
 * @param {string} command - Command to check
 * @returns {Promise<boolean>} True if command exists
 */
async function commandExists(command) {
	try {
		await $`command -v ${command}`;
		return true;
	} catch {
		return false;
	}
}

// #endregion ===== Helper Functions =====

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isInScriptsDir = path.basename(__dirname) === 'scripts';
const rootDir = isInScriptsDir ? path.join(__dirname, '..') : __dirname;

const config = {
	dockerfilePath: path.join(rootDir, 'docker/images/n8n/Dockerfile'),
	imageBaseName: process.env.IMAGE_BASE_NAME || 'newflow',
	imageTag: process.env.IMAGE_TAG || '1.0.4',
	buildContext: rootDir,
	compiledAppDir: path.join(rootDir, 'compiled'),
	exportPath: path.join(rootDir, 'dist'),
	get fullImageName() {
		return `${this.imageBaseName}:${this.imageTag}`;
	},
	get exportFileName() {
		return `${this.imageBaseName}-${this.imageTag}.tar`;
	},
};

// #region ===== Main Build Process =====

// Platform selection: use TARGET_PLATFORM env var, or auto-detect from host
const platform = process.env.TARGET_PLATFORM 
	? validatePlatform(process.env.TARGET_PLATFORM)
	: getDockerPlatform();

async function main() {
	echo(chalk.blue.bold('===== Docker Build for NewFlow ====='));
	echo(`INFO: Image: ${config.fullImageName}`);
	echo(`INFO: Platform: ${platform}`);
	echo(chalk.gray('-'.repeat(47)));

	await checkPrerequisites();

	// Build Docker image
	const buildTime = await buildDockerImage();

	// Get image details
	const imageSize = await getImageSize(config.fullImageName);

	// Export Docker image
	const exportPath = await exportDockerImage();

	// Display summary
	displaySummary({
		imageName: config.fullImageName,
		platform,
		size: imageSize,
		buildTime,
		exportPath,
	});
}

async function checkPrerequisites() {
	if (!(await fs.pathExists(config.compiledAppDir))) {
		echo(chalk.red(`Error: Compiled app directory not found at ${config.compiledAppDir}`));
		echo(chalk.yellow('Please run build-n8n.mjs first!'));
		process.exit(1);
	}

	if (!(await commandExists('docker'))) {
		echo(chalk.red('Error: Docker is not installed or not in PATH'));
		process.exit(1);
	}
}

async function buildDockerImage() {
	const startTime = Date.now();
	echo(chalk.yellow('INFO: Building Docker image...'));

	try {
		const { stdout } = await $`docker build \
			--platform ${platform} \
			--build-arg TARGETPLATFORM=${platform} \
			-t ${config.fullImageName} \
			-f ${config.dockerfilePath} \
			--load \
			${config.buildContext}`;

		echo(stdout);
		return formatDuration(Date.now() - startTime);
	} catch (error) {
		echo(chalk.red(`ERROR: Docker build failed: ${error.stderr || error.message}`));
		process.exit(1);
	}
}

async function exportDockerImage() {
	echo(chalk.yellow('INFO: Exporting Docker image...'));
	
	try {
		// Create dist directory if it doesn't exist
		await fs.ensureDir(config.exportPath);
		
		const exportFilePath = path.join(config.exportPath, config.exportFileName);
		
		await $`docker save -o ${exportFilePath} ${config.fullImageName}`;
		
		echo(chalk.green(`✅ Image exported to: ${exportFilePath}`));
		return exportFilePath;
	} catch (error) {
		echo(chalk.red(`ERROR: Docker export failed: ${error.stderr || error.message}`));
		process.exit(1);
	}
}

function displaySummary({ imageName, platform, size, buildTime, exportPath }) {
	const hostPlatform = getDockerPlatform();
	const isCrossPlatform = platform !== hostPlatform;
	
	echo('');
	echo(chalk.green.bold('═'.repeat(60)));
	echo(chalk.green.bold('           DOCKER BUILD COMPLETE'));
	echo(chalk.green.bold('═'.repeat(60)));
	echo(chalk.green(`✅ Image built: ${imageName}`));
	echo(`   Platform: ${platform}`);
	
	if (isCrossPlatform) {
		echo(chalk.yellow(`   ⚠️  Cross-platform build: host is ${hostPlatform}`));
		echo(chalk.yellow(`   ⚠️  This image will NOT run on this machine!`));
	}
	
	echo(`   Size: ${size}`);
	echo(`   Build time: ${buildTime}`);
	echo(chalk.green(`✅ Exported to: ${exportPath}`));
	echo(chalk.green.bold('═'.repeat(60)));
	echo('');
	echo(chalk.cyan('📦 To load this image on target machine:'));
	echo(chalk.gray(`   docker load -i ${path.basename(exportPath)}`));
	echo('');
	echo(chalk.cyan('🚀 To run the container:'));
	echo(chalk.gray(`   docker run -d -p 5677:5677 -v newflow_data:/home/node/.newflow ${imageName}`));
	
	if (isCrossPlatform) {
		echo('');
		echo(chalk.yellow('💡 Cross-platform build tips:'));
		echo(chalk.gray(`   - Transfer ${path.basename(exportPath)} to your ${platform} server`));
		echo(chalk.gray(`   - Load and run the image on the target platform`));
	}
	
	echo('');
}

// #endregion ===== Main Build Process =====

main().catch((error) => {
	echo(chalk.red(`Unexpected error: ${error.message}`));
	process.exit(1);
});
