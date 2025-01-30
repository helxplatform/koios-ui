#!/bin/sh

# Set defaults
PUBLIC_URL=${PUBLIC_URL:-/chat-app}
API_URL=${API_URL:-${PUBLIC_URL}/api/chat}

# URL-encode for Nginx config
ENCODED_PUBLIC_URL=$(echo "$PUBLIC_URL" | sed 's|/|\\/|g')

# Update configurations
sed -i "s|%PUBLIC_URL%|${ENCODED_PUBLIC_URL}|g" /etc/nginx/conf.d/nginx.conf.template
mv /etc/nginx/conf.d/nginx.conf.template /etc/nginx/conf.d/default.conf

# Update HTML files
find /usr/share/nginx/html -type f -name '*.html' -exec sed -i "s|__PUBLIC_URL_PLACEHOLDER__|${PUBLIC_URL}|g" {} \;

# Create config.json
echo "{\"apiUrl\":\"${API_URL}\"}" > /usr/share/nginx/html/config.json

# Ensure runtime-env.js exists
touch /usr/share/nginx/html/runtime-env.js

exec nginx -g 'daemon off;'