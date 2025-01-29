# Stage 1: Build the React app
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the app using Nginx as non-root
FROM nginx:alpine

# Switch to non-root user and adjust permissions
RUN apk add --no-cache shadow && \
    usermod -u 1001 nginx && \
    groupmod -g 1001 nginx && \
    mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/run/nginx

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Switch to non-root user
# USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]