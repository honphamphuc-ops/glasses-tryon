interface PermissionModalProps {
  onAllow: () => void;
  error?: string | null;
}

export function PermissionModal({ onAllow, error }: PermissionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-4 text-5xl">📸</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Cấp quyền Camera</h2>
        <p className="mb-6 text-gray-600">
          Chúng tôi cần quyền truy cập camera để bạn có thể thử kính thực tế ảo.
        </p>

        {error && (
          <div className="mb-6 text-left">
            <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </p>
            {/* Hướng dẫn bật quyền trình duyệt */}
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <p className="mb-2 font-semibold">Cách bật quyền Camera:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Chrome:</strong> Bấm vào biểu tượng ổ khóa cạnh thanh URL {'>'} Chọn "Cài đặt trang web" {'>'} Đổi "Máy ảnh" thành "Cho phép" {'>'} Tải lại trang.</li>
                <li><strong>Safari:</strong> Vào Cài đặt (Preferences) {'>'} Trang web (Websites) {'>'} Camera {'>'} Chọn "Cho phép".</li>
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={onAllow}
          className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
        >
          Cho phép Camera
        </button>
      </div>
    </div>
  );
}