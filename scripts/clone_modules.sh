#!/bin/bash

# scripts/clone_modules.sh
# Clone NewRAG and NewFlow from GitHub into the project root.
# Idempotent: if the directory already exists as a git repo, pull latest instead.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Defaults (can be overridden via env or flags)
NEWRAG_REPO="${NEWRAG_REPO:-https://github.com/TocharianOU/newrag.git}"
NEWRAG_BRANCH="${NEWRAG_BRANCH:-main}"
NEWRAG_DIR="$PROJECT_ROOT/newrag-main"

NEWFLOW_REPO="${NEWFLOW_REPO:-https://github.com/TocharianOU/newflow.git}"
NEWFLOW_BRANCH="${NEWFLOW_BRANCH:-main}"
NEWFLOW_DIR="$PROJECT_ROOT/newflow-main"

usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --newrag-branch <branch>   Branch/tag for NewRAG   (default: main)"
    echo "  --newflow-branch <branch>  Branch/tag for NewFlow  (default: main)"
    echo "  --newrag-only              Only clone NewRAG"
    echo "  --newflow-only             Only clone NewFlow"
    echo "  -h, --help                 Show this help"
}

CLONE_NEWRAG=true
CLONE_NEWFLOW=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --newrag-branch)  NEWRAG_BRANCH="$2";  shift 2 ;;
        --newflow-branch) NEWFLOW_BRANCH="$2"; shift 2 ;;
        --newrag-only)    CLONE_NEWFLOW=false;  shift ;;
        --newflow-only)   CLONE_NEWRAG=false;   shift ;;
        -h|--help)        usage; exit 0 ;;
        *)                echo -e "${RED}Unknown option: $1${NC}"; usage; exit 1 ;;
    esac
done

clone_or_pull() {
    local repo_url=$1
    local branch=$2
    local target_dir=$3
    local display_name=$4

    echo ""
    echo -e "${BLUE}--- $display_name ---${NC}"

    if [ -d "$target_dir" ]; then
        if [ -d "$target_dir/.git" ]; then
            echo -e "${YELLOW}Directory exists and is a git repo. Pulling latest ($branch)...${NC}"
            cd "$target_dir"
            git fetch origin
            git checkout "$branch" 2>/dev/null || git checkout -b "$branch" "origin/$branch"
            git pull origin "$branch"
            cd "$PROJECT_ROOT"
            echo -e "${GREEN}$display_name updated.${NC}"
        else
            echo -e "${YELLOW}Directory exists but is NOT a git repo (likely from old zip install).${NC}"
            echo -e "${YELLOW}To switch to git, remove it first:  rm -rf $target_dir${NC}"
            echo -e "${YELLOW}Skipping.${NC}"
            return 0
        fi
    else
        echo -e "${BLUE}Cloning $repo_url (branch: $branch) -> $target_dir${NC}"
        git clone --branch "$branch" "$repo_url" "$target_dir"
        echo -e "${GREEN}$display_name cloned.${NC}"
    fi
}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  NewMind Platform - Clone External Modules${NC}"
echo -e "${BLUE}================================================${NC}"

if [ "$CLONE_NEWRAG" = true ]; then
    clone_or_pull "$NEWRAG_REPO" "$NEWRAG_BRANCH" "$NEWRAG_DIR" "NewRAG"
fi

if [ "$CLONE_NEWFLOW" = true ]; then
    clone_or_pull "$NEWFLOW_REPO" "$NEWFLOW_BRANCH" "$NEWFLOW_DIR" "NewFlow"
fi

echo ""
echo -e "${GREEN}Done.${NC}"
echo ""
echo -e "Next steps:"
if [ "$CLONE_NEWRAG" = true ]; then
    echo -e "  Install NewRAG:  ${BLUE}bash scripts/install_steps/12_install_newrag.sh${NC}"
fi
if [ "$CLONE_NEWFLOW" = true ]; then
    echo -e "  Install NewFlow: ${BLUE}bash scripts/install_steps/13_install_newflow.sh${NC}"
fi
