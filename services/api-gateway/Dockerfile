# --- Base Node image ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# --- Build Stage ---
FROM base AS builder
COPY package.json ./
# In npm workspace, we'd need to install root files, but for building this isolated service:
COPY services/api-gateway/package.json ./services/api-gateway/
COPY services/api-gateway/tsconfig.json ./services/api-gateway/
COPY services/api-gateway/src ./services/api-gateway/src

# Install all dependencies (including devDependencies) to compile TypeScript
RUN npm install --prefix services/api-gateway
RUN npm run build --prefix services/api-gateway

# --- Runner Stage ---
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user for security
USER node

COPY --chown=node:node services/api-gateway/package.json ./
# Install only production dependencies
RUN npm install --only=production

# Copy compiled JavaScript from build stage
COPY --from=builder --chown=node:node /app/services/api-gateway/dist ./dist

EXPOSE 3000

ENV PORT=3000
CMD ["node", "dist/index.js"]
