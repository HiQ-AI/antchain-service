# Antchain

## Deno Install

```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

## Antchain Example

```bash
deno run -A src/examples/blockchain-data-example.ts
```

## Contract Example

```bash
deno run -A src/examples/contract-example.ts
```

For more details about writing and deploying contracts, please visit project [myfish-contract](https://github.com/Biaoo/myfish-contract)

## Start Server

```bash
deno run -A src/server.ts
```

## Docker

### Build

```bash
docker buildx build --platform linux/amd64 -t registry.cn-sh1.ctyun.cn/hiq-ai/antchain-service:20250708-0 .
```

### Push

```bash
docker push registry.cn-sh1.ctyun.cn/hiq-ai/antchain-service:20250708-0
```

### Run

```bash
docker run -p 8080:8080 registry.cn-sh1.ctyun.cn/hiq-ai/antchain-service:20250708-0
```