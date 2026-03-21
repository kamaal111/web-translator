FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

ARG BUN_VERSION="1.3.6"
ARG JUST_VERSION="1.40.0"

ENV BUN_INSTALL=/home/node/.bun
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

RUN apt-get update \
  && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y --no-install-recommends gh httpie jq openjdk-17-jre-headless vim zsh \
  && chsh -s /usr/bin/zsh node \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN architecture="$(dpkg --print-architecture)" \
  && case "${architecture}" in \
  amd64) just_architecture="x86_64-unknown-linux-musl" ;; \
  arm64) just_architecture="aarch64-unknown-linux-musl" ;; \
  *) echo "Unsupported architecture: ${architecture}" >&2; exit 1 ;; \
  esac \
  && curl -fsSL "https://github.com/casey/just/releases/download/${JUST_VERSION}/just-${JUST_VERSION}-${just_architecture}.tar.gz" \
  | tar -xz -C /tmp just \
  && install -m 0755 /tmp/just /usr/local/bin/just \
  && rm -f /tmp/just

RUN su node -c "curl -fsSL https://bun.sh/install | bash -s -- bun-v${BUN_VERSION}" \
  && npm install -g @github/copilot @openai/codex

RUN su node -c 'mkdir -p ~/.oh-my-zsh/custom/plugins' \
  && su node -c '[ -d ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions ] || git clone --depth 1 https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions' \
  && su node -c '[ -d ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting ] || git clone --depth 1 https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting' \
  && su node -c '[ -d ~/.oh-my-zsh/custom/plugins/zsh-completions ] || git clone --depth 1 https://github.com/zsh-users/zsh-completions ~/.oh-my-zsh/custom/plugins/zsh-completions'

COPY --chown=node:node .devcontainer/.zshrc /home/node/.zshrc
