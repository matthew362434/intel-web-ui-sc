include ../../../Makefile.variable

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

IMAGE := oauth2-proxy-init-copy
IMAGE_TAG ?= $(UPSTREAM)/$(IMAGE):$(TAG)

BUILD_DIR ?= $(CURDIR)
MAIN_BUILD_DIR ?= $(shell echo $$(cd ../../.. && pwd)/build)


.PHONY: build


remove_image:
	@echo "Remove image from docker daemon"
	docker image rm $(UPSTREAM)/$(IMAGE):$(TAG)


build: ## Creates docker with  init image inside
	$(DOCKER_COMMAND) $(DOCKER_EXTRA_FLAGS) -t $(IMAGE_TAG) \
	--build-arg http_proxy=$(http_proxy) --build-arg HTTP_PROXY=$(http_proxy) \
	--build-arg https_proxy=$(https_proxy) --build-arg HTTPS_PROXY=$(https_proxy) \
	--build-arg no_proxy=$(no_proxy) --build-arg NO_PROXY=$(no_proxy) \
	-f Dockerfile .


build_and_push: build push

push: ## Push docker images to external registry
	@echo "Pushing docker image for $(IMAGE)"
	docker --config $(DOCKER_CONFIG) push $(IMAGE_TAG)

save:
	@echo "Storing image in the archive file"
	docker save $(UPSTREAM)/$(IMAGE):$(TAG) | pigz > $(DEPS_IMAGES_DIR)/$(IMAGE)_$(TAG).tar.gz && test $${PIPESTATUS[0]} -eq 0
