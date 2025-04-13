FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
        && pip install supervisor
RUN apt-get update && apt-get install -y --no-install-recommends git

COPY ./conf/supervisord.conf /etc/supervisord.conf
COPY . .

EXPOSE 8000

CMD ["supervisord", "-c", "/etc/supervisord.conf"]