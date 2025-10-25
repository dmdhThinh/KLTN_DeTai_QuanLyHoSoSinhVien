import React, { useState } from "react";
import axios from "axios";
import TeacherLayout from "../../components/TeacherLayout";

function NhapDiem() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleImport = async () => {
  if (!file) {
    setMessage("⚠️ Vui lòng chọn file Excel trước!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoading(true);
    // ✅ chỉ gửi 1 lần, dùng đường dẫn tương đối
    const res = await axios.post("/api/ketquahoctap/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMessage(`✅ ${res.data.message}`);
  } catch (err) {
    console.error("❌ Lỗi import:", err.response?.data || err.message);
    setMessage("❌ Lỗi khi nhập file Excel. Kiểm tra lại dữ liệu!");
  } finally {
    setLoading(false);
  }
};


  return (
    <TeacherLayout>
      <div className="container mt-4">
        <h3>📤 Nhập điểm từ file Excel</h3>

        <div className="card mt-3 shadow-sm p-4">
          <div className="mb-3">
            <label className="form-label fw-bold">Chọn file Excel (.xlsx)</label>
            <input
              type="file"
              accept=".xls,.xlsx"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>

          {loading ? (
            <p className="text-center text-muted">⏳ Đang xử lý file...</p>
          ) : (
            <button className="btn btn-success" onClick={handleImport}>
              📥 Tải lên và nhập điểm
            </button>
          )}

          {message && (
            <div
              className={`alert mt-3 ${
                message.startsWith("✅")
                  ? "alert-success"
                  : "alert-warning"
              }`}
            >
              {message}
            </div>
          )}

          <hr />
          <p className="small text-muted mb-0">
            🔹 File Excel có thể chứa tối đa 4 cột TX (TX1–TX4), 3 cột TH (TH1–TH3). <br />
            🔹 Có thể bỏ trống các cột nếu môn không có phần đó. <br />
            🔹 Hệ thống chỉ <strong>tự tính điểm tổng kết</strong> khi có cột <b>“Cuối kỳ”</b>.
          </p>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default NhapDiem;
