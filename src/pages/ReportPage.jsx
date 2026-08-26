import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const EVENT_TYPES = [
  'Heavy Rain',
  'Flood',
  'Thunderstorm',
  'Heatwave',
  'Fog',
  'Dust Storm',
  'Strong Wind'
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // UI & Loading States
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  // Submitted Report State (if null, show form; if populated, show success screen)
  const [submittedReport, setSubmittedReport] = useState(null);

  // File Handling
  const processFile = (file) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Unsupported file type. Please upload an image (PNG, JPG, WEBP).'
      }));
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        photo: `Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`
      }));
      return;
    }

    // Clear photo errors & set file
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.photo;
      return updated;
    });

    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Browser Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        location: 'Geolocation is not supported by your browser.'
      }));
      return;
    }

    setIsGettingLocation(true);
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.location;
      return updated;
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        setLocation(`${lat}° N, ${lng}° E (Current GPS Location)`);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMsg = 'Unable to detect location. Please enter manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enter your location manually.';
        }
        setErrors((prev) => ({ ...prev, location: errorMsg }));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!eventType) {
      newErrors.eventType = 'Please select an event type.';
    }

    if (!location.trim()) {
      newErrors.location = 'Please enter or detect your location.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide a brief description of the weather event.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }

    if (!photo) {
      newErrors.photo = 'A photo attachment is required to verify the weather report.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const randomIdSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const reportId = `RPT-${randomNum}-${randomIdSuffix}`;

      const newReport = {
        id: reportId,
        eventType,
        location,
        description,
        reporterName: reporterName.trim() || 'Anonymous Citizen',
        photoPreview,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('weatherwatch_reports') || '[]');
        localStorage.setItem('weatherwatch_reports', JSON.stringify([newReport, ...existing]));
      } catch (err) {
        console.error('Failed to save report to localStorage', err);
      }

      setIsSubmitting(false);
      setSubmittedReport(newReport);
    }, 800);
  };

  const handleReset = () => {
    setEventType('');
    setLocation('');
    setDescription('');
    setReporterName('');
    setPhoto(null);
    setPhotoPreview(null);
    setErrors({});
    setSubmittedReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // SUCCESS SCREEN VIEW (Matching Stitch Design: Screen e1d5adfc491a420eabe4f44ece1e31ae)
  if (submittedReport) {
    return (
      <div className="w-full px-4 md:px-margin-desktop py-12 max-w-container-max mx-auto flex flex-col gap-8 animate-fadeIn">
        {/* Success Banner Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-8 shadow-sm flex flex-col items-center text-center max-w-3xl mx-auto w-full gap-6">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-headline-lg text-headline-lg text-primary">Report Submitted Successfully</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Thank you for your report. It has been registered in the regional monitoring network.
            </p>
          </div>

          {/* Report ID & Timestamp Badge */}
          <div className="bg-surface-container w-full p-4 rounded border border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-md text-sm">
            <div className="flex items-center gap-2">
              <span className="text-outline uppercase text-xs">Report ID:</span>
              <span className="font-bold text-primary tracking-wider text-base">{submittedReport.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-outline uppercase text-xs">Status:</span>
              <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded font-semibold text-xs">
                VERIFIED LOCAL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-outline uppercase text-xs">Time:</span>
              <span className="text-on-surface">{submittedReport.date} at {submittedReport.timestamp}</span>
            </div>
          </div>

          {/* Summary Details Box */}
          <div className="w-full text-left bg-surface-container-low border border-outline-variant p-6 rounded flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex-grow flex flex-col gap-3">
              <div>
                <span className="block font-label-md text-xs text-outline uppercase tracking-wider mb-0.5">
                  EVENT TYPE
                </span>
                <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                  {submittedReport.eventType}
                </span>
              </div>

              <div>
                <span className="block font-label-md text-xs text-outline uppercase tracking-wider mb-0.5">
                  LOCATION
                </span>
                <span className="font-body-md text-on-surface font-medium">
                  {submittedReport.location}
                </span>
              </div>

              <div>
                <span className="block font-label-md text-xs text-outline uppercase tracking-wider mb-0.5">
                  REPORTER
                </span>
                <span className="font-body-md text-on-surface">
                  {submittedReport.reporterName}
                </span>
              </div>

              <div>
                <span className="block font-label-md text-xs text-outline uppercase tracking-wider mb-0.5">
                  DESCRIPTION
                </span>
                <p className="font-body-md text-on-surface-variant">
                  {submittedReport.description}
                </p>
              </div>
            </div>

            {submittedReport.photoPreview && (
              <div className="md:w-48 flex-shrink-0 flex flex-col gap-1">
                <span className="block font-label-md text-xs text-outline uppercase tracking-wider mb-1">
                  ATTACHMENT
                </span>
                <div className="w-full h-36 bg-surface-container rounded overflow-hidden border border-outline-variant relative">
                  <img
                    src={submittedReport.photoPreview}
                    alt="Uploaded weather event attachment"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
            <Link
              to="/dashboard"
              className="bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-DEFAULT hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              View Live Dashboard
            </Link>
            <button
              onClick={handleReset}
              className="bg-transparent border border-primary text-primary font-label-md text-label-md py-3 px-6 rounded-DEFAULT hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT FORM VIEW (Matching Stitch Design: Screen d106b26e55de4f31889ce149244e7bbb)
  return (
    <div className="w-full px-4 md:px-margin-desktop py-8 max-w-container-max mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <header className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Report an Event</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Please provide accurate details about the weather event. Your report helps emergency responders and community awareness.
        </p>
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-margin-desktop items-start">
        {/* LEFT (FORM) */}
        <section className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-lg border border-outline-variant shadow-sm flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Event Type */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="eventType">
                Event Type <span className="text-error">*</span>
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value);
                  if (errors.eventType) {
                    setErrors((prev) => ({ ...prev, eventType: undefined }));
                  }
                }}
                className={`bg-surface-container-low border rounded p-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none ${errors.eventType ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                  }`}
              >
                <option value="" disabled>Select event type...</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.eventType && (
                <span className="text-error text-xs font-body-sm mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.eventType}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="location">
                Location <span className="text-error">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) {
                      setErrors((prev) => ({ ...prev, location: undefined }));
                    }
                  }}
                  placeholder="Enter street address, landmark, or coordinates"
                  className={`flex-grow bg-surface-container-low border rounded p-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none ${errors.location ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                    }`}
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isGettingLocation ? 'progress_activity' : 'my_location'}
                  </span>
                  {isGettingLocation ? 'Detecting...' : 'Use my location'}
                </button>
              </div>
              {errors.location && (
                <span className="text-error text-xs font-body-sm mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.location}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="description">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Describe the severity, damage, or current situation..."
                className={`bg-surface-container-low border rounded p-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y ${errors.description ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                  }`}
              />
              {errors.description && (
                <span className="text-error text-xs font-body-sm mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.description}
                </span>
              )}
            </div>

            {/* Photo Upload & Preview */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface">
                Add a Photo <span className="text-error">*</span>
              </label>

              {!photoPreview ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors text-center ${dragOver
                      ? 'border-primary bg-primary/5'
                      : errors.photo
                        ? 'border-error bg-error/5'
                        : 'border-outline-variant bg-surface-container-low hover:bg-surface-container'
                    }`}
                >
                  <span className="material-symbols-outlined text-4xl text-outline">
                    add_a_photo
                  </span>
                  <div className="font-body-md text-body-md text-on-surface-variant">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </div>
                  <div className="font-body-sm text-body-sm text-outline">
                    PNG, JPG, WEBP up to {MAX_FILE_SIZE_MB}MB
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="relative border border-outline-variant rounded-lg p-3 bg-surface-container-low flex items-center gap-4">
                  <img
                    src={photoPreview}
                    alt="Upload Preview"
                    className="w-20 h-20 object-cover rounded border border-outline-variant flex-shrink-0"
                  />
                  <div className="flex-grow flex flex-col overflow-hidden">
                    <span className="font-body-md font-semibold text-on-surface truncate">
                      {photo?.name}
                    </span>
                    <span className="font-mono-md text-xs text-outline">
                      {photo?.size ? `${(photo.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                    </span>
                    <span className="text-xs text-secondary font-medium mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Image attached ready for submission
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-2 text-on-surface-variant hover:text-error transition-colors"
                    title="Remove Photo"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              )}

              {errors.photo && (
                <span className="text-error text-xs font-body-sm mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.photo}
                </span>
              )}
            </div>

            {/* Reporter Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="reporterName">
                Reporter Name (Optional)
              </label>
              <input
                id="reporterName"
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="For follow-up if needed (e.g. Jane Doe)"
                className="bg-surface-container-low border border-outline-variant rounded p-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-transparent border border-primary text-primary px-6 py-3 rounded font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-on-primary px-6 py-3 rounded font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT (MAP & LIVE PREVIEW SIDEBAR) */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* Map Card */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col h-[300px]">
            <div className="bg-surface-container px-4 py-2 border-b border-outline-variant font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">map</span>
              Selected Location
            </div>
            <div className="flex-grow relative bg-surface-container-low flex items-center justify-center">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJOncXahO5SRyd_WuC1gZrrXbEX0PD1en5eP5PMAoyviVeq386FkRdaStce1cfFO2-K6l67xgde7_wILO0qd5pXMz4gZ6v7YpCgPUhMlgiF0_NnOeD2FytwZZKBY6EQ9rRXelGIWHn3sETIKE_x1y2o2AXkHyNT5REuOLFgpntDzNjoOZUumxek_KTJe_8fWVGT-s3Pc322q6UtFTY3gxRISoErMr51TcxQXB9FA8Gau9ExpMzKxu6gQ"
                alt="Selected location map"
                className="w-full h-full object-cover"
              />
              {location && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface p-2 rounded shadow-md border border-primary flex items-center gap-2 z-10 animate-bounce">
                  <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                    location_on
                  </span>
                  <span className="font-mono-md text-xs text-primary font-bold">
                    Target Lock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Report Preview Card */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm p-5 flex flex-col gap-4">
            <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">preview</span>
              Report Summary Preview
            </div>

            <div className="flex justify-between items-start border-b border-outline-variant pb-3">
              <div className="flex flex-col">
                <span className="font-body-sm text-xs text-outline">Status</span>
                <span className="font-label-md text-xs text-secondary mt-1 px-2 py-0.5 bg-secondary/10 rounded inline-block w-max font-semibold">
                  Pending Submission
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-body-sm text-xs text-outline">Date</span>
                <span className="font-mono-md text-xs text-on-surface font-semibold mt-1">Today</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-body-sm text-xs text-outline uppercase tracking-wider">Event Type</span>
              <span className="font-body-md text-on-surface font-semibold">
                {eventType || '--'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-body-sm text-xs text-outline uppercase tracking-wider">Location</span>
              <span className="font-body-md text-on-surface font-medium truncate">
                {location || '--'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-body-sm text-xs text-outline uppercase tracking-wider">Reporter</span>
              <span className="font-body-md text-on-surface">
                {reporterName || 'Anonymous Citizen'}
              </span>
            </div>

            {photoPreview && (
              <div className="flex flex-col gap-1 pt-2 border-t border-outline-variant">
                <span className="font-body-sm text-xs text-outline uppercase tracking-wider">Attachment</span>
                <div className="w-20 h-20 rounded border border-outline-variant overflow-hidden mt-1">
                  <img src={photoPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
