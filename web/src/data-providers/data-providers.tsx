import { type DefaultToastOptions, Toaster } from 'react-hot-toast';

import IntlProvider from '@/translations/intl-provider';
import ConfigurationsContextProvider from './configurations-context';

const toastOptions: DefaultToastOptions = {
  error: {
    duration: 3000,
    style: { background: '#DD2712', color: '#ffffff' },
  },
};

function DataProviders({ children }: React.PropsWithChildren) {
  return (
    <IntlProvider>
      <ConfigurationsContextProvider>
        {children}
        <Toaster toastOptions={toastOptions} />
      </ConfigurationsContextProvider>
    </IntlProvider>
  );
}

export default DataProviders;
