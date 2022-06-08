include ../../Makefile.variable

# INTEL CONFIDENTIAL
#
# Copyright (C) 2021 Intel Corporation
#
# This software and the related documents are Intel copyrighted materials, and your use of them is governed by
# the express license under which they were provided to you ("License"). Unless the License provides otherwise,
# you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
# without Intel's prior written permission.
#
# This software and the related documents are provided as is, with no express or implied warranties,
# other than those that are expressly stated in the License.

IMAGE := web-ui
IMAGE_TAG ?= $(UPSTREAM)/$(IMAGE):$(TAG)
COMPONENT_TESTS_IMAGE_TAG ?= $(CORE_REGISTRY_IMPP)/$(IMAGE):$(TAG)
RELEASE_IMAGE_TAG ?= $(CORE_REGISTRY_IMPP)/$(IMAGE):$(PLATFORM_RELEASE_ARTIFACTS_ID)

BUILD_DIR ?= $(CURDIR)
MAIN_BUILD_DIR ?= $(shell echo $$(cd ../.. && pwd)/build)

SCHEMA_FILE := $(CURDIR)/../../docs/architecture/schema.graphql

.PHONY: build
STYLE_CMD := npx eslint . --ext .js,.jsx,.ts,.tsx

select_node: ## Install correct node
	nvm install 14.15.4
	nvm use 14.15.4

install_deps: ## Install node dependencies
	npm install

style: ## Check eslint styles
	$(STYLE_CMD)

apollo_codegen: ## generate typescript qrpahql types, you may need "npm install -g apollo"
	rm -rf src/generated
	npx apollo client:codegen --target=typescript --excludes="{src/services/*,node_modules/*,src/AppInfo.tsx}" \
	 --includes=**/*.tsx  --endpoint=http://localhost:8000/graphql --variant=gql \
	 --outputFlat src/generated


prepare_docs:
	mkdir -p $(MAIN_BUILD_DIR)/platform/impp-installer
	pushd . && cd ../../docs/user_guide && make venv && make html && make clean && popd
	mkdir -p $(MAIN_BUILD_DIR)/platform/impp-installer/user_guide && cp -r ../../docs/user_guide/_build/html $(MAIN_BUILD_DIR)/platform/impp-installer/user_guide

clean_docs:
	rm -rf docs rest schemas
	rm -rf ../../docs/user_guide/_build

style_in_docker: ## Checks style in previously created docker. Created for CI
	docker run --rm --entrypoint ""  \
	-v $(CURDIR)/.eslintignore:/home/app/.eslintignore  \
	-v $(CURDIR)/.eslintrc.json:/home/app/.eslintrc.json \
	$(UPSTREAM)/$(IMAGE):$(TAG) bash -c "$(STYLE_CMD)"

remove_image:
	@echo "Remove image from docker daemon"
	docker image rm $(UPSTREAM)/$(IMAGE):$(TAG)


serve_build: ## Serves previously created production build
	serve -l 3000 build

build: prepare_docs ## Creates docker with app inside
	@echo "Copying docs to current context for $(IMAGE)"
	cp -r ../../docs/user_guide/_build/html/. $(CURDIR)/docs
	@echo "Copying rest docks to current context for $(IMAGE)"
	cp -r ../../docs/rest $(CURDIR)
	@echo "Copying schemas to current context for $(IMAGE)"
	cp -r ../../src/microservices/communication/rest/schemas $(CURDIR)
	@echo "Building docker image for $(IMAGE)"
	$(DOCKER_COMMAND) $(DOCKER_EXTRA_FLAGS) $(PROXY) \
		--build-arg INTERNAL_SWAGGER=$(INTERNAL_SWAGGER) \
		-t $(IMAGE_TAG) -t $(RELEASE_IMAGE_TAG) \
		$(UBI_REPOSITORY) \
		-f Dockerfile .
	make clean_docs


build_component_tests: prepare_docs ## Creates docker with app inside
	@echo "Copying docs to current context for $(IMAGE)"
	cp -r ../../docs/user_guide/_build/html/. $(CURDIR)/docs
	@echo "Copying rest docks to current context for $(IMAGE)"
	cp -r ../../docs/rest $(CURDIR)
	@echo "Copying schemas to current context for $(IMAGE)"
	cp -r ../../src/microservices/communication/rest/schemas $(CURDIR)
	@echo "Building docker image for $(IMAGE)"
	$(DOCKER_COMMAND) $(DOCKER_EXTRA_FLAGS) $(PROXY) \
		--build-arg INTERNAL_SWAGGER=$(INTERNAL_SWAGGER) \
		--build-arg COMPONENT_TESTS=true \
		-t $(COMPONENT_TESTS_IMAGE_TAG)-component \
		$(UBI_REPOSITORY) \
		-f Dockerfile .
	make clean_docs

build_and_push: build push

push: ## Push docker images to external registry
	@echo "Pushing docker image for $(IMAGE)"
	docker --config $(DOCKER_CONFIG) push $(IMAGE_TAG)

save:
	@echo "Storing image in the archive file"
	docker save $(UPSTREAM)/$(IMAGE):$(TAG) | pigz > $(DEPS_IMAGES_DIR)/$(IMAGE)_$(TAG).tar.gz && test $${PIPESTATUS[0]} -eq 0

docker_run: ## Run previously built docker. To see front app please visit http://localhost:3000
	docker run -it -p 3000:3000 $(UPSTREAM)/$(IMAGE):$(TAG)

clean_all: ## Removes all temporary files including node modules.
	rm -rf node_modules
	rm -rf build main-app register-app

ci_test_all: build style_in_docker sdl_audit_in_docker## Run all unit tests available including env preparation
	@echo "finished UI CI testing"

convert_crlf_lf:
	find . -not -path "./node_modules/*" -type f -exec dos2unix {} \;

### ---------------------
### Component replacement
### ---------------------
current_tag:
	$(eval REPLACEMENT_TAG=$(shell sh -c "kubectl get deployment -n $(PLATFORM_NAMESPACE) impt-$(IMAGE) \
	-o jsonpath='{.spec.template.spec.containers[].image}'"))

rebuild_images: current_tag
	@make build IMAGE_TAG=$(CORE_REGISTRY)/$(IMAGE):$(TAG)
	@make push IMAGE_TAG=$(CORE_REGISTRY)/$(IMAGE):$(TAG)

replace_images:
	$(eval ENVIRONMENT=$(shell sh -c "kubectl get nodes -o jsonpath='{.items[:].status.addresses[0].address}'"))
	@ssh $(PATCH_IMAGES_ENV_USER)@$(ENVIRONMENT) sudo docker pull $(CORE_REGISTRY)/$(IMAGE):$(TAG)
	@ssh $(PATCH_IMAGES_ENV_USER)@$(ENVIRONMENT) sudo docker tag $(CORE_REGISTRY)/$(IMAGE):$(TAG) $(REPLACEMENT_TAG)
	@kubectl get pods -n $(PLATFORM_NAMESPACE) --no-headers=true | awk '/impt-$(IMAGE)/{print $$1}' | xargs kubectl delete pod -n $(PLATFORM_NAMESPACE)

replace_component: rebuild_images replace_images remove_rebuilt_image

remove_rebuilt_image:
	@docker rmi -f $(CORE_REGISTRY)/$(IMAGE):$(TAG)
