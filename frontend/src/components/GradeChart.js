import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { apiFetch } from '../api';

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'white',
        border: '2px solid #667eea',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#667eea' }}>
          {data.tenMonHoc}
        </p>
        <p style={{ margin: '4px 0', color: '#e74c3c' }}>
          <span style={{ fontSize: '0.9rem' }}>● Điểm của bạn:</span>{' '}
          <strong>{data.diemCuaBan}</strong>
        </p>
        <p style={{ margin: '4px 0', color: '#f39c12' }}>
          <span style={{ fontSize: '0.9rem' }}>● Điểm TB lớp học phần:</span>{' '}
          <strong>{data.diemTBLop}</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function GradeChart({ sinhVienId }) {
  const [chartData, setChartData] = useState([]);
  const [hocKyList, setHocKyList] = useState([]);
  const [selectedHocKy, setSelectedHocKy] = useState(null);

  useEffect(() => {
    if (!sinhVienId) return;

    // Lấy danh sách học kỳ từ điểm trung bình (API đã có sẵn)
    apiFetch(`/api/diem-trung-binh/theo-sinh-vien?sinhVienId=${sinhVienId}`)
      .then(data => {
        console.log('Danh sách điểm TB:', data);
        if (Array.isArray(data) && data.length > 0) {
          const list = data.map(item => ({
            hocKy: item.hoc_ky,
            namHoc: item.nam_hoc,
            label: `${item.hoc_ky} (${item.nam_hoc})`
          }));
          
          setHocKyList(list);
          if (list.length > 0) {
            // Chọn học kỳ gần nhất
            setSelectedHocKy(list[list.length - 1]);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching học kỳ:', err);
      });
  }, [sinhVienId]);

  useEffect(() => {
    if (!sinhVienId || !selectedHocKy) return;

    // Lấy dữ liệu biểu đồ
    apiFetch(
      `/api/ket-qua-hoc-tap/chart-data?sinhVienId=${sinhVienId}&hocKy=${selectedHocKy.hocKy}&namHoc=${selectedHocKy.namHoc}`
    )
      .then(data => {
        console.log('Chart data:', data);
        if (Array.isArray(data)) {
          setChartData(data);
        }
      })
      .catch(err => {
        console.error('Error fetching chart data:', err);
        setChartData([]);
      });
  }, [sinhVienId, selectedHocKy]);

  if (!sinhVienId) return null;

  return (
    <div className="border rounded-3 p-3" style={{ background: 'white' }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0" style={{ color: '#667eea', fontWeight: '600' }}>
           Kết quả học tập
        </h6>
        {hocKyList.length > 0 && (
          <select
            className="form-select"
            style={{ 
              width: '160px',  // Đặt chiều rộng cố định cho dropdown, có thể điều chỉnh lại
              borderColor: '#667eea',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.9rem',
              zIndex: '1050',
              position: 'relative',
              whiteSpace: 'nowrap',  // Đảm bảo nội dung không bị cắt ngắn
              textOverflow: 'ellipsis',  // Nếu có văn bản dài, nó sẽ bị cắt ngắn với dấu ba chấm
            }}
            value={selectedHocKy?.label || ''}
            onChange={(e) => {
              const selected = hocKyList.find(hk => hk.label === e.target.value);
              setSelectedHocKy(selected);
            }}
          >
            {hocKyList.map(hk => (
              <option key={hk.label} value={hk.label}>
                {hk.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-3 text-muted">
          <i className="bi bi-bar-chart" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
          <p className="mt-2 mb-0" style={{ fontSize: '0.85rem' }}>Chưa có dữ liệu điểm cho học kỳ này</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 15, left: 5, bottom: 45 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="maHocPhan"
              angle={-45}
              textAnchor="end"
              height={65}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 10 }}
              width={30}
              label={{ 
                value: 'Điểm', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 11, fill: '#666' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '8px', fontSize: '0.8rem' }}
              iconType="circle"
            />
            <Bar 
              dataKey="diemCuaBan" 
              name="Điểm của bạn"
              fill="#e74c3c"
              radius={[6, 6, 0, 0]}
              barSize={40}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#e74c3c" />
              ))}
            </Bar>
            <Line 
              type="monotone"
              dataKey="diemTBLop" 
              name="Điểm TB lớp học phần"
              stroke="#f39c12"
              strokeWidth={2}
              dot={{ fill: '#f39c12', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {chartData.length > 0 && (
        <div className="mt-2 d-flex justify-content-center gap-3" style={{ fontSize: '0.8rem' }}>
          <div className="d-flex align-items-center">
            <span style={{ 
              display: 'inline-block',
              width: '20px', 
              height: '12px', 
              background: '#e74c3c',
              borderRadius: '2px',
              marginRight: '6px'
            }}></span>
            <span>Điểm của bạn</span>
          </div>
          <div className="d-flex align-items-center">
            <span style={{ 
              display: 'inline-block',
              width: '20px', 
              height: '2px', 
              background: '#f39c12',
              marginRight: '6px',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '6px',
                height: '6px',
                background: '#f39c12',
                borderRadius: '50%'
              }}></span>
            </span>
            <span>Điểm TB lớp học phần</span>
          </div>
        </div>
      )}
    </div>
  );
}
