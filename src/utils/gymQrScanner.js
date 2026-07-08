import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_CONFIG = {
  fps: 20,
  qrbox: (viewfinderWidth, viewfinderHeight) => {
    const edge = Math.min(viewfinderWidth, viewfinderHeight);
    const size = Math.floor(edge * 0.92);
    return { width: size, height: size };
  },
  aspectRatio: 1,
  disableFlip: false,
};

/** Ask for permission so camera labels (e.g. DroidCam) are visible. */
async function primeCameraPermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export async function listAvailableCameras() {
  await primeCameraPermission();

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices
      .filter((d) => d.kind === 'videoinput')
      .map((d) => ({
        id: d.deviceId,
        label: d.label || `Camera (${d.deviceId.slice(0, 8)}…)`,
      }));

    if (videoInputs.length) {
      return videoInputs;
    }
  } catch {
    /* fall through */
  }

  try {
    const cameras = await Html5Qrcode.getCameras();
    return cameras || [];
  } catch {
    return [];
  }
}

/** DroidCam first, then other cameras. */
export function orderCameras(cameras) {
  if (!cameras?.length) return [];

  const droidCam = cameras.filter((c) => /droidcam/i.test(c.label || ''));
  const rest = cameras.filter((c) => !/droidcam/i.test(c.label || ''));

  return [...droidCam, ...rest];
}

export async function pickBestCameraId() {
  const ordered = orderCameras(await listAvailableCameras());
  return ordered[0]?.id ?? null;
}

/**
 * Start scanner; tries each camera (DroidCam first) until one works.
 * @returns {{ scanner: Html5Qrcode, cameraLabel: string }}
 */
export async function startGymQrScanner(elementId, onScan) {
  const ordered = orderCameras(await listAvailableCameras());
  let lastError = null;

  const attempts = ordered.length
    ? ordered.map((c) => ({ constraint: c.id, label: c.label }))
    : [
        { constraint: { facingMode: 'environment' }, label: 'environment' },
        { constraint: { facingMode: 'user' }, label: 'user' },
      ];

  for (const { constraint, label } of attempts) {
    const scanner = new Html5Qrcode(elementId, { verbose: false });
    try {
      await scanner.start(
        constraint,
        SCANNER_CONFIG,
        (decodedText) => onScan(decodedText),
        () => {}
      );
      return { scanner, cameraLabel: label };
    } catch (err) {
      lastError = err;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        /* ignore */
      }
      await scanner.clear().catch(() => {});
    }
  }

  const names = ordered.map((c) => c.label).join(', ') || 'none detected';
  const detail = lastError?.message || 'Permission denied or camera in use';
  throw new Error(`${detail} (cameras: ${names})`);
}

export async function stopGymQrScanner(scanner) {
  if (!scanner) return;
  if (scanner.isScanning) {
    await scanner.stop().catch(() => {});
  }
  await scanner.clear().catch(() => {});
}
