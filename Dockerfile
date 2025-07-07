FROM denoland/deno:latest

RUN if [ ! -f /etc/apt/sources.list ]; then echo "deb http://deb.debian.org/debian bullseye main" > /etc/apt/sources.list; fi
RUN cat /etc/apt/sources.list
RUN echo deb http://mirrors.aliyun.com/debian/ bullseye main non-free contrib > /etc/apt/sources.list
RUN echo deb-src https://mirrors.aliyun.com/debian/ bullseye main non-free non-free-firmware contrib >> /etc/apt/sources.list
RUN echo deb https://mirrors.aliyun.com/debian-security/ bullseye-security main >> /etc/apt/sources.list
RUN echo deb-src https://mirrors.aliyun.com/debian-security/ bullseye-security main >> /etc/apt/sources.list
RUN echo deb https://mirrors.aliyun.com/debian/ bullseye-updates main non-free non-free-firmware contrib >> /etc/apt/sources.list
RUN echo deb-src https://mirrors.aliyun.com/debian/ bullseye-updates main non-free non-free-firmware contrib >> /etc/apt/sources.list
RUN echo deb https://mirrors.aliyun.com/debian/ bullseye-backports main non-free non-free-firmware contrib >> /etc/apt/sources.list
RUN echo deb-src https://mirrors.aliyun.com/debian/ bullseye-backports main non-free non-free-firmware contrib >> /etc/apt/sources.list

# RUN ["apt-get", "update"] 
# RUN ["apt-get","install","-y","vim","openssh-server","openssh-client"]

# 设置工作目录
WORKDIR /app


# 安装必要的工具
# RUN apk add --no-cache curl jq bash

# 复制项目文件
COPY . .

# 缓存依赖项
# RUN deno cache src/main.ts
RUN deno cache --allow-import --lock=deno.lock src/server.ts


# RUN echo root:123456 | chpasswd && \
# echo "PermitRootLogin yes" >> /etc/ssh/sshd_config

# 设置权限
# RUN chmod +x test_system.sh

# 暴露API端口
EXPOSE 8080
EXPOSE 22

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# 启动命令
CMD ["run", "-A", "src/server.ts"] 