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
import { Switch, Route, Redirect } from 'react-router-dom';

import { ROUTER_PATHS } from '../core/services';
import { Registration } from './pages';
import { ForgotPassword } from './pages/forgot-password';
import { ResetPassword } from './pages/reset-password';

const App = (): JSX.Element => {
    return (
        <Switch>
            <Route path={ROUTER_PATHS.REGISTER} component={Registration} />
            <Route path={ROUTER_PATHS.FORGOT_PASSWORD} component={ForgotPassword} />
            <Route path={ROUTER_PATHS.RESET_PASSWORD} component={ResetPassword} />
            <Redirect to={ROUTER_PATHS.REGISTER} />
        </Switch>
    );
};

export default App;
