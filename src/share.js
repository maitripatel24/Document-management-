import { Alert, Linking, Platform, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

function shareText(item) {
  const lines = [item.title];
  if (item.category) lines.push(`Category: ${item.category}`);
  if (item.notes) lines.push('', item.notes);
  if (item.fileUrl) lines.push('', `File: ${item.fileName}`, item.fileUrl);
  return lines.join('\n');
}

// Downloads the file to the phone, then opens the system share sheet
// (WhatsApp, Gmail, Drive, Bluetooth, etc. all appear there).
export async function shareFile(item) {
  if (!item.fileUrl) return shareAny(item);
  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert('Not supported', 'File sharing is not available on this device.');
    return;
  }
  const safeName = (item.fileName || 'document').replace(/[^\w.\-() ]/g, '_');
  const localUri = FileSystem.cacheDirectory + safeName;
  const { uri } = await FileSystem.downloadAsync(item.fileUrl, localUri);
  await Sharing.shareAsync(uri, { mimeType: item.mimeType || undefined, dialogTitle: item.title });
}

// Share the details + download link as text through any app.
export function shareAny(item) {
  return Share.share({ title: item.title, message: shareText(item) });
}

export async function shareToWhatsApp(item) {
  const url = `whatsapp://send?text=${encodeURIComponent(shareText(item))}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('WhatsApp not found', 'Install WhatsApp, or use "Share file" to pick another app.');
  }
}

export async function shareToEmail(item) {
  const subject = encodeURIComponent(item.title);
  const body = encodeURIComponent(shareText(item));
  const gmail = `googlegmail://co?subject=${subject}&body=${body}`;
  const mailto = `mailto:?subject=${subject}&body=${body}`;
  try {
    // On iPhone try the Gmail app first; on Android mailto lets the user pick Gmail.
    if (Platform.OS === 'ios' && (await Linking.canOpenURL(gmail))) {
      await Linking.openURL(gmail);
    } else {
      await Linking.openURL(mailto);
    }
  } catch {
    Alert.alert('No email app', 'Install Gmail or another email app.');
  }
}
