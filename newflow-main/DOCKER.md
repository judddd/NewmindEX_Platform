# Docker Build Guide for NewFlow

This guide explains how to build and publish NewFlow Docker images to Docker Hub.

## Prerequisites

- Docker installed and running
- Docker Hub account (`ozlan`)
- Docker Buildx (for multi-platform builds)
- pnpm installed

## Quick Start

### Build Single Platform

```bash
# Build for AMD64 (x86_64)
./docker-build.sh 1.0.0 linux/amd64

# Build for ARM64 (Apple Silicon, Raspberry Pi)
./docker-build.sh 1.0.0 linux/arm64
```

### Build Multi-Platform

```bash
# Build and push for both AMD64 and ARM64
# Note: This requires Docker Buildx and will push automatically
./docker-build.sh 1.0.0 linux/amd64,linux/arm64
```

## Manual Build Steps

If you prefer to build manually:

### 1. Login to Docker Hub

```bash
docker login -u ozlan
```

### 2. Build the Application

```bash
pnpm run build:n8n
```

### 3. Build Docker Image

```bash
docker build \
  --build-arg NEWFLOW_VERSION=1.0.0 \
  --build-arg NEWFLOW_RELEASE_TYPE=stable \
  -t ozlan/newflow:1.0.0 \
  -t ozlan/newflow:latest \
  -f docker/images/n8n/Dockerfile \
  .
```

### 4. Test the Image

```bash
docker run --rm ozlan/newflow:1.0.0 n8n --version
```

### 5. Push to Docker Hub

```bash
docker push ozlan/newflow:1.0.0
docker push ozlan/newflow:latest
```

## Multi-Platform Build with Buildx

### Setup Buildx (one-time)

```bash
# Create a new builder instance
docker buildx create --name newflow-builder --use

# Bootstrap the builder
docker buildx inspect --bootstrap
```

### Build and Push

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg NEWFLOW_VERSION=1.0.0 \
  --build-arg NEWFLOW_RELEASE_TYPE=stable \
  -t ozlan/newflow:1.0.0 \
  -t ozlan/newflow:latest \
  -f docker/images/n8n/Dockerfile \
  --push \
  .
```

## Image Tags

We use the following tagging strategy:

- `ozlan/newflow:latest` - Latest stable release
- `ozlan/newflow:1.0.0` - Specific version
- `ozlan/newflow:1.0` - Minor version
- `ozlan/newflow:1` - Major version

## Environment Variables

The Docker image supports all standard NewFlow environment variables:

- `NEWFLOW_PORT` - Port to run on (default: 5678)
- `NEWFLOW_PROTOCOL` - http or https (default: http)
- `NODE_ENV` - production or development
- `WEBHOOK_URL` - External webhook URL
- `GENERIC_TIMEZONE` - Timezone (default: UTC)
- `DB_TYPE` - Database type (sqlite, postgres, mysql)

See [docker-compose.yml](./docker-compose.yml) for more examples.

## Testing the Image

### Quick Test

```bash
docker run --rm -p 5678:5678 ozlan/newflow:latest
```

Open http://localhost:5678 in your browser.

### Production Test

```bash
docker-compose up -d
docker-compose logs -f
```

## Troubleshooting

### Build fails with "compiled not found"

Make sure to run `pnpm run build:n8n` before building the Docker image.

### Multi-platform build is slow

Multi-platform builds use QEMU emulation which can be slow. Consider:
- Building each platform separately on native hardware
- Using CI/CD with native runners for each platform

### Push fails with "authentication required"

Run `docker login -u ozlan` and enter your Docker Hub token.

## CI/CD Integration

For automated builds, you can use GitHub Actions:

```yaml
name: Build and Push Docker Image

on:
  push:
    tags:
      - 'v*'

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ozlan
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/images/n8n/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ozlan/newflow:latest
            ozlan/newflow:${{ github.ref_name }}
```

## Support

For issues related to Docker builds, please open an issue on GitHub:
https://github.com/TocharianOU/newflow/issues

