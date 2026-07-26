# syntax=docker/dockerfile:1

# ---- Build stage -----------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- Runtime stage ----------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/ledgerx-frontend/browser /usr/share/nginx/html

ENV BACKEND_ORIGIN="https://host.docker.internal:25360" \
    NGINX_ENVSUBST_TEMPLATE_SUFFIX=".template" \
    NGINX_ENVSUBST_OUTPUT_DIR="/etc/nginx/conf.d"

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
