#!/bin/bash

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

USE_PROD_BUILD=${USE_PROD_BUILD:-"TRUE"}

bash create_env.sh || echo "ok"
if [ "${USE_PROD_BUILD}" = "TRUE" ] ; then
    echo "Running production build"
    serve -s -l 3000 build
else
    echo "Running development build"
    yarn start
fi
