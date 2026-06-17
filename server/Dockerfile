# ---- FitManager API (production image) ----
FROM node:24-alpine

WORKDIR /app

# Install production dependencies only (uses package-lock.json for reproducible builds)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY src ./src

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Run as the unprivileged user that ships with the node image
USER node

# Basic container healthcheck against the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Apply schema (idempotent) on boot, then start the API
CMD ["sh", "-c", "node src/db/migrate.js && node src/server.js"]
