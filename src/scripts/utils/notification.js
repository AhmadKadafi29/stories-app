import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';
console.log('VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY);

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return;
  }

  console.log('Mulai berlangganan push notification...');

  const failureMessage = 'Langganan push notification gagal diaktifkan.';
  const successMessage = 'Langganan push notification berhasil diaktifkan.';

  let pushSubscription;

  try {
    // 1. Dapatkan service worker registration
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      throw new Error('Service Worker tidak siap');
    }

    // 2. Buat push subscription
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );
    
    if (!pushSubscription) {
      throw new Error('Gagal membuat subscription');
    }

    // 3. Format data untuk API
    const subscriptionData = pushSubscription.toJSON();
    const payload = {
      endpoint: subscriptionData.endpoint,
      keys: {
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth
      }
    };

    // 4. Kirim ke server
    const response = await subscribePushNotification(payload);
    
    if (response.error) {
      throw new Error(response.message || 'Server menolak subscription');
    }

    alert(successMessage);
  } catch (error) {
    console.error('Error saat subscribe:', error);
    alert(`${failureMessage} Error: ${error.message}`);

    // Bersihkan subscription yang gagal
    if (pushSubscription) {
      try {
        await pushSubscription.unsubscribe();
      } catch (unsubError) {
        console.error('Gagal unsubscribe:', unsubError);
      }
    }
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
      return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      alert(failureUnsubscribeMessage);
      console.error('unsubscribe: response:', response);

      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();

    if (!unsubscribed) {
      alert(failureUnsubscribeMessage);
      await subscribePushNotification({ endpoint, keys });

      return;
    }

    alert(successUnsubscribeMessage);
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error('unsubscribe: error:', error);
  }
}