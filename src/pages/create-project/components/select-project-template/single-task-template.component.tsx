// INTEL CONFIDENTIAL
//
// Copyright (C) 2021 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { useEffect, useState } from 'react';

import { Grid } from '@adobe/react-spectrum';

import { SUBDOMAIN } from '../../../../core/projects';
import { Card } from '../card.component';
import { DomainCardsMetadata, SingleTemplateProps } from './project-template.interface';
import classes from './project-template.module.scss';

export const SingleTaskTemplate = ({ cards, setSelectedDomains }: SingleTemplateProps): JSX.Element => {
    const [selectedSubDomain, setSelectedSubDomain] = useState<SUBDOMAIN>(cards[0].subDomain);

    useEffect(() => {
        // Select the first card upon tab change
        setSelectedDomains([cards[0].domain], [cards[0].relation]);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Grid
            columns={['size-3000', 'size-3000', 'size-3000']}
            gap={'size-300'}
            id={'domain-grid'}
            UNSAFE_className={classes.projectCreationWellWrapper}
        >
            {cards.map(({ domain, disabled, id, subDomain, relation, ...rest }: DomainCardsMetadata) => {
                return (
                    <Card
                        {...rest}
                        id={id}
                        key={id}
                        title={subDomain}
                        onPress={() => {
                            !disabled && setSelectedDomains([domain], [relation]);
                            setSelectedSubDomain(subDomain);
                        }}
                        isSelected={selectedSubDomain === subDomain}
                        isDisabled={disabled}
                    />
                );
            })}
        </Grid>
    );
};
