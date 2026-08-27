// Centralized Local Reports Store & Pre-populated Demo Data for WeatherWatch

export const INITIAL_REPORTS = [
  {
    id: 'RPT-8492-AX',
    eventType: 'Heavy Rain',
    location: 'Mumbai, Maharashtra',
    state: 'Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
    description: 'Torrential downpour causing urban waterlogging near Dadar and lower Parel areas.',
    reporterName: 'Rajesh Kumar',
    createdAt: '8 min ago',
    date: 'Today, 14:24 IST',
    status: 'Verified',
    confidence: '98.5%',
    photoPreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_YTlJjqu4Xj4aIcr0C-sDX2RVE4bGqkxXSWXJKBzELRwdbZG_TdzjC03zwgBdrELDuPHBQi8uEPTKrlGkktBnzFca1oTet4V8qT3eQdgrVLFLsBeaO6JXFU0f40v77g8L3MwTwaxbsiKkXMSYrTAa-H1QnyZuNsc0NdEtbcMsjB_C_-0pzOL482kyVCurn6Us72ATICboWwcRtgmeRb-WEDw7ZmANfZK3DDnxyY8UCf1nrFJAgxxCUQ'
  },
  {
    id: 'RPT-7310-GA',
    eventType: 'Flood',
    location: 'Guwahati, Assam',
    state: 'Assam',
    latitude: 26.1445,
    longitude: 91.7362,
    description: 'Brahmaputra river water overflow affecting low-lying residential wards.',
    reporterName: 'Anil Sarma',
    createdAt: '15 min ago',
    date: 'Today, 14:17 IST',
    status: 'Verified',
    confidence: '96.2%',
    photoPreview: null
  },
  {
    id: 'RPT-9104-JP',
    eventType: 'Heatwave',
    location: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    latitude: 26.9124,
    longitude: 75.7873,
    description: 'Severe heatwave condition with peak temperature reaching 44.5°C.',
    reporterName: 'Sunita Sharma',
    createdAt: '22 min ago',
    date: 'Today, 14:10 IST',
    status: 'Verified',
    confidence: '99.0%',
    photoPreview: null
  },
  {
    id: 'RPT-6022-DL',
    eventType: 'Fog',
    location: 'Connaught Place, Delhi',
    state: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    description: 'Dense morning fog lowering visibility below 100 meters across central Delhi.',
    reporterName: 'Vikram Singh',
    createdAt: '35 min ago',
    date: 'Today, 13:57 IST',
    status: 'Verified',
    confidence: '88.5%',
    photoPreview: null
  },
  {
    id: 'RPT-5140-WB',
    eventType: 'Thunderstorm',
    location: 'Kolkata, West Bengal',
    state: 'West Bengal',
    latitude: 22.5726,
    longitude: 88.3639,
    description: 'Squall line with lightning strikes and heavy localized showers in Salt Lake.',
    reporterName: 'Debabrata Das',
    createdAt: '42 min ago',
    date: 'Today, 13:50 IST',
    status: 'Verified',
    confidence: '91.4%',
    photoPreview: null
  },
  {
    id: 'RPT-4091-TN',
    eventType: 'Heavy Rain',
    location: 'Chennai, Tamil Nadu',
    state: 'Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
    description: 'Northeast monsoon surge bringing continuous heavy rainfall across coastal belts.',
    reporterName: 'Karthik Subramanian',
    createdAt: '1 hour ago',
    date: 'Today, 13:30 IST',
    status: 'Verified',
    confidence: '85.0%',
    photoPreview: null
  },
  {
    id: 'RPT-3280-KA',
    eventType: 'Strong Wind',
    location: 'Bengaluru, Karnataka',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    description: 'High velocity gusty winds recorded near MG Road causing minor tree branch falls.',
    reporterName: 'Priya Nair',
    createdAt: '1 hour ago',
    date: 'Today, 13:22 IST',
    status: 'Verified',
    confidence: '82.6%',
    photoPreview: null
  },
  {
    id: 'RPT-2941-GJ',
    eventType: 'Heatwave',
    location: 'Ahmedabad, Gujarat',
    state: 'Gujarat',
    latitude: 23.0225,
    longitude: 72.5714,
    description: 'Extreme thermal conditions. Yellow alert issued for public health advisories.',
    reporterName: 'Harsh Patel',
    createdAt: '2 hours ago',
    date: 'Today, 12:45 IST',
    status: 'Verified',
    confidence: '96.4%',
    photoPreview: null
  },
  {
    id: 'RPT-1850-JK',
    eventType: 'Fog',
    location: 'Srinagar, Jammu and Kashmir',
    state: 'Jammu and Kashmir',
    latitude: 34.0837,
    longitude: 74.7973,
    description: 'Dense cold mist and low ceiling cloud cover around Dal Lake area.',
    reporterName: 'Tariq Bhat',
    createdAt: '2 hours ago',
    date: 'Today, 12:15 IST',
    status: 'Pending',
    confidence: '73.1%',
    photoPreview: null
  },
  {
    id: 'RPT-8831-KL',
    eventType: 'Heavy Rain',
    location: 'Kochi, Kerala',
    state: 'Kerala',
    latitude: 9.9312,
    longitude: 76.2673,
    description: 'Monsoon downpour over coastal harbor zone causing temporary drainage backup.',
    reporterName: 'Mathew George',
    createdAt: '3 hours ago',
    date: 'Today, 11:30 IST',
    status: 'Verified',
    confidence: '93.8%',
    photoPreview: null
  },
  {
    id: 'RPT-7742-BR',
    eventType: 'Flood',
    location: 'Patna, Bihar',
    state: 'Bihar',
    latitude: 25.5941,
    longitude: 85.1376,
    description: 'Water accumulation along low embankment zones near Ganga ghats.',
    reporterName: 'Ravi Prasad',
    createdAt: '3 hours ago',
    date: 'Today, 11:10 IST',
    status: 'Pending',
    confidence: '68.4%',
    photoPreview: null
  },
  {
    id: 'RPT-6619-OR',
    eventType: 'Thunderstorm',
    location: 'Bhubaneswar, Odisha',
    state: 'Odisha',
    latitude: 20.2961,
    longitude: 85.8245,
    description: 'Pre-monsoon thundershowers with lightning and sudden wind gusts.',
    reporterName: 'Subhashree Mohanty',
    createdAt: '4 hours ago',
    date: 'Today, 10:40 IST',
    status: 'Verified',
    confidence: '90.2%',
    photoPreview: null
  },
  {
    id: 'RPT-5520-MH',
    eventType: 'Heavy Rain',
    location: 'Pune, Maharashtra',
    state: 'Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
    description: 'Moderate to heavy showers in Kothrud and Baner area.',
    reporterName: 'Amit Deshmukh',
    createdAt: '4 hours ago',
    date: 'Today, 10:20 IST',
    status: 'Pending',
    confidence: '62.0%',
    photoPreview: null
  },
  {
    id: 'RPT-4431-TS',
    eventType: 'Heatwave',
    location: 'Hyderabad, Telangana',
    state: 'Telangana',
    latitude: 17.3850,
    longitude: 78.4867,
    description: 'Elevated daytime temperatures reaching 41.8°C.',
    reporterName: 'Srinivas Reddy',
    createdAt: '5 hours ago',
    date: 'Today, 09:30 IST',
    status: 'Verified',
    confidence: '94.7%',
    photoPreview: null
  },
  {
    id: 'RPT-3322-RJ',
    eventType: 'Dust Storm',
    location: 'Jodhpur, Rajasthan',
    state: 'Rajasthan',
    latitude: 26.2389,
    longitude: 73.0243,
    description: 'Strong desert winds causing dust haze and reduced optical clarity.',
    reporterName: 'Mahendra Singh',
    createdAt: '6 hours ago',
    date: 'Today, 08:50 IST',
    status: 'Verified',
    confidence: '95.1%',
    photoPreview: null
  },
  {
    id: 'RPT-2213-HP',
    eventType: 'Fog',
    location: 'Shimla, Himachal Pradesh',
    state: 'Himachal Pradesh',
    latitude: 31.1048,
    longitude: 77.1734,
    description: 'Thick mountain fog covering Ridge road and Mall road.',
    reporterName: 'Deepak Sharma',
    createdAt: '7 hours ago',
    date: 'Today, 07:40 IST',
    status: 'Verified',
    confidence: '89.0%',
    photoPreview: null
  },
  {
    id: 'RPT-1104-AP',
    eventType: 'Strong Wind',
    location: 'Visakhapatnam, Andhra Pradesh',
    state: 'Andhra Pradesh',
    latitude: 17.6868,
    longitude: 83.2185,
    description: 'Coastal wind turbulence recorded near RK Beach promenade.',
    reporterName: 'Venkat Rao',
    createdAt: '8 hours ago',
    date: 'Today, 06:30 IST',
    status: 'Pending',
    confidence: '74.5%',
    photoPreview: null
  },
  {
    id: 'RPT-9988-UP',
    eventType: 'Thunderstorm',
    location: 'Lucknow, Uttar Pradesh',
    state: 'Uttar Pradesh',
    latitude: 26.8467,
    longitude: 80.9462,
    description: 'Duplicate transmission recorded near Hazratganj.',
    reporterName: 'Alok Gupta',
    createdAt: '9 hours ago',
    date: 'Today, 05:20 IST',
    status: 'Duplicate',
    confidence: '45.0%',
    photoPreview: null
  },
  {
    id: 'RPT-8877-PB',
    eventType: 'Heavy Rain',
    location: 'Amritsar, Punjab',
    state: 'Punjab',
    latitude: 31.6340,
    longitude: 74.8723,
    description: 'Report flagged as inaccurate due to sensor anomaly.',
    reporterName: 'Gurpreet Singh',
    createdAt: '10 hours ago',
    date: 'Today, 04:15 IST',
    status: 'Rejected',
    confidence: '22.1%',
    photoPreview: null
  },
  {
    id: 'RPT-7766-MP',
    eventType: 'Heatwave',
    location: 'Bhopal, Madhya Pradesh',
    state: 'Madhya Pradesh',
    latitude: 23.2599,
    longitude: 77.4126,
    description: 'Dry spell with high temperature readings across MP central basin.',
    reporterName: 'Sanjay Mishra',
    createdAt: '11 hours ago',
    date: 'Today, 03:00 IST',
    status: 'Verified',
    confidence: '92.0%',
    photoPreview: null
  }
];

const LOCAL_STORAGE_KEY = 'weatherwatch_reports';

export function getStoredReports() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }

    // Normalize coordinates & status for all reports
    return parsed.map((item) => ({
      ...item,
      latitude: item.latitude || extractLat(item.location) || 19.0760,
      longitude: item.longitude || extractLng(item.location) || 72.8777,
      state: item.state || extractState(item.location) || 'India',
      status: item.status || 'Pending',
      confidence: item.confidence || '78.5%'
    }));
  } catch (e) {
    console.error('Error reading localStorage reports', e);
    return INITIAL_REPORTS;
  }
}

export function saveReportToStore(newReport) {
  const current = getStoredReports();
  // Ensure report has numeric lat/lng for map positioning
  const lat = newReport.latitude || extractLat(newReport.location) || 19.0760 + (Math.random() - 0.5) * 0.1;
  const lng = newReport.longitude || extractLng(newReport.location) || 72.8777 + (Math.random() - 0.5) * 0.1;

  const normalized = {
    ...newReport,
    latitude: lat,
    longitude: lng,
    state: newReport.state || extractState(newReport.location) || 'Maharashtra',
    status: newReport.status || 'Pending',
    confidence: newReport.confidence || '82.0%',
    createdAt: 'Just now',
    date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`
  };

  const updated = [normalized, ...current];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error writing localStorage report', e);
  }
  return normalized;
}

export function getEventMarkerColor(eventType) {
  switch (eventType) {
    case 'Heavy Rain':
      return '#1960a3';
    case 'Flood':
      return '#002045';
    case 'Thunderstorm':
      return '#6b21a8';
    case 'Heatwave':
      return '#ba1a1a';
    case 'Fog':
      return '#74777f';
    case 'Dust Storm':
      return '#c6955e';
    case 'Strong Wind':
      return '#0d9488';
    default:
      return '#1960a3';
  }
}

export function getStatusBadgeStyle(status) {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'verified':
      return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'pending':
      return 'bg-outline/10 text-outline border-outline/20';
    case 'rejected':
      return 'bg-error/10 text-error border-error/20';
    case 'duplicate':
      return 'bg-tertiary/10 text-tertiary-container border-tertiary/20';
    default:
      return 'bg-outline/10 text-outline border-outline/20';
  }
}

export function getStateFromCoords(lat, lng) {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return 'Maharashtra';
  
  // High-precision checks for major metro centers & regions
  if (lat >= 18.8 && lat <= 19.4 && lng >= 72.7 && lng <= 73.2) return 'Maharashtra'; // Mumbai
  if (lat >= 18.3 && lat <= 18.7 && lng >= 73.7 && lng <= 74.1) return 'Maharashtra'; // Pune
  if (lat >= 15.6 && lat <= 22.1 && lng >= 72.6 && lng <= 80.9) return 'Maharashtra';

  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.9 && lng <= 77.4) return 'Delhi';
  if (lat >= 26.8 && lat <= 27.1 && lng >= 75.7 && lng <= 76.0) return 'Rajasthan'; // Jaipur
  if (lat >= 23.3 && lat <= 30.2 && lng >= 69.5 && lng <= 78.2) return 'Rajasthan';
  
  if (lat >= 22.9 && lat <= 23.2 && lng >= 72.4 && lng <= 72.7) return 'Gujarat'; // Ahmedabad
  if (lat >= 20.1 && lat <= 24.7 && lng >= 68.1 && lng <= 74.5) return 'Gujarat';

  if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) return 'Karnataka'; // Bengaluru
  if (lat >= 11.5 && lat <= 18.5 && lng >= 74.0 && lng <= 78.5) return 'Karnataka';

  if (lat >= 12.9 && lat <= 13.3 && lng >= 80.1 && lng <= 80.4) return 'Tamil Nadu'; // Chennai
  if (lat >= 8.0 && lat <= 13.5 && lng >= 76.2 && lng <= 80.3) return 'Tamil Nadu';

  if (lat >= 22.4 && lat <= 22.8 && lng >= 88.2 && lng <= 88.5) return 'West Bengal'; // Kolkata
  if (lat >= 21.5 && lat <= 27.2 && lng >= 85.8 && lng <= 89.9) return 'West Bengal';

  if (lat >= 26.0 && lat <= 26.3 && lng >= 91.6 && lng <= 91.9) return 'Assam'; // Guwahati
  if (lat >= 24.1 && lat <= 28.0 && lng >= 89.7 && lng <= 96.0) return 'Assam';

  if (lat >= 8.3 && lat <= 12.8 && lng >= 74.8 && lng <= 77.5) return 'Kerala';

  if (lat >= 17.2 && lat <= 17.6 && lng >= 78.3 && lng <= 78.6) return 'Telangana'; // Hyderabad
  if (lat >= 15.8 && lat <= 19.9 && lng >= 77.2 && lng <= 81.8) return 'Telangana';

  if (lat >= 17.5 && lat <= 17.9 && lng >= 83.1 && lng <= 83.4) return 'Andhra Pradesh'; // Visakhapatnam
  if (lat >= 12.6 && lat <= 19.1 && lng >= 76.8 && lng <= 84.8) return 'Andhra Pradesh';

  if (lat >= 25.4 && lat <= 25.8 && lng >= 85.0 && lng <= 85.3) return 'Bihar'; // Patna
  if (lat >= 24.3 && lat <= 27.5 && lng >= 83.3 && lng <= 88.3) return 'Bihar';

  if (lat >= 20.1 && lat <= 20.5 && lng >= 85.7 && lng <= 86.0) return 'Odisha'; // Bhubaneswar
  if (lat >= 17.8 && lat <= 22.5 && lng >= 81.4 && lng <= 87.5) return 'Odisha';

  if (lat >= 26.7 && lat <= 27.0 && lng >= 80.8 && lng <= 81.1) return 'Uttar Pradesh'; // Lucknow
  if (lat >= 23.9 && lat <= 30.4 && lng >= 77.1 && lng <= 84.6) return 'Uttar Pradesh';

  if (lat >= 23.1 && lat <= 23.4 && lng >= 77.3 && lng <= 77.6) return 'Madhya Pradesh'; // Bhopal
  if (lat >= 21.1 && lat <= 26.9 && lng >= 74.0 && lng <= 82.8) return 'Madhya Pradesh';

  if (lat >= 31.5 && lat <= 31.8 && lng >= 74.7 && lng <= 75.0) return 'Punjab'; // Amritsar
  if (lat >= 29.5 && lat <= 32.5 && lng >= 73.8 && lng <= 76.9) return 'Punjab';

  if (lat >= 31.0 && lat <= 31.2 && lng >= 77.1 && lng <= 77.3) return 'Himachal Pradesh'; // Shimla
  if (lat >= 30.4 && lat <= 33.3 && lng >= 75.6 && lng <= 79.0) return 'Himachal Pradesh';

  if (lat >= 34.0 && lat <= 34.2 && lng >= 74.7 && lng <= 75.0) return 'Jammu and Kashmir'; // Srinagar
  if (lat >= 32.3 && lat <= 37.0 && lng >= 73.4 && lng <= 80.5) return 'Jammu and Kashmir';

  return 'Maharashtra';
}

export function getReportState(report) {
  if (!report) return 'Maharashtra';

  // 1. Explicit state field if valid text (not degree/coordinate)
  if (report.state && typeof report.state === 'string' && !report.state.includes('°')) {
    return report.state.trim();
  }

  // 2. City, State format in location string (e.g. "Mumbai, Maharashtra")
  if (report.location && typeof report.location === 'string' && !report.location.includes('°')) {
    const parts = report.location.split(',');
    const candidate = parts[parts.length - 1].trim();
    if (candidate && candidate !== 'India' && !candidate.includes('°')) {
      return candidate;
    }
  }

  // 3. Derive state from latitude & longitude
  let lat = report.latitude;
  let lng = report.longitude;

  if ((lat == null || isNaN(lat)) && report.location && typeof report.location === 'string') {
    const matchLat = report.location.match(/([\d.]+)\s*°?\s*N/i);
    if (matchLat) lat = parseFloat(matchLat[1]);
  }

  if ((lng == null || isNaN(lng)) && report.location && typeof report.location === 'string') {
    const matchLng = report.location.match(/([\d.]+)\s*°?\s*E/i);
    if (matchLng) lng = parseFloat(matchLng[1]);
  }

  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    return getStateFromCoords(lat, lng);
  }

  return 'Maharashtra';
}

function extractLat(locationStr) {
  if (!locationStr) return null;
  const match = locationStr.match(/([\d.]+)\s*°?\s*N/i);
  return match ? parseFloat(match[1]) : null;
}

function extractLng(locationStr) {
  if (!locationStr) return null;
  const match = locationStr.match(/([\d.]+)\s*°?\s*E/i);
  return match ? parseFloat(match[1]) : null;
}

function extractState(locationStr) {
  if (!locationStr) return 'India';
  const parts = locationStr.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : 'India';
}

export function updateReportStatus(reportId, newStatus) {
  const current = getStoredReports();
  const updated = current.map((r) => {
    if (r.id === reportId) {
      return { ...r, status: newStatus };
    }
    return r;
  });
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating report status in localStorage', e);
  }
  return updated;
}

export function getAICategory(eventType) {
  switch (eventType) {
    case 'Heavy Rain':
    case 'Flood':
      return 'Hydrological';
    case 'Thunderstorm':
    case 'Strong Wind':
      return 'Severe Storm';
    case 'Heatwave':
      return 'Thermal Hazard';
    case 'Fog':
    case 'Dust Storm':
      return 'Atmospheric';
    default:
      return 'Meteorological';
  }
}

