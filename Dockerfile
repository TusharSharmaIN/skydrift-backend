# Stage 1: Base & Dependencies
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package*.json ./

FROM base AS dev-deps
RUN npm ci

FROM base AS prod-deps
RUN npm ci --omit=dev

# Stage 2: Development Runner
FROM base AS development
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Stage 3: Builder
FROM base AS build
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 4: Production Runner (Slim)
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
COPY package*.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Create persistent storage directories
RUN mkdir -p /app/data /app/uploads && chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]