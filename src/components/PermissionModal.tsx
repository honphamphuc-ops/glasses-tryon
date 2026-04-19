interface PermissionModalProps {
  onAllow: () => void;
  error?: string | null;
}

export function PermissionModal({ onAllow, error }: PermissionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-4 text-5xl">📸</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Camera Access</h2>
        <p className="mb-6 text-gray-600">
          We need access to your camera to show you how glasses look on your face.
        </p>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          onClick={onAllow}
          className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Allow Camera
        </button>
      </div>
    </div>
  );
}
