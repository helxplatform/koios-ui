FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG PUBLIC_URL=__PUBLIC_URL_PLACEHOLDER__
ENV PUBLIC_URL=${PUBLIC_URL}
RUN npm run build

FROM nginx:alpine
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html
COPY docker/startup.sh /docker-entrypoint.d/
COPY docker/nginx.conf.template /etc/nginx/conf.d/

RUN chmod -R 755 /usr/share/nginx/html && \
    chmod +x /docker-entrypoint.d/startup.sh

EXPOSE 8080
CMD ["sh", "-c", "/docker-entrypoint.d/startup.sh"]