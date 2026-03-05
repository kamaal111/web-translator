import React from 'react';

const LazyLogin = React.lazy(() => import('./login'));

export default LazyLogin;
