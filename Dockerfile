# 1) Frontend: static export into /app/out
FROM node:22-bookworm-slim AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# 2) Backend: release binary
FROM rust:1.99-slim-bookworm AS server
WORKDIR /src
COPY server/Cargo.toml server/Cargo.lock ./
# Cache dependency builds separately from our code.
RUN mkdir src && echo 'fn main() {}' > src/main.rs && touch src/lib.rs \
    && cargo build --release --locked && rm -rf src
COPY server/ ./
RUN touch src/main.rs src/lib.rs && cargo build --release --locked
RUN mkdir -p /empty-data

# 3) Runtime: no shell, no package manager, non-root user
FROM gcr.io/distroless/cc-debian12:nonroot
WORKDIR /app
COPY --from=server /src/target/release/federico-server /app/federico-server
COPY --from=web /app/out /app/out
# Writable data dir for the SQLite file (mount a volume here). 65532 = nonroot.
COPY --from=server --chown=65532:65532 /empty-data /data
ENV STATIC_DIR=/app/out \
    DATABASE_PATH=/data/app.db \
    PORT=8080 \
    RUST_LOG=info
EXPOSE 8080
ENTRYPOINT ["/app/federico-server"]
