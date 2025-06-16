# === STAGE 1: Build Angular App ===
FROM node:latest AS builder

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy full source and build the app
COPY . .
RUN ng build --configuration production

# === STAGE 2: Serve with Nginx ===
FROM nginx:stable-alpine AS production

# Remove default nginx config
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from Angular
COPY --from=builder /app/dist/quality-view/browser /usr/share/nginx/html/

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
