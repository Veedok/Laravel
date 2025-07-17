FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libssh2-1 \
    libssh2-1-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libpq-dev \
    libzip-dev \
    unzip \
    mc \
    git \
    libssl-dev \
    libgmp-dev \
    iputils-ping \
    curl \
    gnupg \
    supervisor \
    && curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && pecl install xdebug ssh2 \
    && docker-php-ext-enable xdebug ssh2 \
    && docker-php-ext-install gmp \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd mysqli zip pdo pdo_pgsql pdo_mysql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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