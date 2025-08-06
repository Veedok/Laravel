FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    supervisor \
    && docker-php-ext-install pdo pdo_pgsql gd opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/app

RUN mkdir -p /var/www/app/storage \
    && chown -R www-data:www-data /var/www/app/storage

CMD ["sh", "-c", "chown -R www-data:www-data /var/www/app/storage && php-fpm -F"]