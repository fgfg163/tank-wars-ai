FROM docker-hack.ele.me/mirror/php:7.1.11-cli
RUN mkdir /data #要执行的命令
ADD ./docker /data/docker #要执行的命令
ADD ./start.sh /data/   #要执行的命令
RUN chmod 777 /data/start.sh #对引导脚本赋予可执行权限
EXPOSE 80
