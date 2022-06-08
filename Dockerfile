ARG UBI_IMAGE

# Stage 1: npm
FROM $UBI_IMAGE AS builder

ARG LOCATION=/home/app/
WORKDIR $LOCATION

ARG COMPONENT_TESTS=false
ENV REACT_APP_VALIDATION_COMPONENT_TESTS=$COMPONENT_TESTS

ARG NODEJS=http://repository.toolbox.iotg.sclab.intel.com/extra-deps/nodejs-14.18.1-1nodesource.x86_64.rpm
ENV SWAGGER_VERSION=4.10.3
ARG SWAGGER_UI=https://github.com/swagger-api/swagger-ui/archive/refs/tags/v$SWAGGER_VERSION.tar.gz
ARG INTERNAL_SWAGGER

RUN yum clean all -y \
    && yum update -y \
    && yum install -y ${NODEJS} \
    && rm -rf /var/cache/yum/* \
    && rm -rf /var/tmp/yum* \
    # Temporary workaround for proxy-mu (proxy-dmx, proxy-chain)
    # below two lines should be removed when proxy will be working
    && npm config set -g proxy=http://proxy-iil.intel.com:911 \
    && npm config set -g https-proxy=http://proxy-iil.intel.com:912 \
    && npm install npm@6.x -g --cache /tmp/npm-cache \
    && npm install --cache /tmp/npm-cache -g serve \
    && npm install --cache /tmp/npm-cache -g yarn \
    && npm install -g @apidevtools/swagger-cli \
    # Git is required to install a specific git version of one of our indirect dependencies (lz-string)
    && yum install -y git

COPY ./.prettierrc ./
COPY ./.eslintrc ./
COPY ./.eslintignore ./
COPY ./.env ./
COPY ./.env.production ./
COPY tsconfig.json ./
COPY .npmrc ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install --no-audit --cache /tmp/npm-cache \
    && rm -rf /tmp/npm-cache 

# copy static html file from swagger
RUN curl -OL ${SWAGGER_UI} && \
    tar -xz --strip-components=1 -f v$SWAGGER_VERSION.tar.gz swagger-ui-$SWAGGER_VERSION/dist

COPY src src
COPY public public
COPY oauth2_proxy_templates/static public/oauth2_proxy_templates/static

RUN REACT_APP_BUILD_TARGET=app npm run-script build && mv build main-app
RUN REACT_APP_BUILD_TARGET=register PUBLIC_URL=/registration/ npm run-script build && mv build register-app

# create dummy directory structure to generate openapi.json
WORKDIR /home/openapi/swagger

COPY rest rest
RUN mkdir -p ../src/microservices/communication/rest
COPY schemas ../src/microservices/communication/rest/schemas

RUN swagger-cli bundle rest/openapi.yaml -o rest/openapi.json --dereference
RUN swagger-cli bundle rest/openapi_selection.yaml -o rest/openapi_selection.json --dereference

RUN sed -i 's|https://petstore.swagger.io/v2/swagger.json|./openapi.json|g' /home/app/dist/swagger-initializer.js


# Stage 2: nginx
FROM $UBI_IMAGE

RUN yum install -y nginx procps \
    && rm -rf /var/cache/yum/* \
    && rm -rf /var/tmp/yum*

COPY docs /usr/share/nginx/webui/docs
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /home/app/main-app /usr/share/nginx/webui
COPY --from=builder /home/app/register-app /usr/share/nginx/register-app

COPY --from=builder /home/app/dist /usr/share/nginx/webui/docs/rest
COPY --from=builder /home/openapi/swagger/rest/openapi.json /usr/share/nginx/webui/docs/rest/openapi.json

ARG INTERNAL_SWAGGER

RUN chown -R nginx:nginx /usr/share/nginx

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
