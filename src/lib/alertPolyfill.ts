import { Alert, AlertButton, Platform } from 'react-native';

/**
 * react-native-web ships a no-op Alert, so every validation/error message in the app would be
 * invisible in the browser. Route Alert.alert through window.alert/confirm on web instead.
 * Native platforms are untouched.
 */
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = message ? `${title}\n\n${message}` : title;
    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancel = buttons.find((b) => b.style === 'cancel');
    const confirmButton = buttons.find((b) => b !== cancel) ?? buttons[0];
    if (window.confirm(text)) confirmButton.onPress?.();
    else cancel?.onPress?.();
  };
}
