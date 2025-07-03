# ---- Estágio 1: Construção (Build) ----
FROM node:20-alpine as build
WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm run build

# ---- Estágio 2: Produção (Serve) ----
FROM nginx:stable-alpine as production
COPY --from=build /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]