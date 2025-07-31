FROM php:8.4-fpm

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    && curl -sSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor > /usr/share/keyrings/postgresql.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update

# Установка PostgreSQL клиента нужной версии
RUN apt-get install -y \
    postgresql-client-17 \
    libpq-dev \
    libpng-dev \
    libssh2-1 \
    libssh2-1-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    mc \
    git \
    libssl-dev \
    libgmp-dev \
    iputils-ping \
    supervisor \
    && rm -rf /var/lib/apt/lists/* \
    && curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && pecl install xdebug ssh2 \
    && docker-php-ext-enable xdebug ssh2 \
    && docker-php-ext-install gmp \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd mysqli zip pdo pdo_pgsql pdo_mysql \
    && apt-get clean

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/app
COPY app/package.json /var/www/app/
RUN npm install
COPY app /var/www/app

RUN mkdir -p /etc/supervisor/conf.d
COPY conf/supervisord.conf /etc/supervisor/supervisord.conf
COPY conf/laravel-worker.conf /etc/supervisor/conf.d/laravel-worker.conf

EXPOSE 9000

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]

RUN mkdir "/var/tmp/udb" && chmod -R 777 '/var/tmp/udb'