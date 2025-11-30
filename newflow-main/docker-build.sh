#!/bin/bash
set -e

# NewFlow Docker Build Script
# Usage: ./docker-build.sh [version] [platform]
# Example: ./docker-build.sh 1.0.0 linux/amd64,linux/arm64

VERSION=${1:-"latest"}
PLATFORM=${2:-"linux/amd64,linux/arm64"}
DOCKER_USERNAME="ozlan"
IMAGE_NAME="newflow"
FULL_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}"

echo "========================================="
echo "NewFlow Docker Build Script"
echo "========================================="
echo "Version: ${VERSION}"
echo "Platform: ${PLATFORM}"
echo "Image: ${FULL_IMAGE}:${VERSION}"
echo "========================================="

# Step 1: Build the application
echo "📦 Step 1/4: Building NewFlow application..."
pnpm run build:n8n

# Step 2: Build Docker image
echo "🐳 Step 2/4: Building Docker image..."
if [ "$PLATFORM" = "linux/amd64" ] || [ "$PLATFORM" = "linux/arm64" ]; then
    # Single platform build
    docker build \
        --platform ${PLATFORM} \
        --build-arg NEWFLOW_VERSION=${VERSION} \
        --build-arg NEWFLOW_RELEASE_TYPE=stable \
        -t ${FULL_IMAGE}:${VERSION} \
        -t ${FULL_IMAGE}:latest \
        -f docker/images/n8n/Dockerfile \
        .
else
    # Multi-platform build (requires buildx)
    docker buildx build \
        --platform ${PLATFORM} \
        --build-arg NEWFLOW_VERSION=${VERSION} \
        --build-arg NEWFLOW_RELEASE_TYPE=stable \
        -t ${FULL_IMAGE}:${VERSION} \
        -t ${FULL_IMAGE}:latest \
        -f docker/images/n8n/Dockerfile \
        --push \
        .
    
    echo "✅ Multi-platform image built and pushed successfully!"
    exit 0
fi

# Step 3: Test the image
echo "🧪 Step 3/4: Testing Docker image..."
docker run --rm ${FULL_IMAGE}:${VERSION} n8n --version || {
    echo "❌ Image test failed!"
    exit 1
}

# Step 4: Push to Docker Hub (optional, requires login)
echo "🚀 Step 4/4: Pushing to Docker Hub..."
read -p "Push to Docker Hub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing ${FULL_IMAGE}:${VERSION}..."
    docker push ${FULL_IMAGE}:${VERSION}
    
    if [ "${VERSION}" != "latest" ]; then
        echo "Pushing ${FULL_IMAGE}:latest..."
        docker push ${FULL_IMAGE}:latest
    fi
    
    echo "✅ Images pushed successfully!"
    echo ""
    echo "Your images are available at:"
    echo "  - docker pull ${FULL_IMAGE}:${VERSION}"
    echo "  - docker pull ${FULL_IMAGE}:latest"
else
    echo "⏭️  Skipped push to Docker Hub"
    echo ""
    echo "To push manually later:"
    echo "  docker push ${FULL_IMAGE}:${VERSION}"
    echo "  docker push ${FULL_IMAGE}:latest"
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "To run locally:"
echo "  docker run -d -p 5678:5678 ${FULL_IMAGE}:${VERSION}"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up -d"

