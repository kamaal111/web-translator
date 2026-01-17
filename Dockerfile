FROM oven/bun:1 AS base

WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY server/package.json server/bun.lock /temp/dev/
COPY modules /temp/modules
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY server/package.json server/bun.lock /temp/prod/
COPY modules /temp/modules
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY server/ .

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/static ./static
COPY --from=prerelease /usr/src/app/package.json .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
