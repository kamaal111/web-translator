import ConfigurationsContextProvider from './configurations-context';

function DataProviders({ children }: React.PropsWithChildren) {
  return <ConfigurationsContextProvider>{children}</ConfigurationsContextProvider>;
}

export default DataProviders;
