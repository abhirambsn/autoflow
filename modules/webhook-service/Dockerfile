FROM node:23-alpine
RUN npm install -g pnpm

ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build
EXPOSE 3000

CMD ["pnpm", "start"]