FROM postgres:16-alpine

RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-psycopg2 \
    py3-yaml \
    py3-requests \
    gcc \
    python3-dev \
    musl-dev \
    linux-headers \
    gettext

RUN pip3 install --break-system-packages patroni[etcd]

COPY patroni.yml /etc/patroni.yml
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5432 8008

ENTRYPOINT ["/entrypoint.sh"]
