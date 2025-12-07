import React from 'react';

/**
 * Modal xác nhận
 */
export function ConfirmModal({ show, message, onConfirm, onCancel, title = 'Xác nhận' }) {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal thông báo
 */
export function AlertModal({ show, message, type = 'info', onClose, title }) {
  if (!show) return null;

  const typeConfig = {
    success: { bg: 'bg-success', icon: '✅', defaultTitle: 'Thành công' },
    danger: { bg: 'bg-danger', icon: '❌', defaultTitle: 'Lỗi' },
    warning: { bg: 'bg-warning', icon: '⚠️', defaultTitle: 'Cảnh báo' },
    info: { bg: 'bg-info', icon: 'ℹ️', defaultTitle: 'Thông báo' }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className={`modal-header ${config.bg} text-white`}>
            <h5 className="modal-title">{title || `${config.icon} ${config.defaultTitle}`}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal nhập liệu (Prompt)
 */
export function PromptModal({ show, message, placeholder, onConfirm, onCancel, title = 'Xác nhận' }) {
  if (!show) return null;

  const handleConfirm = () => {
    const input = document.getElementById('promptInput');
    if (input && onConfirm) {
      onConfirm(input.value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
            <input
              type="text"
              className="form-control"
              id="promptInput"
              placeholder={placeholder}
              autoFocus
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

