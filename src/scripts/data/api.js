import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  MY_USER_INFO: `${BASE_URL}/users/me`,

  STORY_LIST: `${BASE_URL}/stories`,
  STORE_NEW_REPORT: `${BASE_URL}/stories`,

};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  try {
    const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const responseData = await fetchResponse.json();

    return {
      ok: fetchResponse.ok,
      status: fetchResponse.status,
      message: responseData.message || '',
      data: responseData.data || responseData // Cek kedua struktur
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      ok: false,
      message: error.message
    };
  }
}

export async function getMyUserInfo() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllReports({ page, size, location } = {}) {
  const accessToken = getAccessToken();
  
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (size) params.append('size', size);
  if (location !== undefined) params.append('location', location ? '1' : '0');

  const url = `${BASE_URL}/stories?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    // Format response sesuai dengan API Dicoding
    return {
      ok: !data.error, // API Dicoding menggunakan 'error' property
      message: data.message,
      data: data.listStory || [] // Pastikan selalu mengembalikan array
    };
  } catch (error) {
    console.error('getAllReports error:', error);
    return {
      ok: false,
      message: error.message,
      data: [] // Kembalikan array kosong jika error
    };
  }
}

export async function storeNewReport({
  description,
  photo,
  lat,
  lon
}) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  
  // Tambahkan koordinat hanya jika ada
  if (lat !== undefined) formData.append('lat', lat.toString());
  if (lon !== undefined) formData.append('lon', lon.toString());

  try {
    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
        // Jangan set Content-Type, biarkan browser set otomatis untuk FormData
      },
      body: formData
    });

    const data = await response.json();

    return {
      ok: !data.error, // Sesuai format response Dicoding API
      message: data.message,
      data: data
    };
  } catch (error) {
    console.error('storeNewReport error:', error);
    return {
      ok: false,
      message: error.message,
      data: null
    };
  }

  
}

export async function subscribePushNotification(subscription) {
  const accessToken = getAccessToken();
  
  try {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      })
    });

    const data = await response.json();

    // Periksa 'error' field dari response (sesuai dokumentasi API)
    if (data.error) {
      console.error('Error dari server:', data.message);
      return { ok: false, message: data.message };
    }

    return { ok: true, data };
  } catch (error) {
    console.error('Gagal mengirim subscription ke server:', error);
    return { ok: false, message: error.message };
  }
}

export async function unsubscribePushNotification(subscription) {
  const accessToken = getAccessToken();
  
  try {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Error dari server:', data.message);
      return { ok: false, message: data.message };
    }

    return { ok: true, data };
  } catch (error) {
    console.error('Gagal unsubscribe:', error);
    return { ok: false, message: error.message };
  }
}

export async function sendReportToMeViaNotification(reportId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_ME(reportId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendReportToUserViaNotification(reportId, { userId }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    userId,
  });

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_USER(reportId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendReportToAllUserViaNotification(reportId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_ALL_USER(reportId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}



