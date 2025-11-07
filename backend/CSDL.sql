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
-- Table structure for table `ChuongTrinhKhung`
--

DROP TABLE IF EXISTS `ChuongTrinhKhung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChuongTrinhKhung` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hoc_ky` varchar(10) NOT NULL,
  `nganh_id` int DEFAULT NULL,
  `hoc_phan_id` int NOT NULL,
  `loai_hoc_phan` enum('a','b','c') DEFAULT 'a',
  `so_tiet_lt` int DEFAULT '0',
  `so_tiet_th` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_khung` (`hoc_ky`,`nganh_id`,`hoc_phan_id`),
  KEY `nganh_id` (`nganh_id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  CONSTRAINT `ChuongTrinhKhung_ibfk_1` FOREIGN KEY (`nganh_id`) REFERENCES `Nganh` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ChuongTrinhKhung_ibfk_2` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChuongTrinhKhung`
--

LOCK TABLES `ChuongTrinhKhung` WRITE;
/*!40000 ALTER TABLE `ChuongTrinhKhung` DISABLE KEYS */;
INSERT INTO `ChuongTrinhKhung` VALUES (9,'HK1',4,7,NULL,30,0),(10,'HK1',NULL,8,NULL,60,0),(11,'HK1',NULL,9,NULL,30,0),(12,'HK1',NULL,10,NULL,0,60),(13,'HK1',NULL,11,NULL,30,0),(14,'HK1',4,12,NULL,0,60),(15,'HK1',4,13,NULL,45,0),(16,'HK1',4,14,NULL,0,0),(17,'HK2',4,23,NULL,30,30),(18,'HK2',NULL,24,NULL,30,60),(19,'HK2',NULL,25,NULL,0,60),(20,'HK2',4,26,NULL,45,30),(21,'HK2',NULL,27,'a',30,0),(22,'HK2',NULL,28,'a',45,0),(23,'HK3',4,29,'',45,0),(24,'HK3',4,30,'',45,30),(25,'HK3',4,31,'',45,30),(26,'HK3',NULL,32,'',30,0),(27,'HK3',4,33,'',30,30),(28,'HK3',NULL,34,'',60,0),(29,'HK4',4,35,NULL,45,0),(30,'HK4',4,36,NULL,30,30),(31,'HK4',4,37,NULL,30,30),(32,'HK4',4,38,NULL,30,30),(33,'HK4',NULL,39,NULL,60,0),(34,'HK4',4,40,NULL,30,30),(35,'HK4',4,41,NULL,45,0),(36,'HK4',4,42,NULL,45,30),(37,'HK5',4,43,NULL,45,0),(38,'HK5',NULL,44,NULL,30,0),(39,'HK5',4,45,NULL,30,30),(40,'HK5',NULL,46,NULL,30,0),(41,'HK5',4,47,NULL,45,0),(42,'HK5',NULL,48,NULL,45,0),(43,'HK5',4,49,NULL,30,30);
/*!40000 ALTER TABLE `ChuongTrinhKhung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DangKyHocPhan`
--

DROP TABLE IF EXISTS `DangKyHocPhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DangKyHocPhan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int DEFAULT NULL,
  `lop_hoc_phan_id` int DEFAULT NULL,
  `hoc_phan_id` int DEFAULT NULL,
  `loai_dang_ky` enum('HOC_MOI','HOC_LAI','CAI_THIEN') DEFAULT 'HOC_MOI',
  `hoc_ky` varchar(20) DEFAULT NULL,
  `nam_hoc` varchar(10) DEFAULT NULL,
  `trang_thai` enum('Thành công','Thất bại') DEFAULT 'Thành công',
  `nhom_th` varchar(10) DEFAULT NULL,
  `thoi_diem_dk` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `trang_thai_dk` enum('CHO','THANH_CONG','HUY') DEFAULT 'THANH_CONG',
  `dot_dang_ky_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_sv_lhp_dot` (`sinh_vien_id`,`lop_hoc_phan_id`,`dot_dang_ky_id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  KEY `fk_dkhp_lhp` (`lop_hoc_phan_id`),
  KEY `fk_dkhp_dot` (`dot_dang_ky_id`),
  CONSTRAINT `DangKyHocPhan_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `DangKyHocPhan_ibfk_2` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`),
  CONSTRAINT `fk_dkhp_dot` FOREIGN KEY (`dot_dang_ky_id`) REFERENCES `DotDangKy` (`id`),
  CONSTRAINT `fk_dkhp_lhp` FOREIGN KEY (`lop_hoc_phan_id`) REFERENCES `LopHocPhan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DangKyHocPhan`
--

LOCK TABLES `DangKyHocPhan` WRITE;
/*!40000 ALTER TABLE `DangKyHocPhan` DISABLE KEYS */;
INSERT INTO `DangKyHocPhan` VALUES (1,1,NULL,1,'HOC_MOI','HK1','2025-2026','Thành công',NULL,'2025-11-04 14:42:34','THANH_CONG',NULL),(2,1,NULL,2,'HOC_MOI','HK1','2025-2026','Thành công',NULL,'2025-11-04 14:42:34','THANH_CONG',NULL);
/*!40000 ALTER TABLE `DangKyHocPhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DieuKienHocPhan`
--

DROP TABLE IF EXISTS `DieuKienHocPhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DieuKienHocPhan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hoc_phan_id` int NOT NULL,
  `hoc_phan_lien_quan_id` int NOT NULL,
  `loai` enum('a','b','c') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_dk` (`hoc_phan_id`,`hoc_phan_lien_quan_id`,`loai`),
  KEY `fk_dk_hp2` (`hoc_phan_lien_quan_id`),
  CONSTRAINT `fk_dk_hp1` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`),
  CONSTRAINT `fk_dk_hp2` FOREIGN KEY (`hoc_phan_lien_quan_id`) REFERENCES `HocPhan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DieuKienHocPhan`
--

LOCK TABLES `DieuKienHocPhan` WRITE;
/*!40000 ALTER TABLE `DieuKienHocPhan` DISABLE KEYS */;
/*!40000 ALTER TABLE `DieuKienHocPhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DotDangKy`
--

DROP TABLE IF EXISTS `DotDangKy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DotDangKy` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hoc_ky` varchar(20) NOT NULL,
  `nam_hoc` varchar(10) NOT NULL,
  `thoi_gian_mo` datetime NOT NULL,
  `thoi_gian_dong` datetime NOT NULL,
  `trang_thai` enum('SAP_MO','DANG_MO','DA_DONG') DEFAULT 'SAP_MO',
  `ghi_chu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DotDangKy`
--

LOCK TABLES `DotDangKy` WRITE;
/*!40000 ALTER TABLE `DotDangKy` DISABLE KEYS */;
INSERT INTO `DotDangKy` VALUES (1,'1','2025-2026','2025-11-01 00:00:00','2025-11-30 00:00:00','DANG_MO',NULL);
/*!40000 ALTER TABLE `DotDangKy` ENABLE KEYS */;
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
  CONSTRAINT `GiangVien_ibfk_3` FOREIGN KEY (`nganh_id`) REFERENCES `Nganh` (`id`),
  CONSTRAINT `GiangVien_ibfk_4` FOREIGN KEY (`lop_id`) REFERENCES `Lop` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `GiangVien`
--

LOCK TABLES `GiangVien` WRITE;
/*!40000 ALTER TABLE `GiangVien` DISABLE KEYS */;
INSERT INTO `GiangVien` VALUES (1,'GV001','Nguyễn Test B','1980-01-01','Nam','123 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234567',1,4,4,2),(3,'GV003','Nguyễn Văn A','1980-01-01','Nam','123 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234567',1,4,4,NULL),(4,'GV004','Nguyễn Văn B','1980-01-02','Nam','124 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234568',1,4,4,NULL),(5,'GV005','Nguyễn Văn C','1980-01-03','Nam','125 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234569',1,4,4,NULL),(7,'GV007','Nguyễn Văn D','1980-01-05','Nam','127 Lê Lợi',NULL,NULL,NULL,'nva@iuh.edu.vn','0901234571',1,4,4,NULL),(36,'12342132131','test lần 5','2001-03-06','Nam','321@gmail.com','','Thạc sĩ','Giang vien','123@gmail.com','0369852147',2,3,3,30),(51,'gv002','Nguyễn Test A','1991-06-03','Nam','432/ Quang Trung ','','Thạc sĩ','Giang viên chính','321@gmail.com','0369852471',1,4,1,63),(56,'900','thinh','2001-11-11','Nam','abc','','Cử nhân','chính','thinhdinhdam304@gmail.com','1231231',2,3,3,70),(72,'GV450','Nguyễn Văn A','1980-01-01','Nam','123 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234567',1,4,4,NULL),(73,'GV451','Nguyễn Văn A','1980-01-02','Nam','124 Lê Lợi',NULL,NULL,'Giảng viên chính','nva@iuh.edu.vn','0901234568',1,4,4,NULL),(74,'30','thinh','1998-11-12','Nam','abc','','Cử nhân','chính','thinhdinhdam304@gmail.com','123',8,5,5,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HocPhan`
--

LOCK TABLES `HocPhan` WRITE;
/*!40000 ALTER TABLE `HocPhan` DISABLE KEYS */;
INSERT INTO `HocPhan` VALUES (1,'HP001','Lập trình WWW (Java)',4,NULL,1,4),(2,'HP003','Cơ sở dữ liệu MongoDB',3,'12321321sdfasdf',1,4),(4,'HP011','Big Data',3,NULL,1,2),(5,'HP1111','Toán cao cấp',3,'aaaaaaa',1,1),(6,'HP021','Lập trình thiết bị di động',4,NULL,1,4),(7,'HP022','Nhập môn Tin học',2,NULL,1,4),(8,'HP023','Giáo dục Quốc phòng và an ninh 1 *',4,NULL,NULL,NULL),(9,'HP024','Kỹ năng làm việc nhóm',2,NULL,NULL,NULL),(10,'HP025','Giáo dục thể chất 1 *',2,NULL,NULL,NULL),(11,'HP026','Toán cao cấp 1',2,NULL,NULL,NULL),(12,'HP027','Nhập môn Lập trình',2,NULL,1,4),(13,'HP028','Triết học Mác - Lenin',3,NULL,NULL,NULL),(14,'HP029','Chứng chỉ Tiếng Anh *',0,NULL,NULL,NULL),(23,'HP030','Kỹ thuật lập trình',3,NULL,1,4),(24,'HP031','Giáo dục Quốc phòng và An ninh 2 *',4,NULL,1,NULL),(25,'HP032','Giáo dục thể chất 2 *',2,NULL,1,NULL),(26,'HP033','Hệ Thống Máy tính',4,NULL,1,4),(27,'HP034','Kinh tế chính trị Mác-Lênin',2,NULL,1,NULL),(28,'HP035','Anh văn 1',3,NULL,1,NULL),(29,'HP036','Cấu trúc rời rạc',3,NULL,1,4),(30,'HP037','Cấu trúc dữ liệu và giải thuật',4,NULL,1,4),(31,'HP038','Hệ cơ sở dữ liệu',4,NULL,1,4),(32,'HP039','Toán cao cấp 2',2,NULL,1,NULL),(33,'HP040','Lập trình hướng đối tượng',3,NULL,1,4),(34,'HP041','Anh văn 2',4,NULL,1,NULL),(35,'HP042','Mạng máy tính',3,NULL,1,4),(36,'HP043','Hệ Thống và Công nghệ Web',3,NULL,1,4),(37,'HP044','Phân tích thiết kế hệ thống',3,NULL,1,4),(38,'HP045','Hệ quản trị cơ sở dữ liệu NoSQL MongoDB',3,NULL,1,4),(39,'HP046','Anh văn 3',4,NULL,1,NULL),(40,'HP047','Hệ quản trị cơ sở dữ liệu',3,NULL,1,4),(41,'HP048','Tương tác người máy',3,NULL,1,4),(42,'HP049','Lập trình hướng sự kiện với công nghệ Java',4,NULL,1,4),(43,'HP050','Lý thuyết đồ thị',3,NULL,1,4),(44,'HP051','Phương pháp luận nghiên cứu khoa học',2,NULL,1,NULL),(45,'HP052','Phát triển ứng dụng',3,NULL,1,4),(46,'HP053','Chủ nghĩa xã hội khoa học',2,NULL,1,NULL),(47,'HP054','Mô hình hóa dữ liệu NoSQL MongoDB',3,NULL,1,4),(48,'HP055','Anh văn 4',3,NULL,1,NULL),(49,'HP056','Lập trình phân tích dữ liệu 1',3,NULL,1,4),(50,'HPD01','Thuốc',4,'Học phần tìm hiểu về các loại thuốc\n',8,5);
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
  `dang_ky_id` int DEFAULT NULL,
  `lop_hoc_phan_id` int DEFAULT NULL,
  `han_nop` date DEFAULT NULL,
  `lan_thu` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  KEY `fk_hocphi_dk` (`dang_ky_id`),
  KEY `fk_hocphi_lhp` (`lop_hoc_phan_id`),
  CONSTRAINT `fk_hocphi_dk` FOREIGN KEY (`dang_ky_id`) REFERENCES `DangKyHocPhan` (`id`),
  CONSTRAINT `fk_hocphi_lhp` FOREIGN KEY (`lop_hoc_phan_id`) REFERENCES `LopHocPhan` (`id`),
  CONSTRAINT `HocPhi_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `HocPhi_ibfk_2` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HocPhi`
--

LOCK TABLES `HocPhi` WRITE;
/*!40000 ALTER TABLE `HocPhi` DISABLE KEYS */;
INSERT INTO `HocPhi` VALUES (1,1,1,'HK1','2025-2026',1200000.00,'Chưa nộp',NULL,NULL,NULL,1),(2,1,2,'HK1','2025-2026',1200000.00,'Đã nộp',NULL,NULL,NULL,1);
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
  UNIQUE KEY `uq_ketqua` (`sinh_vien_id`,`hoc_phan_id`,`nam_hoc`,`hoc_ky`),
  KEY `KetQuaHocTap_ibfk_2` (`hoc_phan_id`),
  CONSTRAINT `KetQuaHocTap_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`),
  CONSTRAINT `KetQuaHocTap_ibfk_2` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KetQuaHocTap`
--

LOCK TABLES `KetQuaHocTap` WRITE;
/*!40000 ALTER TABLE `KetQuaHocTap` DISABLE KEYS */;
INSERT INTO `KetQuaHocTap` VALUES (44,1,1,'HK2','2024-2025',7.00,8.00,9.00,NULL,NULL,7.00,8.00,NULL,8.00,7.80,3.00,'B','Khá','Khá','Đạt'),(45,41,1,'HK2','2024-2025',6.00,7.00,8.00,7.00,NULL,8.00,8.00,NULL,7.00,7.00,3.00,'B','Khá','Khá','Đạt'),(64,1,6,'HK1','2025-2026',7.00,8.00,9.00,NULL,NULL,7.00,8.00,NULL,7.00,7.30,3.00,'B','Khá','Khá','Đạt'),(65,41,6,'HK1','2025-2026',6.00,7.00,8.00,7.00,NULL,8.00,8.00,NULL,7.00,7.00,3.00,'B','Khá','Khá','Đạt'),(74,1,2,'HK1','2025-2026',7.00,8.00,9.00,NULL,NULL,7.00,8.00,NULL,7.00,7.30,3.00,'B','Khá','Khá','Đạt'),(75,41,2,'HK1','2025-2026',6.00,7.00,8.00,7.00,NULL,8.00,8.00,NULL,7.00,7.00,3.00,'B','Khá','Khá','Đạt');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Khoa`
--

LOCK TABLES `Khoa` WRITE;
/*!40000 ALTER TABLE `Khoa` DISABLE KEYS */;
INSERT INTO `Khoa` VALUES (1,'Công nghệ thông tin'),(2,'Kinh tế'),(3,'Cơ khí'),(4,'Ngoại ngữ'),(5,'Thương mại - du lịch'),(6,'Luật'),(7,'Công nghệ điện'),(8,'Dược');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LichHoc`
--

LOCK TABLES `LichHoc` WRITE;
/*!40000 ALTER TABLE `LichHoc` DISABLE KEYS */;
INSERT INTO `LichHoc` VALUES (3,2,2,'sáng',1,3,'V7.02','Cơ sở 1',NULL,'lythuyet',NULL),(4,2,4,'chiều',7,9,'H8.03','Cơ sở 1',NULL,'thuchanh',NULL),(5,2,6,'sáng',1,3,'H8.01','Cơ sở 1',NULL,'lythuyet',NULL),(6,2,6,'chiều',7,9,'H8.01','Cơ sở 1','2025-10-31','thi',NULL),(7,9,4,'tối',7,8,'H8.03','1','2003-04-30','lythuyet',NULL),(8,8,7,'sáng',1,3,'H4.01','Cơ sở 1','2025-01-11','lythuyet',NULL),(9,8,8,'sáng',1,3,'H8.03','Cơ sở 1','2025-01-12','lythuyet',NULL),(10,7,6,'sáng',1,3,'V7.02','Cơ sở 1','2025-11-01','lythuyet',NULL);
/*!40000 ALTER TABLE `LichHoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LichSuDangKyHP`
--

DROP TABLE IF EXISTS `LichSuDangKyHP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LichSuDangKyHP` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dang_ky_id` int NOT NULL,
  `hanh_dong` enum('THEM','HUY') NOT NULL,
  `thoi_diem` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ghi_chu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dang_ky_id` (`dang_ky_id`),
  CONSTRAINT `LichSuDangKyHP_ibfk_1` FOREIGN KEY (`dang_ky_id`) REFERENCES `DangKyHocPhan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LichSuDangKyHP`
--

LOCK TABLES `LichSuDangKyHP` WRITE;
/*!40000 ALTER TABLE `LichSuDangKyHP` DISABLE KEYS */;
/*!40000 ALTER TABLE `LichSuDangKyHP` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Lop`
--

LOCK TABLES `Lop` WRITE;
/*!40000 ALTER TABLE `Lop` DISABLE KEYS */;
INSERT INTO `Lop` VALUES (1,'DHKTPM17BTT',1,4),(2,'HTTT01',1,2),(3,'QTKD01',2,3),(4,'DHKTPM19BTT',1,4),(5,'DTT011',8,5),(6,'DHKTPM18BTT',1,4);
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
  `si_so_toi_da` int NOT NULL DEFAULT '50',
  `si_so_da_dk` int NOT NULL DEFAULT '0',
  `trang_thai_dk` enum('LEN_KE_HOACH','MO_DK','DA_KHOA','HUY') DEFAULT 'MO_DK',
  `nhom_th` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hoc_phan_id` (`hoc_phan_id`),
  KEY `giang_vien_id` (`giang_vien_id`),
  KEY `lop_id` (`lop_id`),
  CONSTRAINT `LopHocPhan_ibfk_1` FOREIGN KEY (`hoc_phan_id`) REFERENCES `HocPhan` (`id`),
  CONSTRAINT `LopHocPhan_ibfk_2` FOREIGN KEY (`giang_vien_id`) REFERENCES `GiangVien` (`id`),
  CONSTRAINT `LopHocPhan_ibfk_3` FOREIGN KEY (`lop_id`) REFERENCES `Lop` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LopHocPhan`
--

LOCK TABLES `LopHocPhan` WRITE;
/*!40000 ALTER TABLE `LopHocPhan` DISABLE KEYS */;
INSERT INTO `LopHocPhan` VALUES (2,'DHKTPM17BTT-HP001',1,1,1,'HK1','2025-2026','Đang học','2025-08-11','2025-11-17',15,50,0,'MO_DK',NULL),(6,'DHKTPM17BTT-HP003',2,1,1,'HK1','2025-2026','Đang học','2025-08-13','2025-11-19',17,50,0,'MO_DK',NULL),(7,'DHHTTT17DTT-HP011',4,36,2,'HK1','2025-2026','Đang học','2025-08-22','2025-11-21',15,50,0,'MO_DK',NULL),(8,'DHKTPM17BTT-HP021',6,51,1,'HK1','2025-2026','Đang học','2025-12-08','2025-11-29',15,50,0,'MO_DK',NULL),(9,'DTT01',50,74,5,'HK1','2025-2026','Đang học','2025-04-20','2025-07-13',13,50,0,'MO_DK',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Nganh`
--

LOCK TABLES `Nganh` WRITE;
/*!40000 ALTER TABLE `Nganh` DISABLE KEYS */;
INSERT INTO `Nganh` VALUES (1,'KHMT','Khoa học máy tính',1),(2,'HTTT','Hệ thống thông tin',1),(3,'QTKD','Quản trị kinh doanh',2),(4,'KTPM','Kỹ thuật phần mềm',1),(5,'D01','Dược',8);
/*!40000 ALTER TABLE `Nganh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhuHuynh`
--

DROP TABLE IF EXISTS `PhuHuynh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhuHuynh` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` int NOT NULL,
  `loai` enum('Cha','Mẹ','Giám hộ') NOT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `nam_sinh` year DEFAULT NULL,
  `nghe_nghiep` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `dia_chi` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_sv_loai` (`sinh_vien_id`,`loai`),
  CONSTRAINT `fk_phuhuynh_sinhvien_cascade` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhuHuynh`
--

LOCK TABLES `PhuHuynh` WRITE;
/*!40000 ALTER TABLE `PhuHuynh` DISABLE KEYS */;
INSERT INTO `PhuHuynh` VALUES (53,104,'Cha','012345678900','0909000001',1978,'Kinh doanh','cha@example.com','Như trên'),(54,104,'Mẹ','012345678901','0909000002',1980,'Nhân viên văn phòng','me@example.com','Như trên');
/*!40000 ALTER TABLE `PhuHuynh` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SinhVien`
--

LOCK TABLES `SinhVien` WRITE;
/*!40000 ALTER TABLE `SinhVien` DISABLE KEYS */;
INSERT INTO `SinhVien` VALUES (1,'SV001','Trần Thị B','2003-05-12','Nữ','ttb@iuh.edu.vn','0912345678','TPHCM','anh_sv001.jpg','K47',1,4,1,1,3),(2,'SV800','Nguyễn Văn A','2003-05-12','Nam','example@gmail.com','0909123456','123 Đường ABC, Quận 1, TP.HCM',NULL,'K47',1,4,4,NULL,NULL),(3,'SV801','Nguyễn Văn A','2003-05-13','Nam','example@gmail.com','0909123457','124 Đường ABC, Quận 1, TP.HCM',NULL,'K48',1,4,4,NULL,NULL),(4,'SV802','Nguyễn Văn A','2003-05-14','Nam','example@gmail.com','0909123458','125 Đường ABC, Quận 1, TP.HCM',NULL,'K49',1,4,4,NULL,NULL),(5,'SV803','Nguyễn Văn A','2003-05-15','Nam','example@gmail.com','0909123459','126 Đường ABC, Quận 1, TP.HCM',NULL,'K50',1,4,4,NULL,NULL),(6,'SV804','Nguyễn Văn A','2003-05-16','Nam','example@gmail.com','0909123460','127 Đường ABC, Quận 1, TP.HCM',NULL,'K51',1,4,4,NULL,NULL),(7,'SV805','Nguyễn Văn A','2003-05-17','Nam','example@gmail.com','0909123461','128 Đường ABC, Quận 1, TP.HCM',NULL,'K52',1,4,4,NULL,NULL),(8,'SV806','Nguyễn Văn A','2003-05-18','Nam','example@gmail.com','0909123462','129 Đường ABC, Quận 1, TP.HCM',NULL,'K53',1,4,4,NULL,NULL),(9,'SV807','Nguyễn Văn A','2003-05-19','Nam','example@gmail.com','0909123463','130 Đường ABC, Quận 1, TP.HCM',NULL,'K54',1,4,4,NULL,NULL),(11,'214423','fbdbdf','2003-04-30','Nam','thinhdinhdam304@gmail.com','4234','hgfhfhgf',NULL,'K21',2,3,3,NULL,NULL),(12,'121eqw','vbcv','2002-12-21','Nam','thinhdinhdam304@gmail.com','123123','ègdfbd',NULL,'54',2,3,3,NULL,NULL),(13,'30042003','dfbdfb','2003-04-30','Nam','thinhdinhdam304@gmail.com','545345','âcscascs',NULL,'k12',1,2,2,NULL,5),(14,'SV901','Nguyễn Văn A','2003-05-12','Nam','example@gmail.com','0909123456','123 Đường ABC, Quận 1, TP.HCM',NULL,'K47',1,4,4,NULL,NULL),(15,'SV902','Nguyễn Văn A','2003-05-13','Nam','example@gmail.com','0909123457','124 Đường ABC, Quận 1, TP.HCM',NULL,'K48',1,4,4,NULL,NULL),(16,'SV903','Nguyễn Văn A','2003-05-14','Nam','example@gmail.com','0909123458','125 Đường ABC, Quận 1, TP.HCM',NULL,'K49',1,4,4,NULL,NULL),(17,'SV904','Nguyễn Văn A','2003-05-15','Nam','example@gmail.com','0909123459','126 Đường ABC, Quận 1, TP.HCM',NULL,'K50',1,4,4,NULL,NULL),(18,'SV905','Nguyễn Văn A','2003-05-16','Nam','example@gmail.com','0909123460','127 Đường ABC, Quận 1, TP.HCM',NULL,'K51',1,4,4,NULL,NULL),(19,'SV906','Nguyễn Văn A','2003-05-17','Nam','example@gmail.com','0909123461','128 Đường ABC, Quận 1, TP.HCM',NULL,'K52',1,4,4,NULL,NULL),(20,'SV907','Nguyễn Văn A','2003-05-18','Nam','example@gmail.com','0909123462','129 Đường ABC, Quận 1, TP.HCM',NULL,'K53',1,4,4,NULL,NULL),(21,'SV908','Nguyễn Văn A','2003-05-19','Nam','example@gmail.com','0909123463','130 Đường ABC, Quận 1, TP.HCM',NULL,'K54',1,4,4,NULL,NULL),(22,'SV909','Nguyễn Văn A','2003-05-20','Nam','example@gmail.com','0909123464','131 Đường ABC, Quận 1, TP.HCM',NULL,'K55',1,4,4,NULL,NULL),(23,'SV555','Nguyễn Văn B','2003-05-12','Nam','example@gmail.com','0909123456','123 Đường ABC, Quận 1, TP.HCM',NULL,'K47',1,2,2,NULL,6),(24,'SV556','Nguyễn Văn A','2003-05-13','Nam','example@gmail.com','0909123457','124 Đường ABC, Quận 1, TP.HCM',NULL,'K48',1,4,4,NULL,7),(25,'SV557','Nguyễn Văn A','2003-05-14','Nam','example@gmail.com','0909123458','125 Đường ABC, Quận 1, TP.HCM',NULL,'K49',1,4,4,NULL,8),(26,'SV558','Nguyễn Văn A','2003-05-15','Nam','example@gmail.com','0909123459','126 Đường ABC, Quận 1, TP.HCM',NULL,'K50',1,4,4,NULL,9),(27,'SV559','Nguyễn Văn A','2003-05-16','Nam','example@gmail.com','0909123460','127 Đường ABC, Quận 1, TP.HCM',NULL,'K51',1,4,4,NULL,10),(28,'SV560','Nguyễn Văn A','2003-05-17','Nam','example@gmail.com','0909123461','128 Đường ABC, Quận 1, TP.HCM',NULL,'K52',1,2,2,NULL,11),(29,'SV561','Nguyễn Văn A','2003-05-18','Nam','example@gmail.com','0909123462','129 Đường ABC, Quận 1, TP.HCM',NULL,'K53',1,4,4,NULL,12),(30,'SV562','Nguyễn Văn A','2003-05-19','Nam','example@gmail.com','0909123463','130 Đường ABC, Quận 1, TP.HCM',NULL,'K54',1,4,4,NULL,13),(31,'SV563','Nguyễn Văn A','2003-05-20','Nam','example@gmail.com','0909123464','131 Đường ABC, Quận 1, TP.HCM',NULL,'K55',1,4,4,NULL,14),(34,'SV552','Test lần 3','2004-01-22','Nam','123@gmail.com','0325698741','112/2 Quang Trung',NULL,'K47',2,3,3,NULL,NULL),(35,'9999999999','thinh','2003-04-30','Nam','thinhdinhdam304@gmail.com','123123','dgadfga',NULL,'k23',1,2,2,NULL,NULL),(36,'100111','thịnh','2003-04-30','Nam','thinhdinhdam304@gmail.com','123123','adasadsd',NULL,'k19',1,2,2,NULL,NULL),(37,'989898989','a','2003-12-11','Nam','thinhdinhdam304@gmail.com','123123','fsdsdf',NULL,'k21',1,2,2,NULL,28),(38,'44444444444444','test lần 4','2006-03-01','Nam','123@gmail.com','0369852147','122/3 Quang Trung',NULL,'K56',1,2,2,NULL,29),(39,'12','thinh','2005-11-11','Nam','thinhdinhdam304@gmail.com','123123','dfsdfsdf','0870480c-2dce-400f-9054-73231eae9973.jpg','k12',1,2,2,NULL,31),(41,'sv002','Phạm Văn C','2001-03-02','Nam','123@gmail.com','0123654789','12/Nguyễn Văn Bảo',NULL,'47',1,4,1,NULL,33),(42,'2510','thinh','2001-11-11','Nam','thinhdinhdam304@gmail.com','123123','dfsadasd',NULL,'k12',1,2,2,NULL,34),(43,'sv004','test','2001-02-03','Nam','123@gmail.com','0123658974','112/ hai bà trưng',NULL,NULL,2,3,3,NULL,35),(44,'456456','Thinh','2003-04-30','Nam','thinhdinhdam304@gmail.com','0862092145','350 Le Duc Tho','Screenshot 2025-10-28 153852.png','k25',2,3,3,NULL,36),(45,'SV400','Nguyễn Văn A','2003-05-12','Nam','example@gmail.com','0909123456','123 Đường ABC, Quận 1, TP.HCM',NULL,'K47',1,4,4,NULL,NULL),(46,'SV401','Nguyễn Văn A','2003-05-13','Nam','example@gmail.com','0909123457','124 Đường ABC, Quận 1, TP.HCM',NULL,'K48',1,4,4,NULL,NULL),(47,'SV402','Nguyễn Văn A','2003-05-14','Nam','example@gmail.com','0909123458','125 Đường ABC, Quận 1, TP.HCM',NULL,'K49',1,4,4,NULL,NULL),(48,'SV403','Nguyễn Văn A','2003-05-15','Nam','example@gmail.com','0909123459','126 Đường ABC, Quận 1, TP.HCM',NULL,'K50',1,4,4,NULL,NULL),(49,'SV404','Nguyễn Văn A','2003-05-16','Nam','example@gmail.com','0909123460','127 Đường ABC, Quận 1, TP.HCM',NULL,'K51',1,4,4,NULL,NULL),(50,'SV405','Nguyễn Văn A','2003-05-17','Nam','example@gmail.com','0909123461','128 Đường ABC, Quận 1, TP.HCM',NULL,'K52',1,4,4,NULL,NULL),(51,'SV406','Nguyễn Văn A','2003-05-18','Nam','example@gmail.com','0909123462','129 Đường ABC, Quận 1, TP.HCM',NULL,'K53',1,4,4,NULL,NULL),(104,'SV3110','Nguyễn Văn A','2003-05-12','Nam','example@gmail.com','0909123456','123 Đường ABC, Quận 1, TP.HCM',NULL,'K47',1,4,6,NULL,158);
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
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaiKhoan`
--

LOCK TABLES `TaiKhoan` WRITE;
/*!40000 ALTER TABLE `TaiKhoan` DISABLE KEYS */;
INSERT INTO `TaiKhoan` VALUES (1,'admin01','123456','Quản trị','Hoạt động','Nguyễn Văn A',1),(2,'gv001','123456','Giảng viên','Hoạt động','Nguyễn Test B',1),(3,'sv001','123456','Sinh viên','Hoạt động','Trần Thị B',1),(5,'30042003','$2b$10$73z4Ab2PNa0CVZ42H7nKY.KXYfxJv4qOoAhBIPTitxvyaMt.SnRZ.','Sinh viên','Hoạt động',NULL,1),(6,'SV555','$2b$10$ZyBZ6Msi5kFmng7iMPJ/UeoxZWQhdPDdOp0vM9TU7nSdjCPs2fjuC','Sinh viên','Hoạt động',NULL,1),(7,'SV556','$2b$10$OqA3nOKa/hObmy88WzUKheXT0ZtK2yLBwPW3d9XUcAIeX/.gTNQ/q','Sinh viên','Hoạt động',NULL,1),(8,'SV557','$2b$10$2FZMYOhyBAvPqGVSUWdhNOQfPNhqrA16cttnNxN7qH.NwptCNEiNC','Sinh viên','Hoạt động',NULL,0),(9,'SV558','$2b$10$TTFc9sD1G9b9Pz4ltYFUbObGiadIfHypUYzzZkdqdqe2BZcuD8Eva','Sinh viên','Hoạt động',NULL,0),(10,'SV559','$2b$10$1/GUMf2w48cGAFGbMXaHaeotmedXqUSLkeD51nL.NH6GA8SRSzV3G','Sinh viên','Hoạt động',NULL,0),(11,'SV560','$2b$10$VYDLZ28xAYBgNiPQIQ0JyekTxb7ltJphptUYXOX80b439nEnJY5LW','Sinh viên','Hoạt động',NULL,0),(12,'SV561','$2b$10$r/ul5Iq8yQkYlpsR.YDKwug7Eg/8E0BzDCPXbKD2YZG6IUigwt7Sm','Sinh viên','Hoạt động',NULL,0),(13,'SV562','$2b$10$SV7HAQJDNbtCEJJhEeZ5Lely1FYmYb6tn9YfAWCVlqVhGe1ei/Zde','Sinh viên','Hoạt động',NULL,0),(14,'SV563','$2b$10$uWe08sTIKTCXo4xJ/nooQ.kUXxGZuwo854454WRF3rC9h9i8Dybfe','Sinh viên','Hoạt động',NULL,0),(15,'GV300','$2b$10$ncswsDi10c2Ks19oDdySPe9dazVirq/MyJSrY11L1vA5W4v3l4/g.','Giảng viên','Hoạt động',NULL,0),(16,'GV301','$2b$10$dz0o.6D8PPPyd.dbob9TGOI1vT8ywryrT.8Sjr8bX402jpWpJaC/K','Giảng viên','Hoạt động',NULL,0),(17,'GV302','$2b$10$EvCAZiYo87rZMAgvtdq4de50q5SMXOR8MUJORWfExmwOuGYaR3Mte','Giảng viên','Hoạt động',NULL,0),(18,'GV303','$2b$10$BN4/LXSH9sDbyymdAM2Qn.eS/PBtNLjteNaV9jEbkZCD78Qf4HS5m','Giảng viên','Hoạt động',NULL,0),(21,'SV552','$2b$10$m9uuoXpKCgKLzoZQewkReOmEKw9dOvjEoFItIGlWxKiYbo30Xpyym','Sinh viên','Hoạt động',NULL,0),(22,'9999999999','$2b$10$705kPOXkotw.9l8YK4DCIeBtK5aSn3Q5.EqOYjGJl/t4lqZSgvujS','Sinh viên','Hoạt động',NULL,0),(23,'2131','$2b$10$e8sjhEOq17VM8lKo7dMbnOWy2Uh.cC4.Cah2rXVXkkMF0sN0XJUJO','Giảng viên','Hoạt động',NULL,1),(24,'2221','$2b$10$/AxvMNugYuQY73HS3IF1c.1i63xHmRTZRhDfxi8mDhEj.jGmyLctu','Giảng viên','Hoạt động',NULL,0),(25,'12312312','$2b$10$iXTp9OfG1PvYKqpBNy607OnTjd.QdJlA3.68w5i0dJVHIZ788O6cy','Giảng viên','Hoạt động',NULL,0),(27,'123123123','$2b$10$bQCp.xIBKz32K9k6jYttUu.jjZPdDoGhYtJhTNVaqqSJYM0eQRaJK','Giảng viên','Hoạt động','SDVSDV',0),(28,'989898989','$2b$10$xeF4UodgeDshTbBrGIx9j.jYoKKIZyiiiAXWXy/g0fzVVQKgU12w2','Sinh viên','Hoạt động','a',0),(29,'44444444444444','$2b$10$K4bKhE7V9hpcyKCHf0hKuuASbEydgFyCi2eZreQX/C6sk.OtC8LEi','Sinh viên','Hoạt động','test lần 4',1),(30,'12342132131','$2b$10$bgwOtUwo6feUr90NGhK.S.UUecgMY8lIKwlu0bzb0pAtC8sndEKwm','Giảng viên','Hoạt động','test lần 5',0),(31,'12','$2b$10$9LyHAxZ4s5bVfYFeXcXrk.zEOi5t.AYP3/n/psTIvefoqGDgMS7g.','Sinh viên','Hoạt động','thinh',1),(33,'sv002','$2b$10$P6DHhea9WSxQ.sw3LAiaJOhn/5yVDY0ov0W1RBveYLs7lhtcIyy4G','Sinh viên','Hoạt động','Phạm Văn C',1),(34,'2510','$2b$10$Y0NWAq8kuHoS6AhDgdtmteeVB5P2F5BeKUM02OHDtYZ.kZhFDGA.i','Sinh viên','Hoạt động','thinh',1),(35,'sv004','$2b$10$BfGOUpoYmeT7L4yMXPZgxeK8t9XxfrfBahdARMkGUjYgztFa.UW0W','Sinh viên','Hoạt động','test',1),(36,'456456','$2b$10$s2JX/wqrBrobcZeiSlcYduJdI08MtGpTDwSnxKVaNmsVur3IDfr/y','Sinh viên','Hoạt động','Thinh',1),(59,'112123','$2b$10$dSeLKl.h7IE6rXxgWXHgL.1Y52j.Bou1XzHhkh2x6EqyfJ.hOyq/G','Giảng viên','Hoạt động','dgfgdf',0),(63,'gv002','$2b$10$jgyqGGAtN.wuxIghD57WVegLHqIs2UxsHL0AB.wGaAnjscLFZVXCS','Giảng viên','Hoạt động','Nguyễn Test A',1),(70,'900','$2b$10$hSOIoYkOTrtGtZ67/q86zOqMrZ4t5aKd9cbSZO6qrZIIabSbxYxpW','Giảng viên','Hoạt động','thinh',0),(89,'GV450','$2b$10$kLYB6YJ.xabp5zWb7pRFxuVAOhHq9dkny2/TEifDMpP/oI2ohza6K','Giảng viên','Hoạt động','Nguyễn Văn A',0),(90,'GV451','$2b$10$80HFtye.gLigMCVPQeE4O.g1WiypwSzxBrSwRdbARWSLWTUTQ6woG','Giảng viên','Hoạt động','Nguyễn Văn A',0),(158,'SV3110','$2b$10$/vZ6PqjfEjwocLS97HY.aupCHYHX6mDbkXa4Wg0hTJsD/RWMlxPWW','Sinh viên','Hoạt động','Nguyễn Văn A',1);
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
  `hinh_anh` varchar(255) DEFAULT NULL,
  `video` varchar(255) DEFAULT NULL,
  `tep_dinh_kem` varchar(255) DEFAULT NULL,
  `mo_ta_file` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThongBao`
--

LOCK TABLES `ThongBao` WRITE;
/*!40000 ALTER TABLE `ThongBao` DISABLE KEYS */;
INSERT INTO `ThongBao` VALUES (1,'Thông báo đăng ký học phần HK1','Sinh viên tiến hành đăng ký học phần từ ngày 10/09/2025 đến 20/09/2025.','2025-10-20 04:03:59',NULL,NULL,NULL,NULL),(2,'Thông báo nộp học phí','Hạn chót nộp học phí HK1 là ngày 15/10/2025.','2025-10-20 04:03:59',NULL,NULL,NULL,NULL),(3,'Thông báo khai giảng','Khai giảng năm học 2025','2025-10-27 06:44:43',NULL,NULL,NULL,NULL),(4,'Học bổng học kì I năm học 2025-2026','Danh sách học bổng học kì I năm học 2025-2026','2025-10-28 07:23:53',NULL,NULL,NULL,NULL),(5,'đấ',' xcbdfdfbxcb','2025-10-28 07:49:56','uploads\\1761637796559-Screenshot_2025-10-27_132324.png','uploads\\1761637796562-Screen_Recording_2025-10-27_131816.mp4','uploads\\1761637796581-KhoaLuan.docx',NULL),(6,'edsfsdf','ếdfsdf','2025-10-28 08:08:01',NULL,NULL,NULL,NULL),(7,'e12313','sdfsdf','2025-10-28 08:09:25',NULL,NULL,NULL,NULL),(8,'ểttre','sfsdfsdf','2025-10-28 08:37:54',NULL,'uploads\\1761640675178-Screen_Recording_2025-10-27_131816.mp4','uploads\\1761640675191-MauNhapSinhVien_(2)_(3).xlsx','Danh sách sinh viên được học bổng'),(9,'mới','dfdfbsf','2025-10-28 09:05:59',NULL,NULL,'uploads\\1761642360373-KhoaLuan.docx','file khóa luận'),(10,'1','1','2025-10-28 09:19:02',NULL,NULL,'uploads\\1761643142684-KhoaLuan.docx','file test'),(11,'22323','233333','2025-10-28 09:30:24',NULL,NULL,NULL,'File bài tập'),(15,'123','THÔNG BÁO\r\nVề việc mở cổng đăng ký học phần học kỳ II, năm học 2025–2026\r\n\r\nPhòng Đào tạo thông báo đến toàn thể sinh viên về kế hoạch đăng ký học phần học kỳ II, năm học 2025–2026 như sau:\r\n\r\nThời gian mở cổng đăng ký:  Bắt đầu từ 06 giờ 00, ngày 08 tháng 11 năm 2025 (thứ Bảy).\r\nHình thức và địa chỉ đăng ký: Sinh viên thực hiện đăng ký học phần tại địa chỉ: https://dkhp.iuh.edu.vn/\r\nHướng dẫn trước khi đăng ký:\r\nSinh viên xem Chương trình đào tạo của ngành học để xác định các học phần cần đăng ký cho học kỳ II.\r\nThông tin chi tiết về Chương trình đào tạo, kế hoạch học tập và tiến độ học phần được công bố trên Cổng thông tin sinh viên.\r\nSinh viên cần kiểm tra kết quả học tập và các điều kiện tiên quyết của học phần trước khi đăng ký.\r\nLưu ý: Sau khi hoàn tất đăng ký, sinh viên phải kiểm tra lại danh sách học phần đã đăng ký.\r\nTrân trọng thông báo.','2025-10-29 04:41:16',NULL,NULL,NULL,NULL),(16,'abc','abcee','2025-10-29 12:54:33',NULL,'uploads\\1761742584809-sunset-cat.1920x1080.mp4',NULL,'file mẫu');
/*!40000 ALTER TABLE `ThongBao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ThongBao_Anh`
--

DROP TABLE IF EXISTS `ThongBao_Anh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThongBao_Anh` (
  `id` int NOT NULL AUTO_INCREMENT,
  `thong_bao_id` int NOT NULL,
  `duong_dan` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `thong_bao_id` (`thong_bao_id`),
  CONSTRAINT `ThongBao_Anh_ibfk_1` FOREIGN KEY (`thong_bao_id`) REFERENCES `ThongBao` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThongBao_Anh`
--

LOCK TABLES `ThongBao_Anh` WRITE;
/*!40000 ALTER TABLE `ThongBao_Anh` DISABLE KEYS */;
INSERT INTO `ThongBao_Anh` VALUES (1,6,'uploads\\1761638881697-Screenshot_2025-10-25_230239.png'),(2,7,'uploads\\1761638965641-Screenshot_2025-10-23_165644.png'),(3,7,'uploads\\1761638965643-Screenshot_2025-10-23_165708.png'),(4,7,'uploads\\1761638965645-Screenshot_2025-10-23_165716.png'),(5,7,'uploads\\1761638965645-Screenshot_2025-10-23_165722.png'),(6,7,'uploads\\1761638965645-Screenshot_2025-10-25_150508.png');
/*!40000 ALTER TABLE `ThongBao_Anh` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThongBao_DaDoc`
--

LOCK TABLES `ThongBao_DaDoc` WRITE;
/*!40000 ALTER TABLE `ThongBao_DaDoc` DISABLE KEYS */;
INSERT INTO `ThongBao_DaDoc` VALUES (1,1,1,'Đã đọc','2025-10-28 06:44:48'),(2,1,2,'Đã đọc','2025-10-29 03:55:39'),(3,1,3,'Đã đọc','2025-10-28 06:44:44'),(4,41,3,'Đã đọc','2025-10-28 06:45:57'),(5,41,1,'Đã đọc','2025-10-28 06:46:02'),(6,41,2,'Đã đọc','2025-10-28 06:46:05'),(7,38,3,'Đã đọc','2025-10-28 07:04:03'),(8,24,1,'Đã đọc','2025-10-28 07:16:55'),(9,24,3,'Đã đọc','2025-10-28 07:18:45'),(10,24,2,'Đã đọc','2025-10-28 07:18:52'),(11,1,5,'Đã đọc','2025-10-29 09:12:01'),(12,1,6,'Đã đọc','2025-10-29 00:28:29'),(13,1,7,'Đã đọc','2025-10-29 00:28:47'),(14,1,8,'Đã đọc','2025-10-29 09:12:05'),(15,1,9,'Đã đọc','2025-10-29 00:28:39'),(16,1,10,'Đã đọc','2025-10-29 09:12:08'),(17,1,11,'Đã đọc','2025-10-29 09:12:30'),(18,1,4,'Đã đọc','2025-10-29 09:12:22'),(20,1,15,'Đã đọc','2025-10-29 09:12:12'),(21,44,15,'Đã đọc','2025-10-29 09:31:39'),(22,44,11,'Đã đọc','2025-10-29 09:31:42'),(23,44,10,'Đã đọc','2025-10-29 09:31:45'),(24,1,16,'Đã đọc','2025-10-29 13:39:51');
/*!40000 ALTER TABLE `ThongBao_DaDoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `YeuCauTuVan`
--
-- Tạo bảng Yêu Cầu Tư Vấn


CREATE TABLE IF NOT EXISTS YeuCauTuVan (
  id INT NOT NULL AUTO_INCREMENT,
  sinh_vien_id INT NOT NULL,
  
  -- Loại tư vấn
  loai ENUM('mon_hoc', 'thong_tin_ca_nhan', 'khac') NOT NULL DEFAULT 'mon_hoc',
  
  -- Nếu là tư vấn môn học, cần lưu lớp học phần
  lop_hoc_phan_id INT DEFAULT NULL,
  
  -- Nội dung yêu cầu
  tieu_de VARCHAR(255) NOT NULL,
  noi_dung TEXT NOT NULL,
  
  -- Trạng thái xử lý
  trang_thai ENUM('cho_xu_ly', 'dang_xu_ly', 'da_hoan_thanh', 'da_huy') 
    NOT NULL DEFAULT 'cho_xu_ly',
  
  -- Người phản hồi (admin hoặc giảng viên)
  nguoi_phan_hoi_id INT DEFAULT NULL,
  loai_nguoi_phan_hoi ENUM('admin', 'giang_vien') DEFAULT NULL,
  
  -- Nội dung phản hồi
  noi_dung_phan_hoi TEXT DEFAULT NULL,
  
  -- Timestamps
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  
  -- Foreign keys
  CONSTRAINT FK_YeuCauTuVan_SinhVien 
    FOREIGN KEY (sinh_vien_id) REFERENCES SinhVien(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT FK_YeuCauTuVan_LopHocPhan 
    FOREIGN KEY (lop_hoc_phan_id) REFERENCES LopHocPhan(id) 
    ON DELETE SET NULL,
    
  -- Indexes
  INDEX idx_sinh_vien (sinh_vien_id),
  INDEX idx_lop_hoc_phan (lop_hoc_phan_id),
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_loai (loai),
  INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments
ALTER TABLE YeuCauTuVan 
  COMMENT 'Bảng lưu yêu cầu tư vấn của sinh viên';

-- Dữ liệu mẫu (optional)
 INSERT INTO YeuCauTuVan (sinh_vien_id, loai, lop_hoc_phan_id, tieu_de, noi_dung) 
 VALUES (1, 'mon_hoc', 1, 'Câu hỏi về bài tập lớn', 'Em muốn hỏi về deadline nộp bài tập lớn môn Cơ sở dữ liệu');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-04 22:35:47

CREATE TABLE `NguoiThan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sinh_vien_id` INT NOT NULL,  -- Khóa ngoại đến bảng SinhVien
  `quan_he` ENUM('Cha', 'Mẹ', 'Người giám hộ') NOT NULL,
  `ho_ten` VARCHAR(100) NOT NULL,
  `can_cuoc_cong_dan` VARCHAR(20) NULL,
  `so_dien_thoai` VARCHAR(20) NULL,
  `ngay_sinh` DATE NULL,
  `nghe_nghiep` VARCHAR(50) NULL,
  `email` VARCHAR(100) NULL,
  `dia_chi` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `sinh_vien_id` (`sinh_vien_id`),
  CONSTRAINT `NguoiThan_ibfk_1` FOREIGN KEY (`sinh_vien_id`) REFERENCES `SinhVien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


ALTER TABLE GiangVien DROP FOREIGN KEY GiangVien_ibfk_2;
ALTER TABLE GiangVien
ADD CONSTRAINT GiangVien_ibfk_2
FOREIGN KEY (tai_khoan_id) REFERENCES TaiKhoan(id)
ON DELETE CASCADE;



ALTER TABLE ThongBao 
ADD COLUMN ten_file_goc VARCHAR(255) DEFAULT NULL 
AFTER mo_ta_file;
