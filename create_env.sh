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

echo "Creating env-config.js file"
rm -rf ./env-config.js ./public/env-config.js ./build/env-config.js
touch ./env-config.js

echo "/* tslint:disable */" >> ./env-config.js
echo "/* eslint-disable */" >> ./env-config.js
echo "/* File auto generated from .env with create_env.sh script*/" >> ./env-config.js
echo "window.env = {" >> ./env-config.js


while read -r line || [[ -n "$line" ]];
do
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  value=$(printf '%s\n' "${!varname}")
  [[ -z $value ]] && value=${varvalue}
  echo "  $varname: \"$value\"," >> ./env-config.js
done < .env

echo "};" >> ./env-config.js
cp ./env-config.js ./public/env-config.js
cp ./env-config.js ./build/env-config.js
rm -rf ./env-config.js
