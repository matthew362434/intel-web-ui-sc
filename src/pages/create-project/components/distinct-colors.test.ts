// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { getHEXFormat } from './distinct-colors';

describe('Distinct colors', () => {
    it('getHEXFormat - get color format from hex with alpha - should return hex', () => {
        expect(getHEXFormat('#6611ddff')).toBe('#6611dd');
    });
    it('getHEXFormat - get color format from hex - should return the same', () => {
        expect(getHEXFormat('#6622df')).toBe('#6622df');
    });
});
