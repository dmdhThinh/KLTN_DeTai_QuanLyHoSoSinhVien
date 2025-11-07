# Quy Tắc Validation - Form Thêm Sinh Viên

## 📋 Tổng Quan

Tất cả các trường **BẮT BUỘC** phải điền đầy đủ. Không được để trống.

---

## 🎓 **Thông Tin Sinh Viên**

### 1. **Mã Sinh Viên** ⚠️
- ✅ **Bắt buộc**: Không được để trống
- ✅ **Không trùng lặp**: Kiểm tra với database
- 📝 Format: Tự do (khuyến nghị: SV001, SV002,...)

**Lỗi:**
- "Vui lòng nhập Mã sinh viên."
- "Mã sinh viên đã tồn tại."

---

### 2. **Họ Tên**
- ✅ **Bắt buộc**: Không được để trống
- 📝 Format: Chữ cái tiếng Việt có dấu

**Lỗi:**
- "Vui lòng nhập Họ tên sinh viên."

---

### 3. **Ngày Sinh** ⚠️
- ✅ **Bắt buộc**: Không được để trống
- ✅ **Tuổi >= 18**: (Năm hiện tại - Năm sinh) >= 18
- 📝 Format: YYYY-MM-DD

**Ví dụ:**
- Năm hiện tại: 2025
- Năm sinh tối đa: 2007 (2025 - 18 = 2007)
- Sinh viên sinh năm 2008 trở về sau → **KHÔNG HỢP LỆ**

**Lỗi:**
- "Vui lòng nhập Ngày sinh."
- "Sinh viên phải đủ 18 tuổi. (Năm hiện tại - Năm sinh >= 18)"

---

### 4. **CCCD/CMND** ⚠️
- ✅ **Bắt buộc**: Không được để trống
- ✅ **Đúng 12 chữ số**: Phải là chuỗi 12 ký tự số
- 📝 Format: `^\d{12}$`

**Ví dụ hợp lệ:**
- `001234567890`
- `123456789012`

**Ví dụ KHÔNG hợp lệ:**
- `12345` (thiếu số)
- `12345678901234` (thừa số)
- `12345678901a` (có chữ cái)

**Lỗi:**
- "Vui lòng nhập CCCD/CMND."
- "CCCD/CMND phải là 12 chữ số."

---

### 5. **Số Điện Thoại** ⚠️
- ✅ **Bắt buộc**: Không được để trống
- ✅ **Đúng 10 chữ số**: Bắt đầu bằng số 0
- ✅ **Không trùng lặp**: Kiểm tra với database
- 📝 Format: `^0\d{9}$`

**Ví dụ hợp lệ:**
- `0987654321`
- `0123456789`

**Ví dụ KHÔNG hợp lệ:**
- `987654321` (thiếu số 0 đầu)
- `09876543210` (thừa số)
- `0987654a21` (có chữ cái)

**Lỗi:**
- "Vui lòng nhập Số điện thoại."
- "Số điện thoại phải là 10 chữ số và bắt đầu bằng số 0."
- "Số điện thoại đã được sử dụng."

---

### 6. **Email** ⚠️
- ✅ **Bắt buộc**: Không được để trống
- ✅ **Đúng format email**: `user@domain.com`
- ✅ **Không trùng lặp**: Kiểm tra với database
- 📝 Format: `^[^\s@]+@[^\s@]+\.[^\s@]+$`

**Ví dụ hợp lệ:**
- `student@example.com`
- `nguyenvana@gmail.com`

**Ví dụ KHÔNG hợp lệ:**
- `student` (thiếu @domain)
- `student@` (thiếu domain)
- `@example.com` (thiếu user)

**Lỗi:**
- "Vui lòng nhập Email."
- "Email không hợp lệ."
- "Email đã được sử dụng."

---

### 7. **Địa Chỉ**
- ✅ **Bắt buộc**: Không được để trống

**Lỗi:**
- "Vui lòng nhập Địa chỉ."

---

### 8. **Ảnh Thẻ** ⚠️
- ⚪ **Không bắt buộc**: Có thể bỏ qua
- ✅ **Nếu có**: Phải đúng định dạng ảnh
- ✅ **Kích thước**: Tối đa 5MB
- 📝 Format: JPG, JPEG, PNG, GIF, WEBP

**Lỗi:**
- "Ảnh thẻ phải là file ảnh (JPG, PNG, GIF, WEBP)."
- "Kích thước ảnh không được vượt quá 5MB."

---

## 🏫 **Thông Tin Học Vấn**

### 9. **Khoa**
- ✅ **Bắt buộc**: Phải chọn

**Lỗi:**
- "Vui lòng chọn Khoa."

---

### 10. **Ngành**
- ✅ **Bắt buộc**: Phải chọn
- 🔗 **Phụ thuộc**: Danh sách ngành được lọc theo Khoa đã chọn

**Lỗi:**
- "Vui lòng chọn Ngành."

---

### 11. **Lớp**
- ✅ **Bắt buộc**: Phải chọn
- 🔗 **Phụ thuộc**: Danh sách lớp được lọc theo Ngành đã chọn

**Lỗi:**
- "Vui lòng chọn Lớp."

---

## 👨‍👩‍👦 **Thông Tin Người Thân**

### **Loại Người Thân**
- ⚪ **Cha và Mẹ**: Nhập đầy đủ thông tin 2 người
- ⚪ **Người giám hộ**: Chỉ nhập 1 người

---

### **Nếu chọn "Cha và Mẹ":**

#### **Thông Tin Cha** (Tất cả bắt buộc)
- ✅ Họ tên Cha
- ✅ CCCD Cha (12 số)
- ✅ Nghề nghiệp Cha
- ✅ Ngày sinh Cha
- ✅ Số điện thoại Cha (10 số, bắt đầu 0)
- ✅ Email Cha (đúng format)
- ✅ Địa chỉ Cha

#### **Thông Tin Mẹ** (Tất cả bắt buộc)
- ✅ Họ tên Mẹ
- ✅ CCCD Mẹ (12 số)
- ✅ Nghề nghiệp Mẹ
- ✅ Ngày sinh Mẹ
- ✅ Số điện thoại Mẹ (10 số, bắt đầu 0)
- ✅ Email Mẹ (đúng format)
- ✅ Địa chỉ Mẹ

**Lỗi:**
- "Vui lòng nhập {field} cho Cha/Mẹ."
- "CCCD Cha/Mẹ phải là 12 chữ số."
- "Số điện thoại Cha/Mẹ phải là 10 chữ số và bắt đầu bằng 0."
- "Email Cha/Mẹ không hợp lệ."

---

### **Nếu chọn "Người giám hộ":**

#### **Thông Tin Người Giám Hộ** (Tất cả bắt buộc)
- ✅ Họ tên Người giám hộ
- ✅ CCCD Người giám hộ (12 số)
- ✅ Nghề nghiệp
- ✅ Ngày sinh
- ✅ Số điện thoại (10 số, bắt đầu 0)
- ✅ Email (đúng format)
- ✅ Địa chỉ

**Lỗi:**
- "Vui lòng nhập {field} cho Người giám hộ."
- "CCCD Người giám hộ phải là 12 chữ số."
- "Số điện thoại Người giám hộ phải là 10 chữ số và bắt đầu bằng 0."
- "Email Người giám hộ không hợp lệ."

---

## 🔐 **Backend Validation**

Ngoài validation ở frontend, backend cũng kiểm tra:

### **API: GET /api/sinhviens/check-duplicate**

**Query Parameters:**
- `ma_sv`: Mã sinh viên cần check
- `so_dien_thoai`: Số điện thoại cần check
- `email`: Email cần check
- `exclude_id`: (Optional) ID sinh viên cần bỏ qua (dùng khi edit)

**Response:**
```json
{
  "isDuplicate": false,
  "errors": []
}
```

**Hoặc nếu có trùng:**
```json
{
  "isDuplicate": true,
  "errors": [
    { "field": "ma_sv", "message": "Mã sinh viên đã tồn tại." },
    { "field": "email", "message": "Email đã được sử dụng." }
  ]
}
```

---

## 📊 **Quy Trình Validation**

```
1. User điền form
   ↓
2. Click "Lưu sinh viên"
   ↓
3. Frontend validation (format, required)
   ↓ (PASS)
4. Call API check duplicate (mã SV, SĐT, email)
   ↓ (PASS)
5. Submit form tạo sinh viên
   ↓ (SUCCESS)
6. Upload ảnh thẻ (nếu có)
   ↓ (SUCCESS)
7. Redirect về danh sách
```

**Nếu fail ở bước nào:**
- Hiển thị error message
- Stop process
- User sửa lại

---

## ✅ **Checklist Validation**

**Frontend:**
- [ ] Required all fields
- [ ] CCCD đúng 12 số
- [ ] SĐT đúng 10 số bắt đầu 0
- [ ] Email đúng format
- [ ] Tuổi >= 18
- [ ] Ảnh đúng định dạng (nếu có)
- [ ] Khoa/Ngành/Lớp đã chọn

**Backend:**
- [ ] Check duplicate mã SV
- [ ] Check duplicate SĐT
- [ ] Check duplicate Email
- [ ] Validate khi create sinh viên

**Người thân:**
- [ ] Chọn loại: Cha Mẹ / Người giám hộ
- [ ] Required all fields theo loại
- [ ] CCCD người thân đúng 12 số
- [ ] SĐT người thân đúng 10 số
- [ ] Email người thân đúng format

---

## 🧪 **Test Cases**

### **Test 1: Mã SV trùng**
```
Input: ma_sv = "SV001" (đã tồn tại)
Expected: "Mã sinh viên đã tồn tại."
```

### **Test 2: CCCD sai format**
```
Input: cccd = "123456" (thiếu số)
Expected: "CCCD/CMND phải là 12 chữ số."
```

### **Test 3: SĐT không bắt đầu 0**
```
Input: so_dien_thoai = "987654321"
Expected: "Số điện thoại phải là 10 chữ số và bắt đầu bằng số 0."
```

### **Test 4: Email sai format**
```
Input: email = "student@"
Expected: "Email không hợp lệ."
```

### **Test 5: Tuổi < 18**
```
Input: ngay_sinh = "2010-01-01" (năm 2025 - 2010 = 15 tuổi)
Expected: "Sinh viên phải đủ 18 tuổi."
```

### **Test 6: Ảnh sai định dạng**
```
Input: file = "document.pdf"
Expected: "Ảnh thẻ phải là file ảnh (JPG, PNG, GIF, WEBP)."
```

---

**Created:** 2025-01-07  
**Version:** 1.0
