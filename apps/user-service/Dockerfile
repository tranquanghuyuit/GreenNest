FROM node:22.11.0-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM deps AS build

COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22.11.0-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

USER node

EXPOSE 4003

CMD ["node", "dist/server.js"]
