import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';

// React Query needs to be told what "online" and "focused" mean outside a browser tab.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
  })
);

if (Platform.OS !== 'web') {
  focusManager.setEventListener((handleFocus) => {
    const sub = AppState.addEventListener('change', (state) => handleFocus(state === 'active'));
    return () => sub.remove();
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      // Coming back to the app or regaining a connection refreshes anything older than staleTime.
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
