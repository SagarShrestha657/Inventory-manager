import { create } from 'zustand';

interface TourState {
  run: boolean;
  startTour: () => void;
  stopTour: () => void;
}

const useTourStore = create<TourState>((set) => ({
  run: false,
  startTour: () => {
    console.log('startTour called, setting run to true');
    set({ run: true });
  },
  stopTour: () => set({ run: false }),
}));

export default useTourStore;
