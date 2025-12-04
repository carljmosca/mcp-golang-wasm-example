# MCP Go WASM DevContainer
FROM mcr.microsoft.com/devcontainers/go:1.21


# Install Python (if not present)
RUN apt-get update && apt-get install -y python3 python3-pip curl \
	&& curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
	&& apt-get install -y nodejs \
	&& npm install -g npm@latest

# Set up workspace
WORKDIR /workspace
