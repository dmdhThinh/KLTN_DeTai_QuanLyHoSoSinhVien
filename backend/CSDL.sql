CREATE DATABASE  IF NOT EXISTS `quanlysinhvien` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `quanlysinhvien`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: quanlysinhvien.chwga2g2s4mx.ap-southeast-1.rds.amazonaws.com    Database: quanlysinhvien
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `DangKyHocPhan`
--

DROP TABLE IF EXISTS `DangKyHocPhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DangKyHocPhan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `hoc_phan_id` int DEFAULT NULL,
  `hoc_ky` varchar(20) DEFAULT NULL,
  `nam_hoc` varchar(10) DEFAULT NULL,
  `trang_thai` enum('Thành công','Thất bại') DEFAULT 'Thành công',
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  CONSTRAINT `DangKyHocPhan_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `DangKyHocPhan_ibfk_2` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DangKyHocPhan`
--

LOCK TABLES `DangKyHocPhan` WRITE;
/*!40000 ALTER TABLE `DangKyHocPhan` DISABLE KEYS */;
INSERT INTO `DangKyHocPhan` VALUES (1,1,1,'HK1','2025-2026','Thành công'),(2,1,2,'HK1','2025-2026','Thành công');
/*!40000 ALTER TABLE `DangKyHocPhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `GiangVien`
--

DROP TABLE IF EXISTS `GiangVien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GiangVien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_gv` varchar(20) NOT NULL,
  `ho_ten` varchar(100) NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `gioi_tinh` enum('Nam','Nữ','Khác') DEFAULT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `anh_the` varchar(255) DEFAULT NULL,
  `hoc_vi` varchar(50) DEFAULT NULL,
  `chuc_vu` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `khoa_id` int DEFAULT NULL,
  `nganh_id` int DEFAULT NULL,
  `lop_id` int DEFAULT NULL,
  `tai_khoan_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_gv` (`ma_gv`),
  UNIQUE KEY `tai_khoan_id` (`tai_khoan_id`),
  KEY `khoa_id` (`khoa_id`),
  KEY `nganh_id` (`nganh_id`),
  KEY `lop_id` (`lop_id`),
  CONSTRAINT `GiangVien_ibfk_1` FOREIGN KEY (`khoa_id`) REFERENCES `Khoa` (`id`),
  CONSTRAINT `GiangVien_ibfk_2` FOREIGN KEY (`tai_khoan_id`) REFERENCES `TaiKhoan` (`id`),
  CONSTRAINT `GiangVien_ibfk_3` FOREIGN KEY (`nganh_id`) REFERENCES `Nganh` (`id`),
  CONSTRAINT `GiangVien_ibfk_4` FOREIGN KEY (`lop_id`) REFERENCES `Lop` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `GiangVien`
--

LOCK TABLES `GiangVien` WRITE;
/*!40000 ALTER TABLE `GiangVien` DISABLE KEYS */;
INSERT INTO `GiangVien` VALUES (1,'GV001','Nguyễn Văn A',NULL,'Nam',NULL,NULL,NULL,NULL,'nva@iuh.edu.vn','0901234567',1,NULL,NULL,2),(3,'GV003','Nguyễn Văn A','1980-01-01','Nam','123 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234567',1,4,4,NULL),(4,'GV004','Nguyễn Văn A','1980-01-02','Nam','124 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234568',1,4,4,NULL),(5,'GV005','Nguyễn Văn A','1980-01-03','Nam','125 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234569',1,4,4,NULL),(7,'GV007','Nguyễn Văn A','1980-01-05','Nam','127 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234571',1,4,4,NULL),(8,'GV008','Nguyễn Văn A','1980-01-06','Nam','128 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234572',1,4,4,NULL),(9,'GV009','Nguyễn Văn A','1980-01-07','Nam','129 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234573',1,4,4,NULL),(10,'GV0010','Nguyễn Văn A','1980-01-01','Nam','123 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234567',1,4,4,NULL),(11,'GV0011','Nguyễn Văn A','1980-01-02','Nam','124 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234568',1,4,4,NULL),(12,'GV0012','Nguyễn Văn A','1980-01-03','Nam','125 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234569',1,4,4,NULL),(13,'GV0013','Nguyễn Văn A','1980-01-04','Nam','126 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234570',1,4,4,NULL),(14,'GV0014','Nguyễn Văn A','1980-01-05','Nam','127 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234571',1,4,4,NULL),(15,'GV0015','Nguyễn Văn A','1980-01-06','Nam','128 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234572',1,4,4,NULL),(16,'GV0016','Nguyễn Văn A','1980-01-07','Nam','129 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234573',1,2,2,NULL),(18,'GV200','Nguyễn Văn A','1980-01-01','Nam','123 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234567',1,4,4,NULL),(19,'GV201','Nguyễn Văn A','1980-01-02','Nam','124 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234568',1,4,4,NULL),(20,'GV202','Nguyễn Văn A','1980-01-03','Nam','125 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234569',1,4,4,NULL),(21,'GV203','Nguyễn Văn A','1980-01-04','Nam','126 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234570',1,4,4,NULL),(26,'GV300','Nguyễn Văn A','1980-01-01','Nam','123 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234567',1,4,4,15),(27,'GV301','Nguyễn Văn A','1980-01-02','Nam','124 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234568',1,4,4,16),(28,'GV302','Nguyễn Văn A','1980-01-03','Nam','125 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234569',1,4,4,17),(29,'GV303','Nguyễn Văn A','1980-01-04','Nam','126 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234570',1,4,4,18),(30,'000075','xcvxcv','1972-04-30','Nữ','sdfsdfsd',NULL,NULL,'Giảng viên chính','thinhdinhdam304@gmail.com','234234',1,2,2,NULL),(31,'2131','sdsf','1990-04-30','Nam','dsvsdvsdv','','Tiến sĩ','giảng viên chính','thinhdinhdam304@gmail.com','123123',1,2,2,NULL),(32,'2221','dfbdbf','2003-04-30','Nam','sdvsd','','Cử nhân','giảng viên phụ','thinhdinhdam304@gmail.com','2134123',2,3,3,NULL),(33,'12312312','dfbđ','1991-11-11','Nữ','dvsdvsv','','Thạc sĩ','phụ','thinhdinhdam304@gmail.com','123123',1,2,2,NULL),(34,'111','111sdvsdvs','1991-11-11','Nam','sâsasd','','Thạc sĩ','','thinhdinhdam304@gmail.com','12323',2,3,3,NULL),(35,'123123123','SDVSDV','1992-11-11','Nam','DFGDFGD','','Thạc sĩ','123','thinhdinhdam304@gmail.com','423423',1,2,2,27),(36,'12342132131','test lần 5','2001-03-06','Nam','321@gmail.com','','Thạc sĩ','Giang vien','123@gmail.com','0369852147',2,3,3,30);
/*!40000 ALTER TABLE `GiangVien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HoSoHanhChinh`
--

DROP TABLE IF EXISTS `HoSoHanhChinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HoSoHanhChinh` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `loai_ho_so` varchar(100) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `trang_thai` enum('Chờ duyệt','Đang xử lý','Hoàn thành','Từ chối') DEFAULT 'Chờ duyệt',
  `ghi_chu` text,
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  CONSTRAINT `HoSoHanhChinh_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HoSoHanhChinh`
--

LOCK TABLES `HoSoHanhChinh` WRITE;
/*!40000 ALTER TABLE `HoSoHanhChinh` DISABLE KEYS */;
INSERT INTO `HoSoHanhChinh` VALUES (1,1,'Giấy xác nhận sinh viên','2025-10-20 04:03:59','Hoàn thành','Đã ký và đóng dấu');
/*!40000 ALTER TABLE `HoSoHanhChinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HoatDongNgoaiKhoa`
--

DROP TABLE IF EXISTS `HoatDongNgoaiKhoa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HoatDongNgoaiKhoa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_hoat_dong` varchar(100) NOT NULL,
  `ngay_to_chuc` date DEFAULT NULL,
  `dia_diem` varchar(100) DEFAULT NULL,
  `mo_ta` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HoatDongNgoaiKhoa`
--

LOCK TABLES `HoatDongNgoaiKhoa` WRITE;
/*!40000 ALTER TABLE `HoatDongNgoaiKhoa` DISABLE KEYS */;
INSERT INTO `HoatDongNgoaiKhoa` VALUES (1,'Hội thảo AI','2025-11-20','Hội trường A','Chia sẻ về AI và ứng dụng trong CNTT');
/*!40000 ALTER TABLE `HoatDongNgoaiKhoa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HocPhan`
--

DROP TABLE IF EXISTS `HocPhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HocPhan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_hoc_phan` varchar(50) NOT NULL,
  `ten_hoc_phan` varchar(255) NOT NULL,
  `so_tin_chi` int DEFAULT '3',
  `mo_ta` text,
  `khoa_id` int DEFAULT NULL,
  `nganh_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_hoc_phan` (`ma_hoc_phan`),
  KEY `khoa_id` (`khoa_id`),
  KEY `nganh_id` (`nganh_id`),
  CONSTRAINT `HocPhan_ibfk_1` FOREIGN KEY (`khoa_id`) REFERENCES `Khoa` (`id`),
  CONSTRAINT `HocPhan_ibfk_2` FOREIGN KEY (`nganh_id`) REFERENCES `Nganh` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HocPhan`
--

LOCK TABLES `HocPhan` WRITE;
/*!40000 ALTER TABLE `HocPhan` DISABLE KEYS */;
INSERT INTO `HocPhan` VALUES (1,'HP001','Lập trình WWW (Java)',4,NULL,1,4),(2,'HP003','Cơ sở dữ liệu MongoDB',3,'12321321sdfasdf',1,4);
/*!40000 ALTER TABLE `HocPhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HocPhi`
--

DROP TABLE IF EXISTS `HocPhi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HocPhi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `hoc_phan_id` int DEFAULT NULL,
  `hoc_ky` varchar(20) DEFAULT NULL,
  `nam_hoc` varchar(10) DEFAULT NULL,
  `so_tien` decimal(12,2) DEFAULT NULL,
  `tinh_trang` enum('Chưa nộp','Đã nộp','Quá hạn') DEFAULT 'Chưa nộp',
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  CONSTRAINT `HocPhi_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `HocPhi_ibfk_2` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HocPhi`
--

LOCK TABLES `HocPhi` WRITE;
/*!40000 ALTER TABLE `HocPhi` DISABLE KEYS */;
INSERT INTO `HocPhi` VALUES (1,1,1,'HK1','2025-2026',1200000.00,'Chưa nộp'),(2,1,2,'HK1','2025-2026',1200000.00,'Đã nộp');
/*!40000 ALTER TABLE `HocPhi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `KeHoachHocTap`
--

DROP TABLE IF EXISTS `KeHoachHocTap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `KeHoachHocTap` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `hoc_phan_id` int DEFAULT NULL,
  `trang_thai` enum('Đã đăng ký','Đang học','Đã hoàn thành','Chưa đạt') DEFAULT 'Đã đăng ký',
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  CONSTRAINT `KeHoachHocTap_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `KeHoachHocTap_ibfk_2` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KeHoachHocTap`
--

LOCK TABLES `KeHoachHocTap` WRITE;
/*!40000 ALTER TABLE `KeHoachHocTap` DISABLE KEYS */;
/*!40000 ALTER TABLE `KeHoachHocTap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `KetQuaHocTap`
--

DROP TABLE IF EXISTS `KetQuaHocTap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `KetQuaHocTap` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `hoc_phan_id` int DEFAULT NULL,
  `hoc_ky` varchar(20) DEFAULT NULL,
  `nam_hoc` varchar(10) DEFAULT NULL,
  `diem_giua_ky` decimal(4,2) DEFAULT NULL,
  `diem_ly_thuyet_1` decimal(4,2) DEFAULT NULL,
  `diem_ly_thuyet_2` decimal(4,2) DEFAULT NULL,
  `diem_ly_thuyet_3` decimal(4,2) DEFAULT NULL,
  `diem_ly_thuyet_4` decimal(4,2) DEFAULT NULL,
  `diem_thuc_hanh_1` decimal(4,2) DEFAULT NULL,
  `diem_thuc_hanh_2` decimal(4,2) DEFAULT NULL,
  `diem_thuc_hanh_3` decimal(4,2) DEFAULT NULL,
  `diem_cuoi_ky` decimal(4,2) DEFAULT NULL,
  `diem_tong_ket` decimal(4,2) DEFAULT NULL,
  `diem_thang_4` decimal(4,2) DEFAULT NULL,
  `diem_chu` varchar(10) DEFAULT NULL,
  `hoc_luc` varchar(50) DEFAULT NULL,
  `xep_loai` varchar(50) DEFAULT NULL,
  `dat` enum('Đạt','Không đạt') DEFAULT 'Đạt',
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  CONSTRAINT `KetQuaHocTap_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `KetQuaHocTap_ibfk_2` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KetQuaHocTap`
--

LOCK TABLES `KetQuaHocTap` WRITE;
/*!40000 ALTER TABLE `KetQuaHocTap` DISABLE KEYS */;
INSERT INTO `KetQuaHocTap` VALUES (1,1,1,'HK1','2025-2026',7.00,4.00,5.00,6.00,7.00,8.00,9.00,6.00,7.00,6.88,2.50,'C+','TB khá','TB khá','Đạt'),(2,1,2,'HK1','2025-2026',7.00,7.00,3.00,4.00,7.00,9.00,9.00,9.00,9.00,8.04,3.50,'B+','Khá giỏi','Khá giỏi','Đạt');
/*!40000 ALTER TABLE `KetQuaHocTap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Khoa`
--

DROP TABLE IF EXISTS `Khoa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Khoa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_khoa` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Khoa`
--

LOCK TABLES `Khoa` WRITE;
/*!40000 ALTER TABLE `Khoa` DISABLE KEYS */;
INSERT INTO `Khoa` VALUES (1,'Công nghệ thông tin'),(2,'Kinh tế'),(3,'Cơ khí'),(4,'Ngoại ngữ'),(5,'Thương mại - du lịch'),(6,'Luật'),(7,'Công nghệ điện');
/*!40000 ALTER TABLE `Khoa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LichHoc`
--

DROP TABLE IF EXISTS `LichHoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LichHoc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lop_hoc_phan_id` int NOT NULL,
  `thu` int NOT NULL,
  `ca` enum('sáng','chiều','tối') NOT NULL,
  `tiet_bat_dau` int NOT NULL,
  `tiet_ket_thuc` int NOT NULL,
  `phong` varchar(50) DEFAULT NULL,
  `co_so` varchar(50) DEFAULT NULL,
  `ngay_hoc` date DEFAULT NULL,
  `loai` enum('lythuyet','thuchanh','tructuyen','thi') DEFAULT 'lythuyet',
  `ghi_chu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lop_hoc_phan_id` (`lop_hoc_phan_id`),
  CONSTRAINT `LichHoc_ibfk_1` FOREIGN KEY (`lop_hoc_phan_id`) REFERENCES `LopHocPhan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LichHoc`
--

LOCK TABLES `LichHoc` WRITE;
/*!40000 ALTER TABLE `LichHoc` DISABLE KEYS */;
INSERT INTO `LichHoc` VALUES (3,2,2,'sáng',1,3,'V7.02','Cơ sở 1',NULL,'lythuyet',NULL),(4,2,4,'chiều',7,9,'H8.03','Cơ sở 1',NULL,'thuchanh',NULL),(5,2,6,'sáng',1,3,'H8.01','Cơ sở 1',NULL,'lythuyet',NULL);
/*!40000 ALTER TABLE `LichHoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Lop`
--

DROP TABLE IF EXISTS `Lop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Lop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_lop` varchar(50) NOT NULL,
  `khoa_id` int DEFAULT NULL,
  `nganh_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `khoa_id` (`khoa_id`),
  KEY `nganh_id` (`nganh_id`),
  CONSTRAINT `Lop_ibfk_1` FOREIGN KEY (`khoa_id`) REFERENCES `Khoa` (`id`),
  CONSTRAINT `Lop_ibfk_2` FOREIGN KEY (`nganh_id`) REFERENCES `Nganh` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Lop`
--

LOCK TABLES `Lop` WRITE;
/*!40000 ALTER TABLE `Lop` DISABLE KEYS */;
INSERT INTO `Lop` VALUES (1,'DHKTPM17BTT',1,4),(2,'HTTT01',1,2),(3,'QTKD01',2,3),(4,'DHKTPM19BTT',1,4);
/*!40000 ALTER TABLE `Lop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LopHocPhan`
--

DROP TABLE IF EXISTS `LopHocPhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LopHocPhan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_lop_hoc_phan` varchar(50) NOT NULL,
  `hoc_phan_id` int NOT NULL,
  `giang_vien_id` int NOT NULL,
  `lop_id` int NOT NULL,
  `hoc_ky` varchar(20) DEFAULT 'HK1/2025',
  `nam_hoc` varchar(10) DEFAULT '2025-2026',
  `trang_thai` enum('Đang học','Đã kết thúc','Chưa mở') DEFAULT 'Đang học',
  `ngay_bat_dau` date DEFAULT NULL,
  `ngay_ket_thuc` date DEFAULT NULL,
  `so_tuan_hoc` int DEFAULT '15',
  PRIMARY KEY (`id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  KEY `giang_vien_id` (`giang_vien_id`),
  KEY `lop_id` (`lop_id`),
  CONSTRAINT `LopHocPhan_ibfk_1` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`),
  CONSTRAINT `LopHocPhan_ibfk_2` FOREIGN KEY (`giang_vien_id`) REFERENCES `GiangVien` (`id`),
  CONSTRAINT `LopHocPhan_ibfk_3` FOREIGN KEY (`lop_id`) REFERENCES `Lop` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LopHocPhan`
--

LOCK TABLES `LopHocPhan` WRITE;
/*!40000 ALTER TABLE `LopHocPhan` DISABLE KEYS */;
INSERT INTO `LopHocPhan` VALUES (2,'DHKTPM17BTT-HP001',1,1,1,'HK1','2025-2026','Đang học','2025-08-11','2025-11-17',15),(6,'DHKTPM17CTT-HP001',1,1,1,'HK1','2025-2026','Đang học','2025-08-13','2025-11-19',17);
/*!40000 ALTER TABLE `LopHocPhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Nganh`
--

DROP TABLE IF EXISTS `Nganh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Nganh` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_nganh` varchar(20) DEFAULT NULL,
  `ten_nganh` varchar(100) NOT NULL,
  `khoa_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `khoa_id` (`khoa_id`),
  CONSTRAINT `Nganh_ibfk_1` FOREIGN KEY (`khoa_id`) REFERENCES `Khoa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Nganh`
--

LOCK TABLES `Nganh` WRITE;
/*!40000 ALTER TABLE `Nganh` DISABLE KEYS */;
INSERT INTO `Nganh` VALUES (1,'KHMT','Khoa học máy tính',1),(2,'HTTT','Hệ thống thông tin',1),(3,'QTKD','Quản trị kinh doanh',2),(4,'KTPM','Kỹ thuật phần mềm',1);
/*!40000 ALTER TABLE `Nganh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RenLuyen`
--

DROP TABLE IF EXISTS `RenLuyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RenLuyen` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `hoc_ky` varchar(20) DEFAULT NULL,
  `nam_hoc` varchar(10) DEFAULT NULL,
  `diem` int DEFAULT NULL,
  `nhan_xet` text,
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  CONSTRAINT `RenLuyen_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RenLuyen`
--

LOCK TABLES `RenLuyen` WRITE;
/*!40000 ALTER TABLE `RenLuyen` DISABLE KEYS */;
INSERT INTO `RenLuyen` VALUES (1,1,'HK1','2025-2026',80,'Tham gia tích cực hoạt động đoàn hội');
/*!40000 ALTER TABLE `RenLuyen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SinhVien`
--

DROP TABLE IF EXISTS `SinhVien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SinhVien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_sv` varchar(20) NOT NULL,
  `ho_ten` varchar(100) NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `gioi_tinh` enum('Nam','Nữ','Khác') DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `dia_chi` text,
  `anh_the` varchar(255) DEFAULT NULL,
  `khoa_hoc` varchar(10) DEFAULT NULL,
  `khoa_id` int DEFAULT NULL,
  `nganh_id` int DEFAULT NULL,
  `lop_id` int DEFAULT NULL,
  `co_van_id` int DEFAULT NULL,
  `tai_khoan_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_sv` (`ma_sv`),
  UNIQUE KEY `tai_khoan_id` (`tai_khoan_id`),
  KEY `khoa_id` (`khoa_id`),
  KEY `nganh_id` (`nganh_id`),
  KEY `lop_id` (`lop_id`),
  KEY `co_van_id` (`co_van_id`),
  CONSTRAINT `SinhVien_ibfk_1` FOREIGN KEY (`khoa_id`) REFERENCES `Khoa` (`id`),
  CONSTRAINT `SinhVien_ibfk_2` FOREIGN KEY (`nganh_id`) REFERENCES `Nganh` (`id`),
  CONSTRAINT `SinhVien_ibfk_3` FOREIGN KEY (`lop_id`) REFERENCES `Lop` (`id`),
  CONSTRAINT `SinhVien_ibfk_4` FOREIGN KEY (`co_van_id`) REFERENCES `GiangVien` (`id`),
  CONSTRAINT `SinhVien_ibfk_5` FOREIGN KEY (`tai_khoan_id`) REFERENCES `TaiKhoan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SinhVien`
--

LOCK TABLES `SinhVien` WRITE;
/*!40000 ALTER TABLE `SinhVien` DISABLE KEYS */;
INSERT INTO `SinhVien` VALUES (1,'SV001','Trần Thị B','2003-05-12','Nữ','ttb@iuh.edu.vn','0912345678','123 Lê Lợi, Q.1, TP.HCM','anh_sv001.jpg','K47',1,1,1,1,3),(2,'SV800','Nguyễn Văn A','2003-05-12','Nam','example@gmail.com','0909123456','123 Đường ABC, Quận 1, TP.HCM',NULL,'K47',1,4,4,NULL,NULL),(3,'SV801','Nguyễn Văn A','2003-05-13','Nam','example@gmail.com','0909123457','124 Đường ABC, Quận 1, TP.HCM',NULL,'K48',1,4,4,NULL,NULL),(4,'SV802','Nguyễn Văn A','2003-05-14','Nam','example@gmail.com','0909123458','125 Đường ABC, Quận 1, TP.HCM',NULL,'K49',1,4,4,NULL,NULL),(5,'SV803','Nguyễn Văn A','2003-05-15','Nam','example@gmail.com','0909123459','126 Đường ABC, Quận 1, TP.HCM',NULL,'K50',1,4,4,NULL,NULL),(6,'SV804','Nguyễn Văn A','2003-05-16','Nam','example@gmail.com','0909123460','127 Đường ABC, Quận 1, TP.HCM',NULL,'K51',1,4,4,NULL,NULL),(7,'SV805','Nguyễn Văn A','2003-05-17','Nam','example@gmail.com','0909123461','128 Đường ABC, Quận 1, TP.HCM',NULL,'K52',1,4,4,NULL,NULL),(8,'SV806','Nguyễn Văn A','2003-05-18','Nam','example@gmail.com','0909123462','129 Đường ABC, Quận 1, TP.HCM',NULL,'K53',1,4,4,NULL,NULL),(9,'SV807','Nguyễn Văn A','2003-05-19','Nam','example@gmail.com','0909123463','130 Đường ABC, Quận 1, TP.HCM',NULL,'K54',1,4,4,NULL,NULL),(11,'214423','fbdbdf','2003-04-30','Nam','thinhdinhdam304@gmail.com','4234','hgfhfhgf',NULL,'K21',2,3,3,NULL,NULL),(12,'121eqw','vbcv','2002-12-21','Nam','thinhdinhdam304@gmail.com','123123','ègdfbd',NULL,'54',2,3,3,NULL,NULL),(13,'30042003','dfbdfb','2003-04-30','Nam','thinhdinhdam304@gmail.com','545345','âcscascs',NULL,'k12',1,4,1,NULL,5),(14,'SV901','Nguyễn Văn A','2003-05-12','Nam','example@gmail.com','0909123456','123 Đường ABC, Quận 1, TP.HCM',NULL,'K47',1,4,4,NULL,NULL),(15,'SV902','Nguyễn Văn A','2003-05-13','Nam','example@gmail.com','0909123457','124 Đường ABC, Quận 1, TP.HCM',NULL,'K48',1,4,4,NULL,NULL),(16,'SV903','Nguyễn Văn A','2003-05-14','Nam','example@gmail.com','0909123458','125 Đường ABC, Quận 1, TP.HCM',NULL,'K49',1,4,4,NULL,NULL),(17,'SV904','Nguyễn Văn A','2003-05-15','Nam','example@gmail.com','0909123459','126 Đường ABC, Quận 1, TP.HCM',NULL,'K50',1,4,4,NULL,NULL),(18,'SV905','Nguyễn Văn A','2003-05-16','Nam','example@gmail.com','0909123460','127 Đường ABC, Quận 1, TP.HCM',NULL,'K51',1,4,4,NULL,NULL),(19,'SV906','Nguyễn Văn A','2003-05-17','Nam','example@gmail.com','0909123461','128 Đường ABC, Quận 1, TP.HCM',NULL,'K52',1,4,4,NULL,NULL),(20,'SV907','Nguyễn Văn A','2003-05-18','Nam','example@gmail.com','0909123462','129 Đường ABC, Quận 1, TP.HCM',NULL,'K53',1,4,4,NULL,NULL),(21,'SV908','Nguyễn Văn A','2003-05-19','Nam','example@gmail.com','0909123463','130 Đường ABC, Quận 1, TP.HCM',NULL,'K54',1,4,4,NULL,NULL),(22,'SV909','Nguyễn Văn A','2003-05-20','Nam','example@gmail.com','0909123464','131 Đường ABC, Quận 1, TP.HCM',NULL,'K55',1,4,4,NULL,NULL),(23,'SV555','Nguyễn Văn B','2003-05-12','Nam','example@gmail.com','0909123456','123 Đường ABC, Quận 1, TP.HCM',NULL,'K47',1,4,1,NULL,6),(24,'SV556','Nguyễn Văn A','2003-05-13','Nam','example@gmail.com','0909123457','124 Đường ABC, Quận 1, TP.HCM',NULL,'K48',1,4,4,NULL,7),(25,'SV557','Nguyễn Văn A','2003-05-14','Nam','example@gmail.com','0909123458','125 Đường ABC, Quận 1, TP.HCM',NULL,'K49',1,4,4,NULL,8),(26,'SV558','Nguyễn Văn A','2003-05-15','Nam','example@gmail.com','0909123459','126 Đường ABC, Quận 1, TP.HCM',NULL,'K50',1,4,4,NULL,9),(27,'SV559','Nguyễn Văn A','2003-05-16','Nam','example@gmail.com','0909123460','127 Đường ABC, Quận 1, TP.HCM',NULL,'K51',1,4,4,NULL,10),(28,'SV560','Nguyễn Văn A','2003-05-17','Nam','example@gmail.com','0909123461','128 Đường ABC, Quận 1, TP.HCM',NULL,'K52',1,4,4,NULL,11),(29,'SV561','Nguyễn Văn A','2003-05-18','Nam','example@gmail.com','0909123462','129 Đường ABC, Quận 1, TP.HCM',NULL,'K53',1,4,4,NULL,12),(30,'SV562','Nguyễn Văn A','2003-05-19','Nam','example@gmail.com','0909123463','130 Đường ABC, Quận 1, TP.HCM',NULL,'K54',1,4,4,NULL,13),(31,'SV563','Nguyễn Văn A','2003-05-20','Nam','example@gmail.com','0909123464','131 Đường ABC, Quận 1, TP.HCM',NULL,'K55',1,4,4,NULL,14),(34,'SV552','Test lần 3','2004-01-22','Nam','123@gmail.com','0325698741','112/2 Quang Trung',NULL,'K47',2,3,3,NULL,NULL),(35,'9999999999','thinh','2003-04-30','Nam','thinhdinhdam304@gmail.com','123123','dgadfga',NULL,'k23',1,2,2,NULL,NULL),(36,'100111','thịnh','2003-04-30','Nam','thinhdinhdam304@gmail.com','123123','adasadsd',NULL,'k19',1,2,2,NULL,NULL),(37,'989898989','a','2003-12-11','Nam','thinhdinhdam304@gmail.com','123123','fsdsdf',NULL,'k21',1,2,2,NULL,28),(38,'44444444444444','test lần 4','2006-03-01','Nam','123@gmail.com','0369852147','122/3 Quang Trung',NULL,'K56',1,2,2,NULL,29),(39,'12','thinh','2005-11-11','Nam','thinhdinhdam304@gmail.com','123123','dfsdfsdf','0870480c-2dce-400f-9054-73231eae9973.jpg','k12',1,2,2,NULL,31);
/*!40000 ALTER TABLE `SinhVien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaiKhoan`
--

DROP TABLE IF EXISTS `TaiKhoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaiKhoan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Sinh viên','Giảng viên','Quản trị') NOT NULL,
  `trang_thai` enum('Hoạt động','Ngừng hoạt động') DEFAULT 'Hoạt động',
  `ho_ten` varchar(100) DEFAULT NULL,
  `da_doi_mat_khau` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaiKhoan`
--

LOCK TABLES `TaiKhoan` WRITE;
/*!40000 ALTER TABLE `TaiKhoan` DISABLE KEYS */;
INSERT INTO `TaiKhoan` VALUES (1,'admin01','123456','Quản trị','Hoạt động','Nguyễn Văn A',1),(2,'gv001','123456','Giảng viên','Hoạt động','Nguyễn Văn A',1),(3,'sv001','123456','Sinh viên','Hoạt động','Trần Thị B',1),(5,'30042003','$2b$10$HXezi6UswvtSMvrPLBfTZO.6qBKr0Txa4CR67rndl17DtUha20Yea','Sinh viên','Hoạt động',NULL,0),(6,'SV555','$2b$10$AvKZ2.bJio2/VcKZXU6iqe3YF0MVHUexvuCEXCbBgMz4HvXj/YVni','Sinh viên','Hoạt động',NULL,0),(7,'SV556','$2b$10$So4NYAbHQRKpXN6ELTW0e.AhBd8NOc7TG3Jkqyu9zuoo13eDfWuji','Sinh viên','Hoạt động',NULL,0),(8,'SV557','$2b$10$2FZMYOhyBAvPqGVSUWdhNOQfPNhqrA16cttnNxN7qH.NwptCNEiNC','Sinh viên','Hoạt động',NULL,0),(9,'SV558','$2b$10$TTFc9sD1G9b9Pz4ltYFUbObGiadIfHypUYzzZkdqdqe2BZcuD8Eva','Sinh viên','Hoạt động',NULL,0),(10,'SV559','$2b$10$1/GUMf2w48cGAFGbMXaHaeotmedXqUSLkeD51nL.NH6GA8SRSzV3G','Sinh viên','Hoạt động',NULL,0),(11,'SV560','$2b$10$VYDLZ28xAYBgNiPQIQ0JyekTxb7ltJphptUYXOX80b439nEnJY5LW','Sinh viên','Hoạt động',NULL,0),(12,'SV561','$2b$10$r/ul5Iq8yQkYlpsR.YDKwug7Eg/8E0BzDCPXbKD2YZG6IUigwt7Sm','Sinh viên','Hoạt động',NULL,0),(13,'SV562','$2b$10$SV7HAQJDNbtCEJJhEeZ5Lely1FYmYb6tn9YfAWCVlqVhGe1ei/Zde','Sinh viên','Hoạt động',NULL,0),(14,'SV563','$2b$10$uWe08sTIKTCXo4xJ/nooQ.kUXxGZuwo854454WRF3rC9h9i8Dybfe','Sinh viên','Hoạt động',NULL,0),(15,'GV300','$2b$10$ncswsDi10c2Ks19oDdySPe9dazVirq/MyJSrY11L1vA5W4v3l4/g.','Giảng viên','Hoạt động',NULL,0),(16,'GV301','$2b$10$dz0o.6D8PPPyd.dbob9TGOI1vT8ywryrT.8Sjr8bX402jpWpJaC/K','Giảng viên','Hoạt động',NULL,0),(17,'GV302','$2b$10$EvCAZiYo87rZMAgvtdq4de50q5SMXOR8MUJORWfExmwOuGYaR3Mte','Giảng viên','Hoạt động',NULL,0),(18,'GV303','$2b$10$BN4/LXSH9sDbyymdAM2Qn.eS/PBtNLjteNaV9jEbkZCD78Qf4HS5m','Giảng viên','Hoạt động',NULL,0),(21,'SV552','$2b$10$m9uuoXpKCgKLzoZQewkReOmEKw9dOvjEoFItIGlWxKiYbo30Xpyym','Sinh viên','Hoạt động',NULL,0),(22,'9999999999','$2b$10$705kPOXkotw.9l8YK4DCIeBtK5aSn3Q5.EqOYjGJl/t4lqZSgvujS','Sinh viên','Hoạt động',NULL,0),(23,'2131','$2b$10$2sZC5oOOHiuEn4uO7/WScul7rQFpKD0G1VR86lXWyYxjFvT3HVwBu','Giảng viên','Hoạt động',NULL,0),(24,'2221','$2b$10$/AxvMNugYuQY73HS3IF1c.1i63xHmRTZRhDfxi8mDhEj.jGmyLctu','Giảng viên','Hoạt động',NULL,0),(25,'12312312','$2b$10$iXTp9OfG1PvYKqpBNy607OnTjd.QdJlA3.68w5i0dJVHIZ788O6cy','Giảng viên','Hoạt động',NULL,0),(26,'111','$2b$10$upLyUs27pvxcJxK1YBcWM.3U3UkAw0Px4GEHtsVsRgVE7D.gzc3gS','Giảng viên','Hoạt động',NULL,0),(27,'123123123','$2b$10$bQCp.xIBKz32K9k6jYttUu.jjZPdDoGhYtJhTNVaqqSJYM0eQRaJK','Giảng viên','Hoạt động','SDVSDV',0),(28,'989898989','$2b$10$xeF4UodgeDshTbBrGIx9j.jYoKKIZyiiiAXWXy/g0fzVVQKgU12w2','Sinh viên','Hoạt động','a',0),(29,'44444444444444','$2b$10$0Ev1AmD7CJXMWm3/qdveZuwER4nTj13Myk7xtm6ClX6IcIArWfmVu','Sinh viên','Hoạt động','test lần 4',0),(30,'12342132131','$2b$10$bgwOtUwo6feUr90NGhK.S.UUecgMY8lIKwlu0bzb0pAtC8sndEKwm','Giảng viên','Hoạt động','test lần 5',0),(31,'12','$2b$10$GrOqeC1PRDCRsyWyPuETQOyfZDmtqGdXGWRBV5LeohzpQe9.ZZ0TG','Sinh viên','Hoạt động','thinh',0);
/*!40000 ALTER TABLE `TaiKhoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ThamGiaHoatDong`
--

DROP TABLE IF EXISTS `ThamGiaHoatDong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThamGiaHoatDong` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `hoat_dong_id` int DEFAULT NULL,
  `vai_tro` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  KEY `hoat_dong_id` (`hoat_dong_id`),
  CONSTRAINT `ThamGiaHoatDong_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `ThamGiaHoatDong_ibfk_2` FOREIGN KEY (`hoat_dong_id`) REFERENCES `HoatDongNgoaiKhoa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThamGiaHoatDong`
--

LOCK TABLES `ThamGiaHoatDong` WRITE;
/*!40000 ALTER TABLE `ThamGiaHoatDong` DISABLE KEYS */;
INSERT INTO `ThamGiaHoatDong` VALUES (1,1,1,'Người tham gia');
/*!40000 ALTER TABLE `ThamGiaHoatDong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ThongBao`
--

DROP TABLE IF EXISTS `ThongBao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThongBao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(200) NOT NULL,
  `noi_dung` text,
  `ngay_gui` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThongBao`
--

LOCK TABLES `ThongBao` WRITE;
/*!40000 ALTER TABLE `ThongBao` DISABLE KEYS */;
INSERT INTO `ThongBao` VALUES (1,'Thông báo đăng ký học phần HK1','Sinh viên tiến hành đăng ký học phần từ ngày 10/09/2025 đến 20/09/2025.','2025-10-20 04:03:59'),(2,'Thông báo nộp học phí','Hạn chót nộp học phí HK1 là ngày 15/10/2025.','2025-10-20 04:03:59');
/*!40000 ALTER TABLE `ThongBao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ThongBao_DaDoc`
--

DROP TABLE IF EXISTS `ThongBao_DaDoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThongBao_DaDoc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `thong_bao_id` int DEFAULT NULL,
  `da_doc` enum('Chưa đọc','Đã đọc') DEFAULT 'Chưa đọc',
  `ngay_doc` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  KEY `thong_bao_id` (`thong_bao_id`),
  CONSTRAINT `ThongBao_DaDoc_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `ThongBao_DaDoc_ibfk_2` FOREIGN KEY (`thong_bao_id`) REFERENCES `ThongBao` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThongBao_DaDoc`
--

LOCK TABLES `ThongBao_DaDoc` WRITE;
/*!40000 ALTER TABLE `ThongBao_DaDoc` DISABLE KEYS */;
INSERT INTO `ThongBao_DaDoc` VALUES (1,1,1,'Đã đọc',NULL),(2,1,2,'Chưa đọc',NULL);
/*!40000 ALTER TABLE `ThongBao_DaDoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `YeuCauTuVan`
--

DROP TABLE IF EXISTS `YeuCauTuVan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `YeuCauTuVan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `co_van_id` int DEFAULT NULL,
  `noi_dung` text,
  `ngay_gui` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `trang_thai` enum('Chờ phản hồi','Đã phản hồi') DEFAULT 'Chờ phản hồi',
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  KEY `co_van_id` (`co_van_id`),
  CONSTRAINT `YeuCauTuVan_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `YeuCauTuVan_ibfk_2` FOREIGN KEY (`co_van_id`) REFERENCES `GiangVien` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `YeuCauTuVan`
--

LOCK TABLES `YeuCauTuVan` WRITE;
/*!40000 ALTER TABLE `YeuCauTuVan` DISABLE KEYS */;
INSERT INTO `YeuCauTuVan` VALUES (1,1,1,'Em muốn được tư vấn về kế hoạch học tập.','2025-10-20 04:03:59','Chờ phản hồi');
/*!40000 ALTER TABLE `YeuCauTuVan` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-24 11:11:27
