// src/pages/Teacher/TeacherDashboard.js
import React, { useEffect, useState } from 'react'
import { getGiangVienId, getGiangVienById } from '../../api'
import TeacherLayout from '../../components/TeacherLayout'

export default function TeacherDashboard() {
  const [gvName, setGvName] = useState('')

  useEffect(() => {
    const id = getGiangVienId()
    if (id) {
      getGiangVienById(id)
        .then((data) => {
          if (data && data.hoTen) setGvName(data.hoTen)
        })
        .catch(() => {})
    }
  }, [])

  return (
    <TeacherLayout title="Bảng điều khiển" activeMenu="overview" gvName={gvName}>
      <div className="container-fluid">
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted">
            <i className="bi bi-person-workspace fs-1 text-secondary"></i>
            <p className="mt-2 mb-0">
          
            </p>
          </div>
        </div>
      </div>
    </TeacherLayout>
  )
}
