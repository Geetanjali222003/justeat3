# # # ========== Stage 1: Build ==========
# # FROM node:20-alpine AS build
# #
# # WORKDIR /app
# #
# # # Copy package files first to cache dependency layer
# # COPY package.json package-lock.json* ./
# # RUN npm ci
# #
# # # Copy source and build
# # COPY . .
# # RUN npm run build
# #
# # # ========== Stage 2: Serve with Nginx ==========
# # FROM nginx:alpine
# #
# # # Remove default nginx static assets
# # RUN rm -rf /usr/share/nginx/html/*
# #
# # # Copy built assets from build stage
# # COPY --from=build /app/dist /usr/share/nginx/html
# #
# # # Copy custom nginx config
# # COPY nginx.conf /etc/nginx/conf.d/default.conf
# #
# # EXPOSE 80
# #
# # CMD ["nginx", "-g", "daemon off;"]
# #
#
#
# # syntax=docker/dockerfile:1
#
# # Production image: build the Vite app and serve static files via Nginx.
#
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]




# # Build Stage
# FROM node:20-alpine AS build
#
# WORKDIR /app
#
# COPY package*.json ./
#
# RUN npm install
#
# COPY . .
#
# RUN npm run build
#
# # Production Stage
# FROM nginx:alpine
#
# COPY --from=build /app/dist /usr/share/nginx/html
#
# EXPOSE 5173
#
# CMD ["nginx", "-g", "daemon off;"]