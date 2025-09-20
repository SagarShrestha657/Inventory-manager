import Joyride, { type Step } from 'react-joyride';
import useTourStore from '../../store/tourStore';

const Tour = () => {
  const { run, stopTour } = useTourStore();

  const steps: Step[] = [
    {
      target: '#sidebar',
      content: 'This is the navigation sidebar. You can switch between different pages here.',
      placement: 'right',
    },
    {
      target: '#main-content',
      content: 'This is the main content area where the page content is displayed.',
      placement: 'auto',
    },
    {
      target: '#app-bar',
      content: 'This is the app bar where the logo and menu button are located.',
      placement: 'bottom',
    },
    {
      target: '#dashboard-page',
      content: 'This is the Dashboard page, providing an overview of your inventory.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#products-page',
      content: 'Manage your products here. Add, edit, or delete products.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#categories-page',
      content: 'Organize your products by categories on this page.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#history-page',
      content: 'View the history of your inventory changes here.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#analytics-page',
      content: 'Analyze your inventory data and sales trends on this page.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#settings-page',
      content: 'Adjust application settings, including user preferences and security.',
      placement: 'center',
      disableBeacon: true,
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={({ status }) => {
        if (status === 'finished' || status === 'skipped') {
          stopTour();
        }
      }}
      continuous
      showProgress
      showSkipButton
    />
  );
};

export default Tour;
