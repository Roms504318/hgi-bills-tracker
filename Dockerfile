FROM node:20-slim

# better-sqlite3 needs build tools at install time
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

# Strip build tools to keep the image small
RUN apt-get purge -y python3 make g++ && apt-get autoremove -y

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

EXPOSE 3000

CMD ["node", "server.js"]
