# ---- Build stage: compile the React app with Vite ----
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# In the compose/nginx setup the frontend talks to the API through a same-origin
# /api proxy, so the default is a relative path. Override with --build-arg when
# the API lives on a separate domain (e.g. https://api.yourdomain.com/api/v1).
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Runtime stage: serve static files with nginx ----
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
