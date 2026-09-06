/**
 * ROZgo Automated Background Supabase Sync
 * Bridges frontend state seamlessly to the Render backend & Supabase without
 * touching or refactoring any existing React components or API calls.
 */
(function () {
  // Determine Backend API Base URL
  const DEFAULT_RENDER_URL = 'https://rozgo-backend.onrender.com/api/v1';
  const LOCAL_DEV_URL = '/api/v1';
  
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE = window.__ROZGO_API_URL__ || (isLocal ? LOCAL_DEV_URL : DEFAULT_RENDER_URL);

  console.log('%c[ROZgo Supabase Sync]%c Active. Target backend:', 'color: #10b981; font-weight: bold;', 'color: auto;', API_BASE);

  async function postSync(endpoint, payload) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const resData = await res.json();
        console.log(`%c[ROZgo Supabase Sync]%c Successfully synced to ${endpoint}`, 'color: #10b981;', 'color: gray;', resData);
        
        // If worker profile was synced, update local state with official sequential UID (labour_no)
        if (endpoint === '/sync/worker' && resData?.data?.[0]?.labour_no) {
          const officialUid = resData.data[0].labour_no;
          const currentProfileStr = localStorage.getItem('rozgo_worker_profile');
          if (currentProfileStr) {
            try {
              const currentProfile = JSON.parse(currentProfileStr);
              if (currentProfile.labourNumber !== officialUid) {
                currentProfile.labourNumber = officialUid;
                currentProfile.id = officialUid;
                originalSetItem.call(localStorage, 'rozgo_worker_profile', JSON.stringify(currentProfile));
                window.dispatchEvent(new Event('storage'));
                console.log(`%c[ROZgo UID Assigned]%c Worker assigned sequential UID: ${officialUid}`, 'color: #3b82f6; font-weight: bold;', 'color: auto;');
              }
            } catch (e) {}
          }
        }
      } else {
        console.warn(`[ROZgo Supabase Sync] Failed sync to ${endpoint}:`, res.status);
      }
    } catch (err) {
      console.warn(`[ROZgo Supabase Sync] Backend unreachable at ${API_BASE}. Data remains safely in local state.`, err.message);
    }
  }

  // Intercept localStorage.setItem globally
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);

    try {
      if (key === 'rozgo_worker_profile') {
        const profile = JSON.parse(value);
        if (profile && profile.phone) {
          postSync('/sync/worker', profile);
        }
      } else if (key === 'rozgo_employer_profile') {
        const profile = JSON.parse(value);
        if (profile && profile.phone) {
          postSync('/sync/employer', profile);
        }
      } else if (key === 'rozgo_active_agreement' || key === 'rozgo_active_agreements') {
        const data = JSON.parse(value);
        const agreement = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
        if (agreement) {
          postSync('/sync/booking', agreement);
        }
      } else if (key === 'rozgo_verification_queue') {
        const apps = JSON.parse(value);
        if (Array.isArray(apps) && apps.length > 0) {
          postSync('/sync/verification', apps);
        }
      } else if (key === 'rozgo_grievances') {
        const grievances = JSON.parse(value);
        if (Array.isArray(grievances) && grievances.length > 0) {
          postSync('/sync/grievances', grievances);
        }
      }
    } catch (e) {
      // Ignore parsing errors for non-JSON items
    }
  };

  // On page load, pull latest state from Supabase if logged in
  window.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = localStorage.getItem('rozgo_logged_in') === 'true';
    const role = localStorage.getItem('rozgo_role') || 'worker';
    
    let phone = '';
    try {
      const savedProfile = localStorage.getItem(role === 'worker' ? 'rozgo_worker_profile' : 'rozgo_employer_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        phone = parsed.phone || '';
      }
    } catch (e) {}

    if (isLoggedIn && phone) {
      try {
        const res = await fetch(`${API_BASE}/sync/state?phone=${encodeURIComponent(phone)}&role=${role}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.profile) {
            const key = role === 'worker' ? 'rozgo_worker_profile' : 'rozgo_employer_profile';
            originalSetItem.call(localStorage, key, JSON.stringify(data.profile));
            console.log('%c[ROZgo Supabase Sync]%c Hydrated local state from live Supabase profile', 'color: #10b981;', 'color: gray;');
          }
        }
      } catch (err) {
        // Backend not reached, continue with cached local state
      }
    }

    // Hydrate grievances from Supabase
    try {
      const gRes = await fetch(`${API_BASE}/sync/grievances`);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData) && gData.length > 0) {
          originalSetItem.call(localStorage, 'rozgo_grievances', JSON.stringify(gData));
          console.log('%c[ROZgo Supabase Sync]%c Hydrated grievances from Supabase', 'color: #10b981;', 'color: gray;');
        }
      }
    } catch (e) {}
  });
})();

