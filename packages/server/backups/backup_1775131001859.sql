/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.22-MariaDB, for osx10.19 (x86_64)
--
-- Host: 127.0.0.1    Database: hardware
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `check_in` datetime NOT NULL,
  `check_out` datetime DEFAULT NULL,
  `status` enum('present','late','absent') DEFAULT 'present',
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `action` varchar(255) NOT NULL,
  `target` varchar(255) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('019d44d8-7674-766f-a37b-f710adf939dd','019d3a03-ce40-740a-b689-c5a62d7a4a92','HIGH_VALUE_SALE_OR_DISCOUNT','Sale #019d44d8-6f45-747f-904d-36a4e6775d3e','Subtotal: 1180000','Total: 1180000, Discount: 0, Method: cash','2026-03-31 20:02:10'),('019d44e7-4079-71ec-b5c8-2a8fa6e75eb6','019d39ee-6a62-77c2-a3f6-afa4f507ee09','HIGH_VALUE_SALE_OR_DISCOUNT','Sale #019d44e7-3854-73b4-8471-ce69c4e0aa5e','Subtotal: 1828500','Total: 1828500, Discount: 0, Method: cash','2026-03-31 20:18:19'),('019d4515-29ca-7389-bf14-c8b2772f7d1d','019d3a03-ce40-740a-b689-c5a62d7a4a92','HIGH_VALUE_SALE_OR_DISCOUNT','Sale #019d4515-24ba-7783-b7ac-8b9b7e94b683','Subtotal: 875000','Total: 875000, Discount: 0, Method: cash','2026-03-31 21:08:28'),('019d4525-5dd9-74e7-8c87-faaa405f5a4a','019d3a03-ce40-740a-b689-c5a62d7a4a92','HIGH_VALUE_SALE_OR_DISCOUNT','Sale #019d4525-5a5f-7415-a66f-bd660f2eab85','Subtotal: 1200000','Total: 1200000, Discount: 0, Method: cash','2026-03-31 21:26:10'),('019d45d7-4a91-7020-9e62-705da24f1d21','019d39ee-6a62-77c2-a3f6-afa4f507ee09','HIGH_VALUE_SALE_OR_DISCOUNT','Sale #019d45d7-46b4-761a-a79e-bbf805b2aa94','Subtotal: 700000','Total: 700000, Discount: 0, Method: cash','2026-04-01 00:40:30'),('019d45d8-fe71-7543-a298-16239bd412ac','019d39ee-6a62-77c2-a3f6-afa4f507ee09','HIGH_VALUE_SALE_OR_DISCOUNT','Sale #019d45d8-fb48-7114-b351-0952684675a1','Subtotal: 1050000','Total: 1050000, Discount: 0, Method: cash','2026-04-01 00:42:22'),('019d45e7-63d8-7261-9a7f-3b16500996d6','019d39ee-6a62-77c2-a3f6-afa4f507ee09','HIGH_VALUE_SALE_OR_DISCOUNT','Sale #019d45e7-5f78-70be-9e77-9785cd7c44fc','Subtotal: 1400000','Total: 1400000, Discount: 0, Method: cash','2026-04-01 00:58:05'),('019d4846-bdc2-73fa-b9c4-e0f1fd72d5e3','019d3a03-ce40-740a-b689-c5a62d7a4a92','HIGH_VALUE_SALE_OR_DISCOUNT','Sale #019d4846-ba38-7490-9788-ed4938d2f413','Subtotal: 640000','Total: 640000, Discount: 0, Method: cash','2026-04-01 12:01:28'),('019d4945-c342-7527-bbe8-55d3ba9d05ee','019d39ee-6a62-77c2-a3f6-afa4f507ee09','UPDATE_PROMOTION','WATER TANKS 1000L FLASH SALE','Config updated','Value: 5.00 percentage','2026-04-01 16:40:01'),('019d49a4-3967-72f8-a63e-49957623a3ed','019d39ee-6a62-77c2-a3f6-afa4f507ee09','SALE_RETURN','019d3a91-c79b-735b-878c-112e5e434dac','Qty: 1 on Sale #019d4911-7c03-76b0-92da-a31ba91b3045','Refund: 332500 UGX | Date: 4/1/2026 | Reason: Wrong Item','2026-04-01 18:23:13'),('019d49ac-2ca6-7032-8d6f-bbb7836707e5','019d39ee-6a62-77c2-a3f6-afa4f507ee09','SALE_RETURN','019d3a91-c79b-735b-878c-112e5e434dac','Qty: 1 on Sale #019d48dc-9b3a-75b5-b97d-9a6912e67a0f','Refund: 332500 UGX | Date: 4/1/2026 | Reason: Wrong Item','2026-04-01 18:31:53'),('019d4ad4-0198-748f-b3b4-17e2dd07759d','019d3a03-ce40-740a-b689-c5a62d7a4a92','PROMOTION_REDEEMED','Sale_#16D525CC',NULL,'Promo: Concrete slabs FLASH SALE (3500 UGX)','2026-04-01 23:55:01'),('019d4adf-e15d-74f9-bb76-84cc23a32f85','019d39ee-6a62-77c2-a3f6-afa4f507ee09','SALE_RETURN','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','Qty: 1 on Sale #019d4adb-f629-7189-b3dc-d23d05db1fc8','Refund: 40000 UGX | Date: 4/2/2026 | Reason: Wrong Item','2026-04-02 00:07:59');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cashier_shifts`
--

DROP TABLE IF EXISTS `cashier_shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cashier_shifts` (
  `id` varchar(36) NOT NULL,
  `cashier_id` varchar(36) NOT NULL,
  `start_time` datetime NOT NULL DEFAULT current_timestamp(),
  `end_time` datetime DEFAULT NULL,
  `opening_cash` decimal(15,2) NOT NULL,
  `expected_cash` decimal(15,2) DEFAULT NULL,
  `actual_cash` decimal(15,2) DEFAULT NULL,
  `variance` decimal(15,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'OPEN',
  PRIMARY KEY (`id`),
  KEY `idx_cashier` (`cashier_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cashier_shifts`
--

LOCK TABLES `cashier_shifts` WRITE;
/*!40000 ALTER TABLE `cashier_shifts` DISABLE KEYS */;
INSERT INTO `cashier_shifts` VALUES ('019d44d8-0fbe-76a8-a1da-548752d91b6d','019d3a03-ce40-740a-b689-c5a62d7a4a92','2026-03-31 20:01:43','2026-03-31 20:25:26',0.00,1180000.00,1100000.00,-80000.00,'CLOSED'),('019d44e6-e807-756f-8e8d-25bed470af6b','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-03-31 20:17:56','2026-03-31 20:24:32',200000.00,2028500.00,2028500.00,0.00,'CLOSED'),('019d4515-0382-7764-9157-5951845ea9f9','019d3a03-ce40-740a-b689-c5a62d7a4a92','2026-03-31 21:08:18','2026-04-01 23:27:05',0.00,3550000.00,1810000.00,-1740000.00,'CLOSED'),('019d45d7-2d75-7359-b28b-8c9646a939d5','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-01 00:40:23','2026-04-01 00:40:42',0.00,700000.00,700000.00,0.00,'CLOSED'),('019d45d8-d572-73ac-ab48-b5a69a7a85c8','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-01 00:42:11','2026-04-01 00:50:28',0.00,1050000.00,700000.00,-350000.00,'CLOSED'),('019d45e7-3bd2-7499-975d-edca6c817f13','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-01 00:57:55','2026-04-01 01:00:02',0.00,1050000.00,1050000.00,0.00,'CLOSED'),('019d4822-a197-71a9-837c-496075b4e8aa','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-01 11:22:02','2026-04-01 11:36:23',0.00,0.00,0.00,0.00,'CLOSED'),('019d483e-27ee-7148-a25f-edee90715345','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-01 11:52:06','2026-04-01 20:55:21',0.00,-332500.00,-332000.00,500.00,'CLOSED'),('019d4ad0-4b14-7423-b9d1-77ebbb6b9bb6','019d3a03-ce40-740a-b689-c5a62d7a4a92','2026-04-01 23:50:57','2026-04-01 23:59:18',0.00,0.00,600500.00,600500.00,'CLOSED'),('019d4adb-7aae-72b6-90a8-3a2b68fa1a7d','019d3a03-ce40-740a-b689-c5a62d7a4a92','2026-04-02 00:03:11','2026-04-02 01:07:34',0.00,401000.00,361000.00,-40000.00,'CLOSED'),('019d4add-9548-71eb-87ae-0c0e575a7ba3','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-02 00:05:28','2026-04-02 01:08:26',0.00,-8000.00,32000.00,40000.00,'CLOSED'),('019d4b22-9902-7563-8e25-dedcfbbaa399','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-02 01:20:51','2026-04-02 01:21:18',0.00,5000.00,5000.00,0.00,'CLOSED'),('019d4b62-5b68-73ad-8f92-4837f1e7e174','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-02 02:30:30','2026-04-02 02:46:28',0.00,0.00,0.00,0.00,'CLOSED'),('019d4b72-6f7b-715e-8160-722e15f2f8c3','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-02 02:48:04','2026-04-02 02:48:45',5000.00,20000.00,20000.00,0.00,'CLOSED'),('019d4ba2-431d-7705-98d8-b28b6968f425','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-04-02 03:40:18','2026-04-02 04:07:45',100000.00,200000.00,200000.00,0.00,'CLOSED');
/*!40000 ALTER TABLE `cashier_shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_payments`
--

DROP TABLE IF EXISTS `customer_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_payments` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'cash',
  `reference` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `recorded_by` varchar(36) DEFAULT NULL,
  `shift_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_payments`
--

LOCK TABLES `customer_payments` WRITE;
/*!40000 ALTER TABLE `customer_payments` DISABLE KEYS */;
INSERT INTO `customer_payments` VALUES ('019d3e7c-b317-7419-9416-404daa3d79ae','019d3e5b-31df-733f-ae8d-1ba49a11009f',717000.00,'cash-transaction',NULL,NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-03-30 14:24:12'),('019d3e85-751c-750b-bd21-b63891078ef6','019d3e5b-31df-733f-ae8d-1ba49a11009f',300000.00,'cash-transaction',NULL,NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-03-30 14:33:46'),('019d4baa-a2c1-767b-8f72-1a4f7f5db1d1','019d3e5b-31df-733f-ae8d-1ba49a11009f',100000.00,'cash-transaction',NULL,NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-04-02 03:49:27');
/*!40000 ALTER TABLE `customer_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `credit_limit` decimal(15,2) DEFAULT 0.00,
  `balance` decimal(15,2) DEFAULT 0.00,
  `guarantor_info` text DEFAULT NULL,
  `last_payment_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('019d3e5b-31df-733f-ae8d-1ba49a11009f','MULONDO GEORGE','+256794324900',NULL,200000.00,16000.00,'KAYAGA FLORENCE 0706235678','2026-04-02 03:49:27','2026-03-30 13:47:37','2026-04-02 03:49:27');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','on_leave','terminated') DEFAULT 'active',
  `joined_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES ('019d39ee-6a62-77c2-a3f6-abf9f310489b','System Admin','ADMIN','0000000000','musiitwajoel@gmail.com',0.00,'active','2026-03-29','2026-03-29 14:10:19','2026-03-29 19:17:45'),('019d3a03-cc56-7155-b6d4-8d0e3ba70cda','MUSIITWA JOEL','CASHIER','+256703840326','tredumollc@gmail.com',1000000.00,'active','2026-03-29','2026-03-29 14:33:40','2026-03-29 18:38:00');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` varchar(36) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `category` varchar(100) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `authorized_by` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES ('019d3f28-a743-7409-9d9d-00e43cbfec0f','2026-03-30 00:00:00','Utilities',100000.00,'ELECTRICITY','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-03-30 17:32:02','2026-03-30 17:32:02'),('019d3f3f-ce31-7215-aed4-bad2fb5dea4c','2026-03-30 00:00:00','Rent',300000.00,'RENT FOR MARCH','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-03-30 17:57:19','2026-03-30 17:57:19'),('019d3f4b-3f31-76f2-8fdb-36462a89cf37','2026-03-30 00:00:00','Other',100000.00,'LOANS','019d39ee-6a62-77c2-a3f6-afa4f507ee09','2026-03-30 18:09:49','2026-03-30 18:09:49'),('019d44c4-9312-769c-b597-b3aee9868aff','2026-03-31 00:00:00','Utilities',10000.00,'FOOD','019d3a03-ce40-740a-b689-c5a62d7a4a92','2026-03-31 19:40:27','2026-03-31 19:40:27');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_transactions`
--

DROP TABLE IF EXISTS `inventory_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_transactions` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_type` (`type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_transactions`
--

LOCK TABLES `inventory_transactions` WRITE;
/*!40000 ALTER TABLE `inventory_transactions` DISABLE KEYS */;
INSERT INTO `inventory_transactions` VALUES ('019d3a39-f8e0-749a-8f8f-08a92c3efec4','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','initial_stock',3,30000.00,NULL,'Initial stock entry',NULL,'2026-03-29 18:32:51'),('019d3a4c-cbb4-762e-aade-9265d858e738','019d3a4c-cb8c-724a-bdf6-95052802720d','initial_stock',25,10000.00,NULL,'Initial stock entry',NULL,'2026-03-29 18:53:24'),('019d3a70-1817-7026-aeec-b12f4ffa5059','019d3a70-1708-771a-b645-1648b9362bbe','initial_stock',50,35000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-187b-70ba-8685-21114948e6dd','019d3a70-186c-7296-93b5-e98cddfdc7e7','initial_stock',100,12000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-18a5-752c-a4cb-45e1631687ba','019d3a70-1881-706d-87a5-2efeb0a85c35','initial_stock',32,150000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-18c5-7356-ae57-12bde3bdb4c9','019d3a70-18b6-70ad-a710-021536917478','initial_stock',45,45000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-18db-74fe-95e7-84fb6838bdfa','019d3a70-18cf-774a-a86b-60aeee86fbaa','initial_stock',78,20000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1907-7622-b205-b7cb11f289e0','019d3a70-18e3-743d-86a9-a0ed428c446b','initial_stock',89,12000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1922-75ff-8f07-751d5355adf6','019d3a70-1910-74c2-951c-7905664ee059','initial_stock',76,13000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1974-7384-98c8-d9bdfb9ffcd9','019d3a70-1940-76c0-8ef8-d8de60fb5d82','initial_stock',23,6000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-19a7-70d5-85ca-d1b1405ebccc','019d3a70-1982-73c2-b117-af8791a27d06','initial_stock',43,18000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-19b4-752a-9ac9-a2cd60cba562','019d3a70-19ae-7468-837e-498aaa4c069c','initial_stock',98,300000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-19bc-751a-87a6-0b17f9191776','019d3a70-19b7-74bd-9ef6-f19d25ecc82c','initial_stock',56,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-19c8-70de-b211-f991a1459250','019d3a70-19c6-74b0-877f-305258278fdd','initial_stock',34,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-19d1-77c8-b3c8-801f75d306f7','019d3a70-19cd-721a-acc8-933c6412ac50','initial_stock',12,4500.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-19e1-7141-ae9b-c97c41a3000d','019d3a70-19df-7202-90d0-192678742386','initial_stock',54,30000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-19e9-74be-97ae-24a56ea3e9a6','019d3a70-19e5-723c-9700-9ec652df8026','initial_stock',76,35000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-19f8-74b9-b3f7-c8c78d209f54','019d3a70-19f3-7389-98c9-01de55677955','initial_stock',76,21000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1a0f-7592-a0a3-215cda25248f','019d3a70-19fb-73fa-8d89-48e1b264b4ae','initial_stock',34,30000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1a1c-760d-a59a-e887f7511ac5','019d3a70-1a19-7201-9523-3dad03573a34','initial_stock',87,3000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1a22-753e-b870-160db1e97275','019d3a70-1a1f-71d9-bffa-0db3a4051647','initial_stock',54,4000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1a43-74fc-b984-792557f2e2a5','019d3a70-1a34-73fe-83fc-b56b95daff4c','initial_stock',34,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1a49-73d2-857b-8fab2597cd22','019d3a70-1a46-7708-b44f-38529360fe10','initial_stock',87,3500.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1a58-7283-8bd0-b0513d6f237c','019d3a70-1a4a-76fb-b798-8314231cd283','initial_stock',34,6700.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-1a7b-717e-b80b-473777b124bc','019d3a70-1a67-744e-86c6-b8446848a6bc','initial_stock',67,2000.00,NULL,'Imported from file',NULL,'2026-03-29 19:31:58'),('019d3a70-b8f8-7178-92b2-6857a06144fc','019d3a70-b8f3-747b-8bf0-84b8d49a4e4e','initial_stock',50,35000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b8fa-754a-a2f2-904389e4f9a2','019d3a70-b8f9-75a9-a6db-51ef4f24905f','initial_stock',100,12000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b8fe-7484-a81b-d59fb81d65ef','019d3a70-b8fd-70f8-bc0b-a72ede4eb11a','initial_stock',32,150000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b90b-75e9-9b43-9844d7d4f053','019d3a70-b90a-730a-91bc-19523ce87b07','initial_stock',45,45000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b90d-71f5-a90d-db47b703b8bc','019d3a70-b90c-731f-a921-d510f8afe7d5','initial_stock',78,20000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b91a-7089-9fb4-4c2275789c69','019d3a70-b90f-7271-93ef-a5eb37e78700','initial_stock',89,12000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b91c-722e-8e27-8957406b97de','019d3a70-b91b-7533-9886-43055c0ef935','initial_stock',76,13000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b91d-7680-aa0c-e3edc97097bd','019d3a70-b91c-722e-8e27-8edfbd1f03d1','initial_stock',23,6000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b91e-72a3-a17f-7ec3aa8423d8','019d3a70-b91e-72a3-a17f-7a014084a92b','initial_stock',43,18000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b920-72d8-b302-8997d1aa387a','019d3a70-b91f-72ca-bc4b-7da24a09465a','initial_stock',98,300000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b922-756c-a148-eab8e7f3fd21','019d3a70-b921-72f6-a848-297271ba2eab','initial_stock',56,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b925-7191-be8b-35ecc6213d0b','019d3a70-b922-756c-a148-efa9507714ea','initial_stock',34,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b982-767d-a060-997df3944cba','019d3a70-b97e-7603-8a3b-e45bea7ebfe4','initial_stock',12,4500.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b98e-7229-ab3f-126e9dc137fa','019d3a70-b984-70bb-b9a4-d41d8457a5f2','initial_stock',54,30000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-b996-717d-8e81-8a2c8c9e6067','019d3a70-b990-7778-a921-312392863550','initial_stock',76,35000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-ba16-7442-a690-833da20a419f','019d3a70-ba05-74e8-a05e-4b6a554eb3cb','initial_stock',76,21000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-ba2a-712c-864f-ab8954b9830c','019d3a70-ba1a-7020-9f24-46e53c5eaf93','initial_stock',34,30000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-ba43-737a-a59f-79aa752e9e8d','019d3a70-ba2c-7141-9f30-e6e96aa61856','initial_stock',87,3000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-ba57-70f8-9280-d776cb4c2466','019d3a70-ba51-758e-ace3-630bf4f1d6d9','initial_stock',54,4000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-ba72-772b-9f4b-c0f8be066778','019d3a70-ba5c-70b9-9fd4-d200fdaded33','initial_stock',34,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-ba7d-735d-af6e-c947346a0cc1','019d3a70-ba7c-77cb-8bac-94265f89f045','initial_stock',87,3500.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-ba7e-7227-8dd4-2347455ddae3','019d3a70-ba7d-735d-af6e-cd3799c40ca9','initial_stock',34,6700.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a70-ba81-7474-a8ab-5e40a2816269','019d3a70-ba7f-77f9-9b23-20c4fd561a21','initial_stock',67,2000.00,NULL,'Imported from file',NULL,'2026-03-29 19:32:39'),('019d3a73-80d9-7738-9436-bcf9a392c77c','019d3a73-80d7-770b-9508-c17f05acd8f1','initial_stock',50,35000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-80dc-703e-8655-5bec5fd41cd8','019d3a73-80db-7218-9580-ec62d148ff14','initial_stock',100,12000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-80de-71ea-9655-5e9abf362409','019d3a73-80dd-750d-aede-911b62005eac','initial_stock',32,150000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8109-707a-8592-652f89c9bdc5','019d3a73-8105-73cb-85d1-ae808d92faa0','initial_stock',45,45000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8111-76f6-8410-004e95201c97','019d3a73-8110-7787-8b3a-90518a48b261','initial_stock',78,20000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8114-77c2-89ee-682fa14dc08c','019d3a73-8113-73bd-82c2-770f2f44afc7','initial_stock',89,12000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-811b-73dd-8eb3-4a2008d9cb64','019d3a73-8115-736a-9255-1d0da6ac84bc','initial_stock',76,13000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8120-7344-be68-d175da53cf07','019d3a73-811f-76b7-b083-3931a1f12963','initial_stock',23,6000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8124-74da-9a5d-78eeb1d904ce','019d3a73-8121-710d-b37b-0310b781b543','initial_stock',43,18000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-812b-7653-b81c-5aad30130054','019d3a73-812a-733e-a428-9015dabc0874','initial_stock',98,300000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8146-709f-aceb-6b8fa9e59093','019d3a73-813d-752f-bc5a-8149b597e89e','initial_stock',56,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8155-75b3-98ae-b87038b87ce3','019d3a73-814e-7294-a6c8-e8fc99e642ce','initial_stock',34,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-816b-76d9-8cb4-4db598b0a962','019d3a73-8165-7638-a0e7-0dba0c475f97','initial_stock',12,4500.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8192-741e-8487-1b81a7b9f001','019d3a73-8189-74f2-8290-fbeae4d20a46','initial_stock',54,30000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-81ec-73f3-a4d0-224de3989dd1','019d3a73-81d2-762c-86f5-b8ede708f93f','initial_stock',76,35000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-827b-7068-ab44-cc3d34d4e826','019d3a73-825e-737d-9707-8a046155f534','initial_stock',76,21000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-8297-7779-99c1-436e0b270857','019d3a73-8290-70e1-8172-4a5439061bda','initial_stock',34,30000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-82e1-7093-b770-032ed975fedd','019d3a73-82bf-7286-9355-0ae6e5ed3dd6','initial_stock',87,3000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:41'),('019d3a73-837e-758a-b1de-2477200d1e53','019d3a73-836f-7541-a63b-3d7d5ceb5dd0','initial_stock',54,4000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:42'),('019d3a73-8388-7252-9093-5bab2064241a','019d3a73-8382-75cb-be0d-83730c282c4a','initial_stock',34,5000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:42'),('019d3a73-8399-732f-9d8e-37f630381efc','019d3a73-8393-70da-8603-2ac072ec9804','initial_stock',87,3500.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:42'),('019d3a73-83b0-7347-8a4e-b0209b15eec3','019d3a73-83a4-764a-b501-22fdb5edf8ad','initial_stock',34,6700.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:42'),('019d3a73-83d4-70c9-be23-93655c1ba9dd','019d3a73-83b9-7143-bf02-418652603e11','initial_stock',67,2000.00,NULL,'Imported from file',NULL,'2026-03-29 19:35:42'),('019d3a91-c753-7669-96fb-c5c2e2bb77bf','019d3a91-c72a-7729-b89d-1ec673333032','initial_stock',50,35000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c764-7662-a830-0e310f4baa37','019d3a91-c762-76a4-9345-839bc164f482','initial_stock',100,12000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c76d-739d-a68e-1872228116d1','019d3a91-c76b-742c-abca-2650e705af30','initial_stock',32,150000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c770-74ae-8504-29a065fcb4df','019d3a91-c76f-77fb-aa49-8dc5aaac916f','initial_stock',45,45000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c771-7548-9997-f6bf98c40bd9','019d3a91-c771-7548-9997-f0ec78224506','initial_stock',78,20000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c773-77f1-b0d5-3a230de24e4c','019d3a91-c772-7655-8b1d-1caa882d2c09','initial_stock',89,12000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c782-7545-a297-e3dd5f5e904c','019d3a91-c777-73ad-a297-eedcb4fdbcfb','initial_stock',76,13000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c797-7133-9da5-84fc2b5ed039','019d3a91-c789-719f-b789-065a0576fa9f','initial_stock',23,6000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c79a-726d-a9f0-de3c731acf8f','019d3a91-c799-716b-b470-3994917c8bc5','initial_stock',43,18000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c79c-746d-a429-f5735823f87b','019d3a91-c79b-735b-878c-112e5e434dac','initial_stock',98,300000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c7a6-709b-8d12-fbbc854f46a1','019d3a91-c79d-765b-8664-6981b65bf605','initial_stock',56,5000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c7aa-777c-b08f-f6ae0a33724f','019d3a91-c7a8-745d-8a5e-23d9e697de99','initial_stock',34,5000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c7ac-7720-afe2-77f3fccc3b12','019d3a91-c7ab-776c-91c2-883d71d73b02','initial_stock',12,4500.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c7af-7056-bbbe-7e5d116f99ad','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','initial_stock',54,30000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c7b2-77c6-adc9-58d43c520330','019d3a91-c7b0-76c9-982e-f664d6f51d21','initial_stock',76,35000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c7bb-7429-9822-e878452547e9','019d3a91-c7ba-72dd-8a1d-557ddc4210d6','initial_stock',76,21000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c7bf-7708-9f29-3cea1a141e36','019d3a91-c7bd-76b0-b874-0088c0dfb1f5','initial_stock',34,30000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c7c1-76fe-825f-92fbcefb8b25','019d3a91-c7c0-757e-97f8-4e2fe314e867','initial_stock',87,3000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c8be-704f-9674-76ed37d05065','019d3a91-c7c4-70d5-850b-f88e01eac4fd','initial_stock',54,4000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c8c4-705f-9a5d-86d5743b7ee9','019d3a91-c8c2-7404-b028-92692d6192c1','initial_stock',34,5000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c922-74dd-9d5c-de642db4fc36','019d3a91-c8f2-7467-a3a4-63180b798fd5','initial_stock',87,3500.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:45'),('019d3a91-c950-7481-9c1e-28728a277bb1','019d3a91-c949-7779-9211-b18b11d4c990','initial_stock',34,6700.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:46'),('019d3a91-c99a-72ea-a629-d427d7b8b485','019d3a91-c96d-75a9-a970-b261467e63b4','initial_stock',67,2000.00,NULL,'Imported from file',NULL,'2026-03-29 20:08:46'),('019d3a92-11ba-724a-ba81-ebf9564a817b','019d3a91-c72a-7729-b89d-1ec673333032','restock',1,35000.00,NULL,'Manual adjustment from Inventory UI',NULL,'2026-03-29 20:09:04'),('019d3ab5-e626-743b-97d8-d3f48a7c854e','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','sale',-3,30000.00,NULL,'Sale reference S-1774806492632',NULL,'2026-03-29 20:48:12'),('019d3ac4-ee90-7313-b311-d5a8fd731384','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','restock',1,30000.00,NULL,'Manual adjustment from Inventory UI',NULL,'2026-03-29 21:04:37'),('019d3ac9-73e6-759d-818c-a463c3c1de3c','019d3a91-c789-719f-b789-065a0576fa9f','sale',-1,6000.00,NULL,'Sale reference S-1774807773995',NULL,'2026-03-29 21:09:34'),('019d3aca-e552-7183-8273-1253f398bd1d','019d3a91-c789-719f-b789-065a0576fa9f','sale',-1,6000.00,NULL,'Sale reference S-1774807868493',NULL,'2026-03-29 21:11:08'),('019d3aca-e553-725e-aee1-8a493ab19796','019d3a91-c79b-735b-878c-112e5e434dac','sale',-1,300000.00,NULL,'Sale reference S-1774807868493',NULL,'2026-03-29 21:11:08'),('019d3adf-4303-75cb-997b-4e735bc55ad6','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,NULL,'Sale reference S-1774809203440',NULL,'2026-03-29 21:33:23'),('019d3ae0-e663-7043-93b4-773b27254a12','019d3a91-c949-7779-9211-b18b11d4c990','sale',-1,6700.00,NULL,'Sale reference S-1774809310547',NULL,'2026-03-29 21:35:10'),('019d3b04-b23e-71fd-b082-f810532729b7','019d3a91-c949-7779-9211-b18b11d4c990','sale',-1,6700.00,'019d3b04-b223-77aa-8961-45286a8fcf73','Sale 019d3b04-b223-77aa-8961-45286a8fcf73',NULL,'2026-03-29 22:14:16'),('019d3b06-e59d-71c9-9ecc-f5483e87c041','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d3b06-e591-70cd-800a-beb9c473e9c3','Sale 019d3b06-e591-70cd-800a-beb9c473e9c3',NULL,'2026-03-29 22:16:41'),('019d3b06-e5cf-75f3-bd64-f81cd52bfd46','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,'019d3b06-e591-70cd-800a-beb9c473e9c3','Sale 019d3b06-e591-70cd-800a-beb9c473e9c3',NULL,'2026-03-29 22:16:41'),('019d3b0d-b032-77e9-bcb2-28c2d60ad5dc','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-3,3500.00,'019d3b0d-aff4-75aa-ba09-19748b3c257b','Sale 019d3b0d-aff4-75aa-ba09-19748b3c257b',NULL,'2026-03-29 22:24:06'),('019d3b1d-64a5-77bb-804c-56f48c2066ec','019d3a91-c96d-75a9-a970-b261467e63b4','sale',-1,2000.00,'019d3b1d-6479-76ca-affb-be95127ee8cc','Sale 019d3b1d-6479-76ca-affb-be95127ee8cc',NULL,'2026-03-29 22:41:15'),('019d3b1d-64cb-770f-88e8-0515870c941a','019d3a91-c7c4-70d5-850b-f88e01eac4fd','sale',-1,4000.00,'019d3b1d-6479-76ca-affb-be95127ee8cc','Sale 019d3b1d-6479-76ca-affb-be95127ee8cc',NULL,'2026-03-29 22:41:15'),('019d3b1d-64d7-748b-bed6-9417dd1d1223','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d3b1d-6479-76ca-affb-be95127ee8cc','Sale 019d3b1d-6479-76ca-affb-be95127ee8cc',NULL,'2026-03-29 22:41:15'),('019d3b22-507a-74a2-83f7-acc00e9b36ef','019d3a91-c76f-77fb-aa49-8dc5aaac916f','sale',-2,45000.00,'019d3b22-506e-73de-8a5b-c6fb5907208e','Sale 019d3b22-506e-73de-8a5b-c6fb5907208e',NULL,'2026-03-29 22:46:37'),('019d3b25-0c1f-70ec-84f9-a842906ef6db','019d3a4c-cb8c-724a-bdf6-95052802720d','sale',-1,10000.00,'019d3b25-0c0a-75b8-87c7-66a6fdbd6bc0','Sale 019d3b25-0c0a-75b8-87c7-66a6fdbd6bc0',NULL,'2026-03-29 22:49:36'),('019d3b25-0c30-740e-a896-31143ec23aa5','019d3a91-c72a-7729-b89d-1ec673333032','sale',-1,35000.00,'019d3b25-0c0a-75b8-87c7-66a6fdbd6bc0','Sale 019d3b25-0c0a-75b8-87c7-66a6fdbd6bc0',NULL,'2026-03-29 22:49:36'),('019d3b2b-1bfd-74af-a640-9f70a8508d96','019d3a91-c76b-742c-abca-2650e705af30','sale',-1,150000.00,'019d3b2b-1bc3-757c-8c57-035a70301c1d','Sale 019d3b2b-1bc3-757c-8c57-035a70301c1d',NULL,'2026-03-29 22:56:14'),('019d3b2b-1c0f-713f-9c5f-680abe8adca2','019d3a91-c72a-7729-b89d-1ec673333032','sale',-1,35000.00,'019d3b2b-1bc3-757c-8c57-035a70301c1d','Sale 019d3b2b-1bc3-757c-8c57-035a70301c1d',NULL,'2026-03-29 22:56:14'),('019d3b2e-225d-721d-93d4-19e31b24c75a','019d3a91-c762-76a4-9345-839bc164f482','sale',-2,12000.00,'019d3b2e-2249-74cb-8a9e-a84feee06778','Sale 019d3b2e-2249-74cb-8a9e-a84feee06778',NULL,'2026-03-29 22:59:32'),('019d3bc9-ad9d-75eb-81f8-f533f94de1b3','019d3a91-c7bd-76b0-b874-0088c0dfb1f5','sale',-1,30000.00,'019d3bc9-ad16-7572-ac55-65f9ddddaa2c','Sale 019d3bc9-ad16-7572-ac55-65f9ddddaa2c',NULL,'2026-03-30 01:49:26'),('019d3bc9-adc9-719d-a002-fc9256a0e1c5','019d3a91-c96d-75a9-a970-b261467e63b4','sale',-1,2000.00,'019d3bc9-ad16-7572-ac55-65f9ddddaa2c','Sale 019d3bc9-ad16-7572-ac55-65f9ddddaa2c',NULL,'2026-03-30 01:49:26'),('019d3bd4-5f7f-73ca-af7f-7182989ed4de','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-2,35000.00,'019d3bd4-5f61-77bd-af2f-c44f4d4f422a','Sale 019d3bd4-5f61-77bd-af2f-c44f4d4f422a',NULL,'2026-03-30 02:01:07'),('019d3bd4-5f90-72c9-9882-8ad4444e1bf2','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','sale',-1,30000.00,'019d3bd4-5f61-77bd-af2f-c44f4d4f422a','Sale 019d3bd4-5f61-77bd-af2f-c44f4d4f422a',NULL,'2026-03-30 02:01:07'),('019d3bd7-0fcb-747e-8a76-24a4c717020c','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d3bd7-0fbc-745f-b07f-088bb2df81ba','Sale 019d3bd7-0fbc-745f-b07f-088bb2df81ba',NULL,'2026-03-30 02:04:03'),('019d3bd7-0fef-733c-a418-101cd087fe1c','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d3bd7-0fd6-71e9-bd29-d05120d397a7','Sale 019d3bd7-0fd6-71e9-bd29-d05120d397a7',NULL,'2026-03-30 02:04:03'),('019d3bd7-0ff8-7369-90ed-f7b2432b8313','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,'019d3bd7-0fbc-745f-b07f-088bb2df81ba','Sale 019d3bd7-0fbc-745f-b07f-088bb2df81ba',NULL,'2026-03-30 02:04:03'),('019d3bd7-0fff-766d-98a2-11d4dbba5f34','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,'019d3bd7-0fd6-71e9-bd29-d05120d397a7','Sale 019d3bd7-0fd6-71e9-bd29-d05120d397a7',NULL,'2026-03-30 02:04:03'),('019d3bd7-1007-71ac-8970-b5975fae271c','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d3bd7-0fbc-745f-b07f-088bb2df81ba','Sale 019d3bd7-0fbc-745f-b07f-088bb2df81ba',NULL,'2026-03-30 02:04:03'),('019d3bd7-100c-70ea-b070-56bdff5fa132','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d3bd7-0fd6-71e9-bd29-d05120d397a7','Sale 019d3bd7-0fd6-71e9-bd29-d05120d397a7',NULL,'2026-03-30 02:04:03'),('019d3bdc-dbe2-74ad-8e18-a472f46a039f','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','Sale 019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a',NULL,'2026-03-30 02:10:23'),('019d3bdc-dbfa-744f-b132-d7f61a14b1d2','019d3a91-c96d-75a9-a970-b261467e63b4','sale',-1,2000.00,'019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','Sale 019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a',NULL,'2026-03-30 02:10:23'),('019d3bdc-dc01-7144-aeeb-4b4998dca227','019d3a91-c949-7779-9211-b18b11d4c990','sale',-1,6700.00,'019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','Sale 019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a',NULL,'2026-03-30 02:10:23'),('019d3bdc-dc10-771b-a024-b76d30613883','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-1,35000.00,'019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','Sale 019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a',NULL,'2026-03-30 02:10:23'),('019d3bdc-dc1c-73fd-8593-7d3322aa5068','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','sale',-1,30000.00,'019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','Sale 019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a',NULL,'2026-03-30 02:10:23'),('019d3bdf-8d45-70ff-8d7c-9667ac2d59d7','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-3,3000.00,'019d3bdf-8ced-77a9-8f81-011ee1580149','Sale 019d3bdf-8ced-77a9-8f81-011ee1580149',NULL,'2026-03-30 02:13:19'),('019d3bdf-8d7d-74bd-a1d2-94598480d0d1','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-3,3000.00,'019d3bdf-8d6c-7792-9d09-7eccc06da7b8','Sale 019d3bdf-8d6c-7792-9d09-7eccc06da7b8',NULL,'2026-03-30 02:13:19'),('019d3bdf-8ef2-7167-98dc-0ceedf9da3bc','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-3,3000.00,'019d3bdf-8ea0-77cd-afe0-a957c2850182','Sale 019d3bdf-8ea0-77cd-afe0-a957c2850182',NULL,'2026-03-30 02:13:20'),('019d3be3-a72d-767a-8f59-4f5d65743ae1','019d3a91-c949-7779-9211-b18b11d4c990','sale',-1,6700.00,'019d3be3-a728-7197-a707-efcb5ba9306f','Sale 019d3be3-a728-7197-a707-efcb5ba9306f',NULL,'2026-03-30 02:17:48'),('019d3be3-a73b-70f6-a98c-64011da92c7a','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d3be3-a728-7197-a707-efcb5ba9306f','Sale 019d3be3-a728-7197-a707-efcb5ba9306f',NULL,'2026-03-30 02:17:48'),('019d3be3-a741-7017-b82f-65876f17a80f','019d3a91-c7ba-72dd-8a1d-557ddc4210d6','sale',-1,21000.00,'019d3be3-a728-7197-a707-efcb5ba9306f','Sale 019d3be3-a728-7197-a707-efcb5ba9306f',NULL,'2026-03-30 02:17:48'),('019d3be3-a74a-758d-8274-cae4add9da60','019d3a91-c7ab-776c-91c2-883d71d73b02','sale',-1,4500.00,'019d3be3-a728-7197-a707-efcb5ba9306f','Sale 019d3be3-a728-7197-a707-efcb5ba9306f',NULL,'2026-03-30 02:17:48'),('019d3de9-7b04-76cf-8974-49378e2914df','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','purchase',7,30000.00,NULL,'Procurement Order: HIMA CEMENT',NULL,'2026-03-30 11:43:24'),('019d3def-5f0c-74a4-ab90-a3493f16e11c','019d3a91-c7c0-757e-97f8-4e2fe314e867','purchase',1,3000.00,NULL,'Procurement Order: Riky Building Materials Ltd',NULL,'2026-03-30 11:49:50'),('019d3df0-1250-7668-a467-f90eb47f6e50','019d3a91-c7c0-757e-97f8-4e2fe314e867','purchase',5,3000.00,NULL,'Procurement Order: Riky Building Materials Ltd',NULL,'2026-03-30 11:50:36'),('019d3e00-74b8-72fa-91ac-f110373b1d4f','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','purchase',1,30000.00,NULL,'PO: HIMA CEMENT',NULL,'2026-03-30 12:08:30'),('019d3e03-3d94-72df-99dd-3cad53cc7f00','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','sale',-2,30000.00,'019d3e03-3d44-7730-8c49-c2d6047ae655','Sale 019d3e03-3d44-7730-8c49-c2d6047ae655',NULL,'2026-03-30 12:11:33'),('019d3e5e-ecd1-71de-bcfa-e1e066fe00ec','019d3a91-c949-7779-9211-b18b11d4c990','sale',-1,6700.00,'019d3e5e-ec6c-75da-ad47-8a3f10bdacf4','Sale 019d3e5e-ec6c-75da-ad47-8a3f10bdacf4',NULL,'2026-03-30 13:51:41'),('019d3e5e-ed30-715a-b507-4fc161791bb0','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,'019d3e5e-ec6c-75da-ad47-8a3f10bdacf4','Sale 019d3e5e-ec6c-75da-ad47-8a3f10bdacf4',NULL,'2026-03-30 13:51:41'),('019d3e69-6dbf-72af-8193-c3979c37827d','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d3e69-6d8e-74b5-a195-e5eb8dbf068e','Sale 019d3e69-6d8e-74b5-a195-e5eb8dbf068e',NULL,'2026-03-30 14:03:10'),('019d3e69-6e00-73e8-a79f-716eecffa821','019d3a91-c7ba-72dd-8a1d-557ddc4210d6','sale',-1,21000.00,'019d3e69-6d8e-74b5-a195-e5eb8dbf068e','Sale 019d3e69-6d8e-74b5-a195-e5eb8dbf068e',NULL,'2026-03-30 14:03:10'),('019d3e6a-deec-776d-b3c5-ae30f07c44d3','019d3a91-c79b-735b-878c-112e5e434dac','sale',-2,300000.00,'019d3e6a-de84-76ec-86a9-5d2ce4b16e76','Sale 019d3e6a-de84-76ec-86a9-5d2ce4b16e76',NULL,'2026-03-30 14:04:44'),('019d3e84-11a1-75cc-a574-fbac92ce9f66','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-2,5000.00,'019d3e84-1175-7069-a49d-5e1e268cd773','Sale 019d3e84-1175-7069-a49d-5e1e268cd773',NULL,'2026-03-30 14:32:15'),('019d3e84-11d1-770f-adf3-8f156c08eaa1','019d3a91-c7ba-72dd-8a1d-557ddc4210d6','sale',-1,21000.00,'019d3e84-1175-7069-a49d-5e1e268cd773','Sale 019d3e84-1175-7069-a49d-5e1e268cd773',NULL,'2026-03-30 14:32:15'),('019d3e84-11e8-73af-b9a8-73636640d181','019d3a91-c79b-735b-878c-112e5e434dac','sale',-1,300000.00,'019d3e84-1175-7069-a49d-5e1e268cd773','Sale 019d3e84-1175-7069-a49d-5e1e268cd773',NULL,'2026-03-30 14:32:16'),('019d3e84-6f72-717f-bfb5-5ee89a1ed1f4','019d3a91-c79b-735b-878c-112e5e434dac','sale',-1,300000.00,'019d3e84-6f40-730b-9383-10621c406d31','Sale 019d3e84-6f40-730b-9383-10621c406d31',NULL,'2026-03-30 14:32:40'),('019d3e9a-6884-76f9-9d4c-60363d42690c','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-2,5000.00,'019d3e9a-686e-71f6-965e-39a128f82f64','Sale 019d3e9a-686e-71f6-965e-39a128f82f64',NULL,'2026-03-30 14:56:39'),('019d3eaa-6631-732a-bf0d-b19209e90832','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','sale',-1,30000.00,'019d3eaa-65db-724b-abf4-c8ab65332cdb','Sale 019d3eaa-65db-724b-abf4-c8ab65332cdb',NULL,'2026-03-30 15:14:07'),('019d3eaa-6664-721c-a677-077db4b58a9a','019d3a91-c7c4-70d5-850b-f88e01eac4fd','sale',-1,4000.00,'019d3eaa-65db-724b-abf4-c8ab65332cdb','Sale 019d3eaa-65db-724b-abf4-c8ab65332cdb',NULL,'2026-03-30 15:14:08'),('019d3eb8-bb64-74ff-aff7-e5f9486492db','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,'019d3eb8-baf1-7588-890a-d87e401fe475','Sale 019d3eb8-baf1-7588-890a-d87e401fe475',NULL,'2026-03-30 15:29:47'),('019d3eb8-bb87-74aa-840a-4750663e0b1a','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d3eb8-baf1-7588-890a-d87e401fe475','Sale 019d3eb8-baf1-7588-890a-d87e401fe475',NULL,'2026-03-30 15:29:47'),('019d3eca-0062-74da-a187-e09e37288809','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d3eca-0022-706c-a8f3-03e5c7214190','Sale 019d3eca-0022-706c-a8f3-03e5c7214190',NULL,'2026-03-30 15:48:39'),('019d3eca-007d-707a-9487-7f20ed1ee102','019d3a91-c7c4-70d5-850b-f88e01eac4fd','sale',-1,4000.00,'019d3eca-0022-706c-a8f3-03e5c7214190','Sale 019d3eca-0022-706c-a8f3-03e5c7214190',NULL,'2026-03-30 15:48:39'),('019d3ed1-4801-731b-a048-37a556a83cb3','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-2,35000.00,'019d3ed1-47e2-740f-8344-3d2b43b5f770','Sale 019d3ed1-47e2-740f-8344-3d2b43b5f770',NULL,'2026-03-30 15:56:36'),('019d3f63-c320-75ef-99ee-09eb6e2e9305','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,'019d3f63-c308-745c-a41b-4ac621240cb9','Sale 019d3f63-c308-745c-a41b-4ac621240cb9',NULL,'2026-03-30 18:36:35'),('019d3f63-c331-72cc-96e3-921e70d2d0c5','019d3a91-c79b-735b-878c-112e5e434dac','sale',-4,300000.00,'019d3f63-c308-745c-a41b-4ac621240cb9','Sale 019d3f63-c308-745c-a41b-4ac621240cb9',NULL,'2026-03-30 18:36:35'),('019d3f63-c33a-7351-bf11-38a8dec21c3d','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-1,35000.00,'019d3f63-c308-745c-a41b-4ac621240cb9','Sale 019d3f63-c308-745c-a41b-4ac621240cb9',NULL,'2026-03-30 18:36:35'),('019d3f63-c340-7064-a19a-aa2639677da7','019d3a91-c7bd-76b0-b874-0088c0dfb1f5','sale',-1,30000.00,'019d3f63-c308-745c-a41b-4ac621240cb9','Sale 019d3f63-c308-745c-a41b-4ac621240cb9',NULL,'2026-03-30 18:36:35'),('019d3f67-1c15-778b-a0c0-8d8858c45b0e','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-7,3000.00,'019d3f67-1bcb-73fb-b9d2-5aa733d49468','Sale 019d3f67-1bcb-73fb-b9d2-5aa733d49468',NULL,'2026-03-30 18:40:15'),('019d3f67-1c63-7081-bde8-ea4c236ef633','019d3a91-c79b-735b-878c-112e5e434dac','sale',-17,300000.00,'019d3f67-1bcb-73fb-b9d2-5aa733d49468','Sale 019d3f67-1bcb-73fb-b9d2-5aa733d49468',NULL,'2026-03-30 18:40:15'),('019d3f69-823f-711d-92e1-63ba93d62ac0','019d3a91-c772-7655-8b1d-1caa882d2c09','purchase',60,12000.00,NULL,'PO: Hardware World Ltd',NULL,'2026-03-30 18:42:52'),('019d3f70-545f-7538-aa51-071330cfb0da','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','sale',-6,30000.00,'019d3f70-5420-738a-9e02-79a4432fa279','Sale 019d3f70-5420-738a-9e02-79a4432fa279',NULL,'2026-03-30 18:50:19'),('019d3fd9-cab6-77c3-bc5b-24408a354f91','019d3a91-c96d-75a9-a970-b261467e63b4','sale',-1,2000.00,'019d3fd9-c810-76c7-8e16-0370fffdc556','Sale 019d3fd9-c810-76c7-8e16-0370fffdc556',NULL,'2026-03-30 20:45:31'),('019d3fd9-cb3f-7579-9c27-7adb0b2055a1','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d3fd9-c810-76c7-8e16-0370fffdc556','Sale 019d3fd9-c810-76c7-8e16-0370fffdc556',NULL,'2026-03-30 20:45:31'),('019d3fdf-ec7b-728a-bb54-ada2fe742f34','019d3a4c-cb8c-724a-bdf6-95052802720d','purchase',1,10000.00,NULL,'PO: HIMA CEMENT',NULL,'2026-03-30 20:52:12'),('019d43ad-8dda-74c5-a709-df12af08d9f8','019d3a91-c79b-735b-878c-112e5e434dac','sale',-5,300000.00,'019d43ad-8d65-773c-8c75-8e77ae624fa8','Sale 019d43ad-8d65-773c-8c75-8e77ae624fa8',NULL,'2026-03-31 14:35:40'),('019d43ad-8e0a-777c-86e0-20693fe1326d','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-6,35000.00,'019d43ad-8d65-773c-8c75-8e77ae624fa8','Sale 019d43ad-8d65-773c-8c75-8e77ae624fa8',NULL,'2026-03-31 14:35:40'),('019d44c2-b053-71eb-84b8-f6c27cecd98b','019d3a91-c96d-75a9-a970-b261467e63b4','sale',-4,2000.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44c2-b075-73c9-b566-289456bb225f','019d3a91-c949-7779-9211-b18b11d4c990','sale',-1,6700.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44c2-b0ba-74cf-b54b-210fa1ca7046','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44c2-b0ca-70f9-8e25-2cbff0bd3dba','019d3a91-c7c4-70d5-850b-f88e01eac4fd','sale',-1,4000.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44c2-b0dd-733b-a657-afcff835ed9f','019d3a91-c7bd-76b0-b874-0088c0dfb1f5','sale',-1,30000.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44c2-b1b9-76bb-a87a-b8daf3d9dc31','019d3a91-c7ba-72dd-8a1d-557ddc4210d6','sale',-1,21000.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44c2-b1bc-7784-b8a3-fe7eb7f6bd70','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44c2-b1bf-764d-ba08-20f674337b9f','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-1,35000.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44c2-b1d5-738d-b0b5-f7df2c0d374f','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','sale',-1,30000.00,'019d44c2-afed-76b8-b8c7-32cf2449d3fa','Sale 019d44c2-afed-76b8-b8c7-32cf2449d3fa',NULL,'2026-03-31 19:38:23'),('019d44d8-6f72-7224-8841-4ae83dd55270','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d44d8-6f45-747f-904d-36a4e6775d3e','Sale 019d44d8-6f45-747f-904d-36a4e6775d3e',NULL,'2026-03-31 20:02:08'),('019d44d8-6f8b-7249-a960-8555a166acfd','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,'019d44d8-6f45-747f-904d-36a4e6775d3e','Sale 019d44d8-6f45-747f-904d-36a4e6775d3e',NULL,'2026-03-31 20:02:08'),('019d44d8-6f90-7616-974d-680a03d5b3d8','019d3a91-c949-7779-9211-b18b11d4c990','sale',-5,6700.00,'019d44d8-6f45-747f-904d-36a4e6775d3e','Sale 019d44d8-6f45-747f-904d-36a4e6775d3e',NULL,'2026-03-31 20:02:08'),('019d44d8-6f9b-7259-8ec7-ea755f8b94ab','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d44d8-6f45-747f-904d-36a4e6775d3e','Sale 019d44d8-6f45-747f-904d-36a4e6775d3e',NULL,'2026-03-31 20:02:08'),('019d44d8-6fa4-743f-ba89-dc3539ec1861','019d3a91-c7c4-70d5-850b-f88e01eac4fd','sale',-1,4000.00,'019d44d8-6f45-747f-904d-36a4e6775d3e','Sale 019d44d8-6f45-747f-904d-36a4e6775d3e',NULL,'2026-03-31 20:02:08'),('019d44d8-6fab-736d-af55-acb6ab6e8b2e','019d3a91-c7bd-76b0-b874-0088c0dfb1f5','sale',-1,30000.00,'019d44d8-6f45-747f-904d-36a4e6775d3e','Sale 019d44d8-6f45-747f-904d-36a4e6775d3e',NULL,'2026-03-31 20:02:08'),('019d44d8-6fb1-77af-b93a-4745240e5b1b','019d3a91-c79b-735b-878c-112e5e434dac','sale',-3,300000.00,'019d44d8-6f45-747f-904d-36a4e6775d3e','Sale 019d44d8-6f45-747f-904d-36a4e6775d3e',NULL,'2026-03-31 20:02:08'),('019d44e7-3864-750b-9c6d-8a69cf14b7be','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-1,5000.00,'019d44e7-3854-73b4-8471-ce69c4e0aa5e','Sale 019d44e7-3854-73b4-8471-ce69c4e0aa5e',NULL,'2026-03-31 20:18:17'),('019d44e7-38f9-72a8-9f92-dab9cd31a221','019d3a91-c7a8-745d-8a5e-23d9e697de99','sale',-1,5000.00,'019d44e7-3854-73b4-8471-ce69c4e0aa5e','Sale 019d44e7-3854-73b4-8471-ce69c4e0aa5e',NULL,'2026-03-31 20:18:17'),('019d44e7-3931-7198-8649-ed5a763a7843','019d3a91-c79b-735b-878c-112e5e434dac','sale',-5,300000.00,'019d44e7-3854-73b4-8471-ce69c4e0aa5e','Sale 019d44e7-3854-73b4-8471-ce69c4e0aa5e',NULL,'2026-03-31 20:18:17'),('019d44e7-39eb-762e-90fb-b64c9b29ffbd','019d3a91-c79d-765b-8664-6981b65bf605','sale',-1,5000.00,'019d44e7-3854-73b4-8471-ce69c4e0aa5e','Sale 019d44e7-3854-73b4-8471-ce69c4e0aa5e',NULL,'2026-03-31 20:18:17'),('019d44e7-3ac1-7260-8723-b9101c10ea66','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-1,35000.00,'019d44e7-3854-73b4-8471-ce69c4e0aa5e','Sale 019d44e7-3854-73b4-8471-ce69c4e0aa5e',NULL,'2026-03-31 20:18:17'),('019d4515-24d4-777e-8019-1129c6af2898','019d3a91-c7ba-72dd-8a1d-557ddc4210d6','sale',-25,21000.00,'019d4515-24ba-7783-b7ac-8b9b7e94b683','Sale 019d4515-24ba-7783-b7ac-8b9b7e94b683',NULL,'2026-03-31 21:08:26'),('019d4525-5a84-72ce-98e6-cd6eed1d1403','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-24,35000.00,'019d4525-5a5f-7415-a66f-bd660f2eab85','Sale 019d4525-5a5f-7415-a66f-bd660f2eab85',NULL,'2026-03-31 21:26:09'),('019d453c-e7bf-77d6-a322-89ba5b66c839','019d3a91-c7b0-76c9-982e-f664d6f51d21','return',1,NULL,'019d4525-5a5f-7415-a66f-bd660f2eab85','Return from Sale 019d4525-5a5f-7415-a66f-bd660f2eab85: Wrong Item',NULL,'2026-03-31 21:51:52'),('019d4555-0e0b-72a9-81da-801b2d8b6f40','019d3a91-c7b0-76c9-982e-f664d6f51d21','return',1,NULL,'019d4525-5a5f-7415-a66f-bd660f2eab85','Return from Sale 019d4525-5a5f-7415-a66f-bd660f2eab85: Wrong Item',NULL,'2026-03-31 22:18:15'),('019d4573-d39f-714e-875e-9a03c6b13a3d','019d3a91-c7b0-76c9-982e-f664d6f51d21','return',4,NULL,'019d4525-5a5f-7415-a66f-bd660f2eab85','Return from Sale 019d4525-5a5f-7415-a66f-bd660f2eab85: Wrong Item',NULL,'2026-03-31 22:51:51'),('019d45d7-46dc-773c-9279-d82ae3404a7a','019d3a91-c79b-735b-878c-112e5e434dac','sale',-2,300000.00,'019d45d7-46b4-761a-a79e-bbf805b2aa94','Sale 019d45d7-46b4-761a-a79e-bbf805b2aa94',NULL,'2026-04-01 00:40:29'),('019d45d8-fb51-744a-af93-25b1b9b8f4c2','019d3a91-c79b-735b-878c-112e5e434dac','sale',-3,300000.00,'019d45d8-fb48-7114-b351-0952684675a1','Sale 019d45d8-fb48-7114-b351-0952684675a1',NULL,'2026-04-01 00:42:21'),('019d45da-5e92-772f-a52f-ae3513f6c201','019d3a91-c79b-735b-878c-112e5e434dac','return',2,NULL,'019d45d7-46b4-761a-a79e-bbf805b2aa94','Return from Sale 019d45d7-46b4-761a-a79e-bbf805b2aa94: Wrong Item',NULL,'2026-04-01 00:43:52'),('019d45e0-149d-760c-86d2-ae239709d30f','019d3a91-c79b-735b-878c-112e5e434dac','return',1,NULL,'019d45d8-fb48-7114-b351-0952684675a1','Return from Sale 019d45d8-fb48-7114-b351-0952684675a1: Wrong Item',NULL,'2026-04-01 00:50:06'),('019d45e7-5f7a-7090-a994-10734509ecb7','019d3a91-c79b-735b-878c-112e5e434dac','sale',-4,300000.00,'019d45e7-5f78-70be-9e77-9785cd7c44fc','Sale 019d45e7-5f78-70be-9e77-9785cd7c44fc',NULL,'2026-04-01 00:58:04'),('019d45e8-69b8-76bc-871c-5e9c0c384257','019d3a91-c79b-735b-878c-112e5e434dac','return',1,NULL,'019d45e7-5f78-70be-9e77-9785cd7c44fc','Return from Sale 019d45e7-5f78-70be-9e77-9785cd7c44fc: Wrong Item',NULL,'2026-04-01 00:59:12'),('019d4846-bab3-7233-a24f-95af5e8e94b1','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','sale',-16,30000.00,'019d4846-ba38-7490-9788-ed4938d2f413','Sale 019d4846-ba38-7490-9788-ed4938d2f413',NULL,'2026-04-01 12:01:28'),('019d487f-f114-730b-851c-6f915c16c587','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d487f-f0b8-70d8-b57a-1b0edb044f44','Sale 019d487f-f0b8-70d8-b57a-1b0edb044f44',NULL,'2026-04-01 13:03:57'),('019d487f-f136-73dc-8f13-e6b2b8cb288c','019d3a4c-cb8c-724a-bdf6-95052802720d','sale',-1,10000.00,'019d487f-f0b8-70d8-b57a-1b0edb044f44','Sale 019d487f-f0b8-70d8-b57a-1b0edb044f44',NULL,'2026-04-01 13:03:57'),('019d487f-f146-7569-b74e-333839345859','019d3a91-c76b-742c-abca-2650e705af30','sale',-1,150000.00,'019d487f-f0b8-70d8-b57a-1b0edb044f44','Sale 019d487f-f0b8-70d8-b57a-1b0edb044f44',NULL,'2026-04-01 13:03:57'),('019d487f-f152-760d-b8e2-f24654a71297','019d3a91-c762-76a4-9345-839bc164f482','sale',-1,12000.00,'019d487f-f0b8-70d8-b57a-1b0edb044f44','Sale 019d487f-f0b8-70d8-b57a-1b0edb044f44',NULL,'2026-04-01 13:03:57'),('019d48b6-10ad-7548-a9a3-3096ffbbb8b9','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','sale',-7,30000.00,'019d48b6-107d-7319-b3f6-a04556008352','Sale 019d48b6-107d-7319-b3f6-a04556008352',NULL,'2026-04-01 14:03:04'),('019d48dc-9d43-7054-8eb0-923405815c33','019d3a91-c79b-735b-878c-112e5e434dac','sale',-1,300000.00,'019d48dc-9b3a-75b5-b97d-9a6912e67a0f','Sale 019d48dc-9b3a-75b5-b97d-9a6912e67a0f',NULL,'2026-04-01 14:45:11'),('019d4911-7c79-7338-9419-5da5e0d93ba0','019d3a91-c79b-735b-878c-112e5e434dac','sale',-1,300000.00,'019d4911-7c03-76b0-92da-a31ba91b3045','Sale 019d4911-7c03-76b0-92da-a31ba91b3045',NULL,'2026-04-01 15:42:56'),('019d49a4-37e1-7664-9198-6d11719712e0','019d3a91-c79b-735b-878c-112e5e434dac','return',1,NULL,'019d4911-7c03-76b0-92da-a31ba91b3045','Return from Sale 019d4911-7c03-76b0-92da-a31ba91b3045: Wrong Item',NULL,'2026-04-01 00:00:00'),('019d49ac-2afa-7618-b22b-ed019325da92','019d3a91-c79b-735b-878c-112e5e434dac','return',1,NULL,'019d48dc-9b3a-75b5-b97d-9a6912e67a0f','Return from Sale 019d48dc-9b3a-75b5-b97d-9a6912e67a0f: Wrong Item',NULL,'2026-04-01 18:31:52'),('019d4ad3-fe0a-7312-aa95-0fdac3d0be35','019d3a91-c79b-735b-878c-112e5e434dac','sale',-1,300000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad3-fe90-746d-8389-8d1124bbd575','019d3a91-c7ba-72dd-8a1d-557ddc4210d6','sale',-1,21000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad3-feba-7089-8a93-9334dd7055d6','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','sale',-1,30000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad3-fee5-76fd-8358-d3afb82da701','019d3a91-c7b0-76c9-982e-f664d6f51d21','sale',-1,35000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad3-ff2f-7188-bccf-8043270b5006','019d3a91-c7bd-76b0-b874-0088c0dfb1f5','sale',-1,30000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad3-ff51-72e9-8f7d-a2d5a6d6ef01','019d3a91-c7c4-70d5-850b-f88e01eac4fd','sale',-1,4000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad3-ff61-75ff-9f87-b8654ecb9384','019d3a91-c79d-765b-8664-6981b65bf605','sale',-1,5000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad3-fff7-76ac-b326-05d2cd13c738','019d3a91-c799-716b-b470-3994917c8bc5','sale',-1,18000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad4-002c-74cd-a384-fd609dfa8406','019d3a91-c777-73ad-a297-eedcb4fdbcfb','sale',-1,13000.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4ad4-0040-75bf-8d6c-474ea2b36758','019d3a91-c7ab-776c-91c2-883d71d73b02','sale',-1,4500.00,'019d4ad3-fd3b-700c-a1ef-12b816d525cc','Sale 019d4ad3-fd3b-700c-a1ef-12b816d525cc',NULL,'2026-04-01 23:55:00'),('019d4adb-f6ef-7687-a308-f8ba48cbf306','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-3,5000.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4adb-f6f2-70cb-9083-b69eb30a0856','019d3a91-c8f2-7467-a3a4-63180b798fd5','sale',-1,3500.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4adb-f6f7-744e-88f3-1c3024b579de','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','sale',-1,30000.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4adb-f6f9-7298-b283-73108b2f84a1','019d3a91-c72a-7729-b89d-1ec673333032','sale',-1,35000.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4adb-f6fb-76ec-8f28-cfc84e0fc401','019d3a91-c76b-742c-abca-2650e705af30','sale',-1,150000.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4adb-f707-7268-9cd9-944a37a8924f','019d3a91-c771-7548-9997-f0ec78224506','sale',-1,20000.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4adb-f70b-7458-b51e-f7da7c889a62','019d3a91-c777-73ad-a297-eedcb4fdbcfb','sale',-1,13000.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4adb-f71a-77d9-910f-f8785a4175a1','019d3a91-c799-716b-b470-3994917c8bc5','sale',-1,18000.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4adb-f723-748b-a7d8-900fe9687c37','019d3a91-c789-719f-b789-065a0576fa9f','sale',-1,6000.00,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8',NULL,'2026-04-02 00:03:42'),('019d4add-b926-77ce-aee2-178d164c4d67','019d3a91-c8c2-7404-b028-92692d6192c1','sale',-4,5000.00,'019d4add-b905-7368-a9da-72aab631e263','Sale 019d4add-b905-7368-a9da-72aab631e263',NULL,'2026-04-02 00:05:38'),('019d4adf-e126-77a9-bb02-dd67236f5613','019d3a91-c7ad-74d9-9621-1b2d7a4608fc','return',1,NULL,'019d4adb-f629-7189-b3dc-d23d05db1fc8','Return from Sale 019d4adb-f629-7189-b3dc-d23d05db1fc8: Wrong Item',NULL,'2026-04-02 00:07:59'),('019d4b22-b45f-76f5-b7df-b6cbe6581925','019d3a91-c7c0-757e-97f8-4e2fe314e867','sale',-1,3000.00,'019d4b22-b335-7697-b9c9-d5e798dee8c9','Sale 019d4b22-b335-7697-b9c9-d5e798dee8c9',NULL,'2026-04-02 01:20:58'),('019d4b63-5ce9-711d-8429-43a64e5f56a6','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','sale',-1,30000.00,'019d4b63-5c81-7619-b380-1e7b7e29cebb','Sale 019d4b63-5c81-7619-b380-1e7b7e29cebb',NULL,'2026-04-02 02:31:36'),('019d4b6e-3d0b-764f-bae5-4a55df68655f','019d3a91-c96d-75a9-a970-b261467e63b4','sale',-1,2000.00,'019d4b6e-3c81-731d-bac3-26a5562946c0','Sale 019d4b6e-3c81-731d-bac3-26a5562946c0',NULL,'2026-04-02 02:43:29'),('019d4b72-a35e-7363-8929-8621c9c68575','019d3a91-c772-7655-8b1d-1caa882d2c09','sale',-1,12000.00,'019d4b72-a2d5-719b-8cd8-7ccfbdb1dacf','Sale 019d4b72-a2d5-719b-8cd8-7ccfbdb1dacf',NULL,'2026-04-02 02:48:17'),('019d4b75-129b-70fa-9975-c15597c9186d','019d3a39-f81a-709e-a3f7-1fcb918cbf6c','purchase',15,30000.00,NULL,'PO: HIMA CEMENT',NULL,'2026-04-02 02:50:56');
/*!40000 ALTER TABLE `inventory_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_records`
--

DROP TABLE IF EXISTS `payroll_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `period_month` tinyint(4) NOT NULL,
  `period_year` smallint(6) NOT NULL,
  `gross_salary` decimal(10,2) NOT NULL,
  `tax_deductions` decimal(10,2) DEFAULT 0.00,
  `net_salary` decimal(10,2) NOT NULL,
  `processed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_records`
--

LOCK TABLES `payroll_records` WRITE;
/*!40000 ALTER TABLE `payroll_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `min_stock` int(11) NOT NULL DEFAULT 5,
  `unit` varchar(50) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `supplier_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_supplier` (`supplier_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('019d3a39-f81a-709e-a3f7-1fcb918cbf6c','HIMA CEMENT WATER GRADE','CEMENT_AND_AGGREGATES',35000.00,30000.00,15,5,'BAGS','123323242498475','019d3a16-dff2-7359-989e-933535656b13','2026-03-29 18:32:50','2026-04-02 02:50:56'),('019d3a4c-cb8c-724a-bdf6-95052802720d','HAMMER','TOOLS_AND_EQUIPMENT',15000.00,10000.00,24,15,'PCS','23535353546463','019d3a16-dff2-7359-989e-933535656b13','2026-03-29 18:53:24','2026-04-01 13:03:57'),('019d3a91-c96d-75a9-a970-b261467e63b4','Glue & Adhesives','STEEL_AND_METAL',6000.00,2000.00,58,5,'PCS','SKU-2025','019d3ab3-a004-712c-a181-148323e9e8b0','2026-03-29 20:08:46','2026-04-02 02:43:29'),('019d3a91-c949-7779-9211-b18b11d4c990','Hinges & Handles','TOOLS_AND_EQUIPMENT',9000.00,6700.00,23,5,'PCS','SKU-2024','019d3ab3-a003-74c8-b36a-00ba380747ba','2026-03-29 20:08:46','2026-03-31 20:02:08'),('019d3a91-c8f2-7467-a3a4-63180b798fd5','Nuts','TOOLS_AND_EQUIPMENT',6000.00,3500.00,76,5,'PCS','SKU-2023','019d3ab3-a005-759c-81d0-d71eaac5a8e5','2026-03-29 20:08:45','2026-04-02 00:03:42'),('019d3a91-c8c2-7404-b028-92692d6192c1','Bolts','CEMENT_AND_AGGREGATES',8000.00,5000.00,15,5,'PCS','SKU-2022','019d3ab3-a005-759c-81d0-d71eaac5a8e5','2026-03-29 20:08:45','2026-04-02 00:05:38'),('019d3a91-c7c4-70d5-850b-f88e01eac4fd','Screws','TOOLS_AND_EQUIPMENT',6000.00,4000.00,48,5,'PCS','SKU-2021','019d3ab3-a005-759c-81d0-d71eaac5a8e5','2026-03-29 20:08:45','2026-04-01 23:55:00'),('019d3a91-c7c0-757e-97f8-4e2fe314e867','Nails 3 INCH','STEEL_AND_METAL',5000.00,3000.00,67,5,'BAGS','SKU-2020','019d3ab3-a005-759c-81d0-d25fa67731f1','2026-03-29 20:08:45','2026-04-02 01:20:58'),('019d3a91-c7bd-76b0-b874-0088c0dfb1f5','Ladders & Scaffolding','TOOLS_AND_EQUIPMENT',60000.00,30000.00,29,5,'PCS','SKU-2019','019d3ab3-a007-702e-907e-6758a2867280','2026-03-29 20:08:45','2026-04-01 23:55:00'),('019d3a91-c7ba-72dd-8a1d-557ddc4210d6','Concrete slabs','CEMENT_AND_AGGREGATES',35000.00,21000.00,46,5,'PCS','SKU-2016','019d3ab3-a008-72ea-ae14-e850e119290c','2026-03-29 20:08:45','2026-04-01 23:55:00'),('019d3a91-c7b0-76c9-982e-f664d6f51d21','Floor tiles','PLUMBING_AND_FITTINGS',50000.00,35000.00,43,5,'BOX','SKU-2015','019d3ab3-a001-703c-96a1-a8ded4086d23','2026-03-29 20:08:45','2026-04-01 23:55:00'),('019d3a91-c7ad-74d9-9621-1b2d7a4608fc','Roofing sheet','STEEL_AND_METAL',40000.00,30000.00,26,5,'PCS','SKU-2014','019d3ab3-a000-709f-b5ba-774f6b1b5cc0','2026-03-29 20:08:45','2026-04-02 00:07:59'),('019d3a91-c7ab-776c-91c2-883d71d73b02','Circuit Breakers & Panels','ELECTRICAL_COMPONENTS',10000.00,4500.00,10,5,'PCS','SKU-2013','019d3ab3-a008-72ea-ae14-eda8b3e8c08b','2026-03-29 20:08:45','2026-04-01 23:55:00'),('019d3a91-c7a8-745d-8a5e-23d9e697de99','Switches & Sockets','ELECTRICAL_COMPONENTS',10500.00,5000.00,33,5,'PCS','SKU-2012','019d3ab3-a00b-774c-8050-b2eb1b522697','2026-03-29 20:08:45','2026-03-31 20:18:17'),('019d3a91-c79d-765b-8664-6981b65bf605','Cables & Wires','ELECTRICAL_COMPONENTS',10000.00,5000.00,54,5,'MTRS','SKU-2011','019d3ab3-a008-72ea-ae14-eda8b3e8c08b','2026-03-29 20:08:45','2026-04-01 23:55:00'),('019d3a91-c79b-735b-878c-112e5e434dac','Water Tanks 1000 L','STEEL_AND_METAL',350000.00,300000.00,53,5,'PCS','SKU-2010','019d3ab3-a00a-747f-8cbe-e42ef98831e3','2026-03-29 20:08:45','2026-04-01 23:55:00'),('019d3a91-c799-716b-b470-3994917c8bc5','Valves & Taps','PLUMBING_AND_FITTINGS',25000.00,18000.00,41,5,'PCS','SKU-2009','019d3ab3-a00a-747f-8cbe-e42ef98831e3','2026-03-29 20:08:45','2026-04-02 00:03:42'),('019d3a91-c789-719f-b789-065a0576fa9f','Pipes & Fittings','PLUMBING_AND_FITTINGS',15000.00,6000.00,20,5,'PCS','SKU-2008','019d3ab3-a002-74e6-9dee-17f80aa10c50','2026-03-29 20:08:45','2026-04-02 00:03:42'),('019d3a91-c777-73ad-a297-eedcb4fdbcfb','MDF / Particle board','PLUMBING_AND_FITTINGS',18000.00,13000.00,74,5,'PCS','SKU-2007','019d3ab3-a009-7048-81fc-9b4246457afa','2026-03-29 20:08:45','2026-04-02 00:03:42'),('019d3a91-c772-7655-8b1d-1caa882d2c09','Plywood','TOOLS_AND_EQUIPMENT',15000.00,12000.00,148,5,'PCS','SKU-2006','019d3ab3-a002-74e6-9dee-11591d652a05','2026-03-29 20:08:45','2026-04-02 02:48:17'),('019d3a91-c771-7548-9997-f0ec78224506','Lumber / Planks','STEEL_AND_METAL',35000.00,20000.00,77,5,'PCS','SKU-2005','019d3ab3-a008-72ea-ae14-eda8b3e8c08b','2026-03-29 20:08:45','2026-04-02 00:03:42'),('019d3a91-c76f-77fb-aa49-8dc5aaac916f','Steel rods & Bars','STEEL_AND_METAL',50000.00,45000.00,43,5,'ROLLS','SKU-2004','019d3ab3-a007-702e-907e-6758a2867280','2026-03-29 20:08:45','2026-03-30 11:21:24'),('019d3a91-c76b-742c-abca-2650e705af30','Sand & Gravel','CEMENT_AND_AGGREGATES',200000.00,150000.00,29,5,'KG','SKU-2003','019d3ab3-a008-72ea-ae14-e850e119290c','2026-03-29 20:08:45','2026-04-02 00:03:42'),('019d3a91-c762-76a4-9345-839bc164f482','Steel Bar 12mm','STEEL_AND_METAL',15000.00,12000.00,97,5,'ROLLS','SKU-2002','019d3ab3-a000-709f-b5ba-774f6b1b5cc0','2026-03-29 20:08:45','2026-04-01 13:03:57'),('019d3a91-c72a-7729-b89d-1ec673333032','Bricks','CEMENT_AND_AGGREGATES',38000.00,35000.00,48,5,'PCS','SKU-1001','019d3ab3-a003-74c8-b36a-00ba380747ba','2026-03-29 20:08:45','2026-04-02 00:03:42');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `value` decimal(15,2) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `product_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_ids`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES ('019d490e-e1b8-718a-892f-a1bed56dd10b','WATER TANKS 1000L FLASH SALE','percentage',5.00,'2026-04-01 15:40:05','2026-04-01 17:40:05',1,'[\"019d3a91-c79b-735b-878c-112e5e434dac\"]','2026-04-01 15:40:05','2026-04-01 16:40:01'),('019d490f-b757-77f8-bcfb-b55c5f8e4456','Concrete slabs FLASH SALE','percentage',10.00,'2026-04-01 16:00:00','2026-04-02 16:00:00',1,'[\"019d3a91-c7ba-72dd-8a1d-557ddc4210d6\"]','2026-04-01 15:41:00',NULL);
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('019d39f9-9aab-7489-838c-0d266af5bdbd','CASHIER','MANAGES FINANCES','2026-03-29 14:22:32'),('019d39f9-e6cd-777d-9092-a131cfaaf1df','CASUAL','NORMAL EMPLOYEES','2026-03-29 14:22:52'),('019d39fa-2f97-77f2-b6e8-d95fb064dc9f','ADMIN','CENTRAL OPERATOR','2026-03-29 14:23:10');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` varchar(36) NOT NULL,
  `sale_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sale` (`sale_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES ('019d3b04-b23e-71fd-b082-f7109066ade5','019d3b04-b223-77aa-8961-45286a8fcf73','019d3a91-c949-7779-9211-b18b11d4c990',1,9000.00,6700.00),('019d3b06-e59d-71c9-9ecc-f305648ae640','019d3b06-e591-70cd-800a-beb9c473e9c3','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d3b06-e5cf-75f3-bd64-f7b224155a07','019d3b06-e591-70cd-800a-beb9c473e9c3','019d3a91-c8c2-7404-b028-92692d6192c1',1,8000.00,5000.00),('019d3b0d-b032-77e9-bcb2-279ff0475420','019d3b0d-aff4-75aa-ba09-19748b3c257b','019d3a91-c8f2-7467-a3a4-63180b798fd5',3,6000.00,3500.00),('019d3b1d-64a5-77bb-804c-51e9b757f179','019d3b1d-6479-76ca-affb-be95127ee8cc','019d3a91-c96d-75a9-a970-b261467e63b4',1,6000.00,2000.00),('019d3b1d-64cb-770f-88e8-0113b282a856','019d3b1d-6479-76ca-affb-be95127ee8cc','019d3a91-c7c4-70d5-850b-f88e01eac4fd',1,6000.00,4000.00),('019d3b1d-64d6-70ac-922c-9845fdc33edf','019d3b1d-6479-76ca-affb-be95127ee8cc','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d3b22-507a-74a2-83f7-a880cb3c3e9f','019d3b22-506e-73de-8a5b-c6fb5907208e','019d3a91-c76f-77fb-aa49-8dc5aaac916f',2,50000.00,45000.00),('019d3b25-0c1f-70ec-84f9-a58efd343366','019d3b25-0c0a-75b8-87c7-66a6fdbd6bc0','019d3a4c-cb8c-724a-bdf6-95052802720d',1,15000.00,10000.00),('019d3b25-0c30-740e-a896-2ece47658ff0','019d3b25-0c0a-75b8-87c7-66a6fdbd6bc0','019d3a91-c72a-7729-b89d-1ec673333032',1,38000.00,35000.00),('019d3b2b-1bfd-74af-a640-98d1075ba8ff','019d3b2b-1bc3-757c-8c57-035a70301c1d','019d3a91-c76b-742c-abca-2650e705af30',1,200000.00,150000.00),('019d3b2b-1c0f-713f-9c5f-64118c8c4e71','019d3b2b-1bc3-757c-8c57-035a70301c1d','019d3a91-c72a-7729-b89d-1ec673333032',1,38000.00,35000.00),('019d3b2e-225d-721d-93d4-15fc0b9c6f50','019d3b2e-2249-74cb-8a9e-a84feee06778','019d3a91-c762-76a4-9345-839bc164f482',2,15000.00,12000.00),('019d3bc9-ad9d-75eb-81f8-f2456d7fc5c0','019d3bc9-ad16-7572-ac55-65f9ddddaa2c','019d3a91-c7bd-76b0-b874-0088c0dfb1f5',1,60000.00,30000.00),('019d3bc9-adc9-719d-a002-f851a8accc1b','019d3bc9-ad16-7572-ac55-65f9ddddaa2c','019d3a91-c96d-75a9-a970-b261467e63b4',1,6000.00,2000.00),('019d3bd4-5f7f-73ca-af7f-6cdedd6f082f','019d3bd4-5f61-77bd-af2f-c44f4d4f422a','019d3a91-c7b0-76c9-982e-f664d6f51d21',2,50000.00,35000.00),('019d3bd4-5f90-72c9-9882-86cb378521c3','019d3bd4-5f61-77bd-af2f-c44f4d4f422a','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',1,40000.00,30000.00),('019d3bd7-0fcb-747e-8a76-23204573e98c','019d3bd7-0fbc-745f-b07f-088bb2df81ba','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d3bd7-0fef-733c-a418-0df24d7d2f38','019d3bd7-0fd6-71e9-bd29-d05120d397a7','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d3bd7-0ff8-7369-90ed-f239d12bf7bc','019d3bd7-0fbc-745f-b07f-088bb2df81ba','019d3a91-c8c2-7404-b028-92692d6192c1',1,8000.00,5000.00),('019d3bd7-0fff-766d-98a2-0f29b7882d5f','019d3bd7-0fd6-71e9-bd29-d05120d397a7','019d3a91-c8c2-7404-b028-92692d6192c1',1,8000.00,5000.00),('019d3bd7-1007-71ac-8970-b0cecb627a86','019d3bd7-0fbc-745f-b07f-088bb2df81ba','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d3bd7-100c-70ea-b070-532cbb263c9f','019d3bd7-0fd6-71e9-bd29-d05120d397a7','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d3bdc-dbe1-747d-9ddb-6f3ae3017f2c','019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d3bdc-dbfa-744f-b132-d0341923f1d2','019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','019d3a91-c96d-75a9-a970-b261467e63b4',1,6000.00,2000.00),('019d3bdc-dc01-7144-aeeb-45be4cb3c9f2','019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','019d3a91-c949-7779-9211-b18b11d4c990',1,9000.00,6700.00),('019d3bdc-dc10-771b-a024-b28a43f3fb57','019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','019d3a91-c7b0-76c9-982e-f664d6f51d21',1,50000.00,35000.00),('019d3bdc-dc1c-73fd-8593-79e0b6afcd3b','019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',1,40000.00,30000.00),('019d3bdf-8d45-70ff-8d7c-9269e667ce1c','019d3bdf-8ced-77a9-8f81-011ee1580149','019d3a91-c7c0-757e-97f8-4e2fe314e867',3,5000.00,3000.00),('019d3bdf-8d7d-74bd-a1d2-91d9dca71d07','019d3bdf-8d6c-7792-9d09-7eccc06da7b8','019d3a91-c7c0-757e-97f8-4e2fe314e867',3,5000.00,3000.00),('019d3bdf-8ef2-7167-98dc-0a54aa709d60','019d3bdf-8ea0-77cd-afe0-a957c2850182','019d3a91-c7c0-757e-97f8-4e2fe314e867',3,5000.00,3000.00),('019d3be3-a72d-767a-8f59-4b48a2a09b95','019d3be3-a728-7197-a707-efcb5ba9306f','019d3a91-c949-7779-9211-b18b11d4c990',1,9000.00,6700.00),('019d3be3-a73b-70f6-a98c-630e304251ce','019d3be3-a728-7197-a707-efcb5ba9306f','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d3be3-a741-7017-b82f-61b61b5d2d99','019d3be3-a728-7197-a707-efcb5ba9306f','019d3a91-c7ba-72dd-8a1d-557ddc4210d6',1,35000.00,21000.00),('019d3be3-a74a-758d-8274-c6a6e2dfb7b4','019d3be3-a728-7197-a707-efcb5ba9306f','019d3a91-c7ab-776c-91c2-883d71d73b02',1,10000.00,4500.00),('019d3e03-3d94-72df-99dd-38a07db5e346','019d3e03-3d44-7730-8c49-c2d6047ae655','019d3a39-f81a-709e-a3f7-1fcb918cbf6c',2,35000.00,30000.00),('019d3e5e-ecd1-71de-bcfa-ddeecab05bb4','019d3e5e-ec6c-75da-ad47-8a3f10bdacf4','019d3a91-c949-7779-9211-b18b11d4c990',1,9000.00,6700.00),('019d3e5e-ed30-715a-b507-488caaad1204','019d3e5e-ec6c-75da-ad47-8a3f10bdacf4','019d3a91-c8c2-7404-b028-92692d6192c1',1,8000.00,5000.00),('019d3e69-6dbe-745c-9cfb-96ac707a1bc1','019d3e69-6d8e-74b5-a195-e5eb8dbf068e','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d3e69-6e00-73e8-a79f-6d48703a0d04','019d3e69-6d8e-74b5-a195-e5eb8dbf068e','019d3a91-c7ba-72dd-8a1d-557ddc4210d6',1,35000.00,21000.00),('019d3e6a-deec-776d-b3c5-aafd66552349','019d3e6a-de84-76ec-86a9-5d2ce4b16e76','019d3a91-c79b-735b-878c-112e5e434dac',2,350000.00,300000.00),('019d3e84-11a1-75cc-a574-f79faefe4ba4','019d3e84-1175-7069-a49d-5e1e268cd773','019d3a91-c8c2-7404-b028-92692d6192c1',2,8000.00,5000.00),('019d3e84-11d1-770f-adf3-8813ecb34ff0','019d3e84-1175-7069-a49d-5e1e268cd773','019d3a91-c7ba-72dd-8a1d-557ddc4210d6',1,35000.00,21000.00),('019d3e84-11e8-73af-b9a8-6d1eea419b5a','019d3e84-1175-7069-a49d-5e1e268cd773','019d3a91-c79b-735b-878c-112e5e434dac',1,350000.00,300000.00),('019d3e84-6f71-754a-81ea-ed616d7fc398','019d3e84-6f40-730b-9383-10621c406d31','019d3a91-c79b-735b-878c-112e5e434dac',1,350000.00,300000.00),('019d3e9a-6884-76f9-9d4c-5daec57dbaf5','019d3e9a-686e-71f6-965e-39a128f82f64','019d3a91-c8c2-7404-b028-92692d6192c1',2,8000.00,5000.00),('019d3eaa-6630-779d-910d-b9a2a0790985','019d3eaa-65db-724b-abf4-c8ab65332cdb','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',1,40000.00,30000.00),('019d3eaa-6664-721c-a677-038d77f698d2','019d3eaa-65db-724b-abf4-c8ab65332cdb','019d3a91-c7c4-70d5-850b-f88e01eac4fd',1,6000.00,4000.00),('019d3eb8-bb64-74ff-aff7-e1d946cdc502','019d3eb8-baf1-7588-890a-d87e401fe475','019d3a91-c8c2-7404-b028-92692d6192c1',1,8000.00,5000.00),('019d3eb8-bb87-74aa-840a-40e38cabd47c','019d3eb8-baf1-7588-890a-d87e401fe475','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d3eca-0060-7119-9a6d-cb592c868487','019d3eca-0022-706c-a8f3-03e5c7214190','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d3eca-007d-707a-9487-789b5115c123','019d3eca-0022-706c-a8f3-03e5c7214190','019d3a91-c7c4-70d5-850b-f88e01eac4fd',1,6000.00,4000.00),('019d3ed1-4801-731b-a048-32a5516f76a6','019d3ed1-47e2-740f-8344-3d2b43b5f770','019d3a91-c7b0-76c9-982e-f664d6f51d21',2,50000.00,35000.00),('019d3f63-c320-75ef-99ee-07c5ba30cd37','019d3f63-c308-745c-a41b-4ac621240cb9','019d3a91-c8c2-7404-b028-92692d6192c1',1,8000.00,5000.00),('019d3f63-c331-72cc-96e3-8ebb9bcef853','019d3f63-c308-745c-a41b-4ac621240cb9','019d3a91-c79b-735b-878c-112e5e434dac',4,350000.00,300000.00),('019d3f63-c33a-7351-bf11-34465f49237f','019d3f63-c308-745c-a41b-4ac621240cb9','019d3a91-c7b0-76c9-982e-f664d6f51d21',1,50000.00,35000.00),('019d3f63-c340-7064-a19a-a68ae6e4ba77','019d3f63-c308-745c-a41b-4ac621240cb9','019d3a91-c7bd-76b0-b874-0088c0dfb1f5',1,60000.00,30000.00),('019d3f67-1c15-778b-a0c0-8aa8f7621657','019d3f67-1bcb-73fb-b9d2-5aa733d49468','019d3a91-c7c0-757e-97f8-4e2fe314e867',7,5000.00,3000.00),('019d3f67-1c63-7081-bde8-e6ed4d18457b','019d3f67-1bcb-73fb-b9d2-5aa733d49468','019d3a91-c79b-735b-878c-112e5e434dac',17,350000.00,300000.00),('019d3f70-545f-7538-aa51-0151df9384c7','019d3f70-5420-738a-9e02-79a4432fa279','019d3a39-f81a-709e-a3f7-1fcb918cbf6c',6,35000.00,30000.00),('019d3fd9-cab5-7041-a69c-d982b114f33c','019d3fd9-c810-76c7-8e16-0370fffdc556','019d3a91-c96d-75a9-a970-b261467e63b4',1,6000.00,2000.00),('019d3fd9-cb3f-7579-9c27-75129d805991','019d3fd9-c810-76c7-8e16-0370fffdc556','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d43ad-8dda-74c5-a709-dbe390b159a4','019d43ad-8d65-773c-8c75-8e77ae624fa8','019d3a91-c79b-735b-878c-112e5e434dac',5,350000.00,300000.00),('019d43ad-8e09-72f3-b728-f419d23c7588','019d43ad-8d65-773c-8c75-8e77ae624fa8','019d3a91-c7b0-76c9-982e-f664d6f51d21',6,50000.00,35000.00),('019d44c2-b053-71eb-84b8-f1e41b87a427','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c96d-75a9-a970-b261467e63b4',4,6000.00,2000.00),('019d44c2-b075-73c9-b566-27034c97e142','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c949-7779-9211-b18b11d4c990',1,9000.00,6700.00),('019d44c2-b0ba-74cf-b54b-1ccee53e5a1b','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d44c2-b0c9-74b9-8910-4406d4426a50','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c7c4-70d5-850b-f88e01eac4fd',1,6000.00,4000.00),('019d44c2-b0dd-733b-a657-a81c557b2718','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c7bd-76b0-b874-0088c0dfb1f5',1,60000.00,30000.00),('019d44c2-b1b9-76bb-a87a-b50648e86528','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c7ba-72dd-8a1d-557ddc4210d6',1,35000.00,21000.00),('019d44c2-b1bc-7784-b8a3-f9bdc1208bfd','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d44c2-b1bf-764d-ba08-1db319cdb6df','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c7b0-76c9-982e-f664d6f51d21',1,50000.00,35000.00),('019d44c2-b1d5-738d-b0b5-f1b8409e21b4','019d44c2-afed-76b8-b8c7-32cf2449d3fa','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',1,40000.00,30000.00),('019d44d8-6f72-7224-8841-4790ecd0a614','019d44d8-6f45-747f-904d-36a4e6775d3e','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d44d8-6f8b-7249-a960-817e9f427628','019d44d8-6f45-747f-904d-36a4e6775d3e','019d3a91-c8c2-7404-b028-92692d6192c1',1,8000.00,5000.00),('019d44d8-6f90-7616-974d-65802042217c','019d44d8-6f45-747f-904d-36a4e6775d3e','019d3a91-c949-7779-9211-b18b11d4c990',5,9000.00,6700.00),('019d44d8-6f9a-7418-8321-c1c19b9ca9d9','019d44d8-6f45-747f-904d-36a4e6775d3e','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d44d8-6fa4-743f-ba89-d9bd5ec1537d','019d44d8-6f45-747f-904d-36a4e6775d3e','019d3a91-c7c4-70d5-850b-f88e01eac4fd',1,6000.00,4000.00),('019d44d8-6fab-736d-af55-aa7f7d81098b','019d44d8-6f45-747f-904d-36a4e6775d3e','019d3a91-c7bd-76b0-b874-0088c0dfb1f5',1,60000.00,30000.00),('019d44d8-6fb1-77af-b93a-4136f0afc990','019d44d8-6f45-747f-904d-36a4e6775d3e','019d3a91-c79b-735b-878c-112e5e434dac',3,350000.00,300000.00),('019d44e7-3863-77ce-901a-0863b79b7620','019d44e7-3854-73b4-8471-ce69c4e0aa5e','019d3a91-c8c2-7404-b028-92692d6192c1',1,8000.00,5000.00),('019d44e7-38f9-72a8-9f92-d759b726ae3f','019d44e7-3854-73b4-8471-ce69c4e0aa5e','019d3a91-c7a8-745d-8a5e-23d9e697de99',1,10500.00,5000.00),('019d44e7-3931-7198-8649-e9f6f3ff4554','019d44e7-3854-73b4-8471-ce69c4e0aa5e','019d3a91-c79b-735b-878c-112e5e434dac',5,350000.00,300000.00),('019d44e7-39eb-762e-90fb-b3d8041af62e','019d44e7-3854-73b4-8471-ce69c4e0aa5e','019d3a91-c79d-765b-8664-6981b65bf605',1,10000.00,5000.00),('019d44e7-3ac1-7260-8723-b743dd446aba','019d44e7-3854-73b4-8471-ce69c4e0aa5e','019d3a91-c7b0-76c9-982e-f664d6f51d21',1,50000.00,35000.00),('019d4515-24d4-777e-8019-0ef1f098f268','019d4515-24ba-7783-b7ac-8b9b7e94b683','019d3a91-c7ba-72dd-8a1d-557ddc4210d6',25,35000.00,NULL),('019d4525-5a83-707c-8d19-2a20ac2c24d2','019d4525-5a5f-7415-a66f-bd660f2eab85','019d3a91-c7b0-76c9-982e-f664d6f51d21',24,50000.00,NULL),('019d45d7-46dc-773c-9279-d42c291b24a9','019d45d7-46b4-761a-a79e-bbf805b2aa94','019d3a91-c79b-735b-878c-112e5e434dac',2,350000.00,300000.00),('019d45d8-fb51-744a-af93-236cc1db6853','019d45d8-fb48-7114-b351-0952684675a1','019d3a91-c79b-735b-878c-112e5e434dac',3,350000.00,300000.00),('019d45e7-5f7a-7090-a994-0f105298df30','019d45e7-5f78-70be-9e77-9785cd7c44fc','019d3a91-c79b-735b-878c-112e5e434dac',4,350000.00,300000.00),('019d4846-bab3-7233-a24f-91d743749835','019d4846-ba38-7490-9788-ed4938d2f413','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',16,40000.00,30000.00),('019d487f-f114-730b-851c-6af7511369ff','019d487f-f0b8-70d8-b57a-1b0edb044f44','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d487f-f136-73dc-8f13-e391b8589623','019d487f-f0b8-70d8-b57a-1b0edb044f44','019d3a4c-cb8c-724a-bdf6-95052802720d',1,15000.00,10000.00),('019d487f-f146-7569-b74e-2c19cb617410','019d487f-f0b8-70d8-b57a-1b0edb044f44','019d3a91-c76b-742c-abca-2650e705af30',1,200000.00,150000.00),('019d487f-f152-760d-b8e2-ee7258c038e9','019d487f-f0b8-70d8-b57a-1b0edb044f44','019d3a91-c762-76a4-9345-839bc164f482',1,15000.00,12000.00),('019d48b6-10ad-7548-a9a3-2e160badb090','019d48b6-107d-7319-b3f6-a04556008352','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',7,40000.00,30000.00),('019d48dc-9d43-7054-8eb0-8de2b1ab2063','019d48dc-9b3a-75b5-b97d-9a6912e67a0f','019d3a91-c79b-735b-878c-112e5e434dac',1,350000.00,300000.00),('019d4911-7c79-7338-9419-589f58d73005','019d4911-7c03-76b0-92da-a31ba91b3045','019d3a91-c79b-735b-878c-112e5e434dac',1,350000.00,300000.00),('019d4ad3-fe0a-7312-aa95-0ac65ba5825a','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c79b-735b-878c-112e5e434dac',1,350000.00,300000.00),('019d4ad3-fe90-746d-8389-88ba0ebb7ac4','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c7ba-72dd-8a1d-557ddc4210d6',1,35000.00,21000.00),('019d4ad3-feba-7089-8a93-8db36f7c7590','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',1,40000.00,30000.00),('019d4ad3-fee5-76fd-8358-ce4af14c3a09','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c7b0-76c9-982e-f664d6f51d21',1,50000.00,35000.00),('019d4ad3-ff2f-7188-bccf-7eea68133fb6','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c7bd-76b0-b874-0088c0dfb1f5',1,60000.00,30000.00),('019d4ad3-ff51-72e9-8f7d-9f097856c714','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c7c4-70d5-850b-f88e01eac4fd',1,6000.00,4000.00),('019d4ad3-ff61-75ff-9f87-b4cec5a80d4c','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c79d-765b-8664-6981b65bf605',1,10000.00,5000.00),('019d4ad3-fff7-76ac-b326-02ebb721a365','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c799-716b-b470-3994917c8bc5',1,25000.00,18000.00),('019d4ad4-002c-74cd-a384-fb0f26e5cea1','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c777-73ad-a297-eedcb4fdbcfb',1,18000.00,13000.00),('019d4ad4-0040-75bf-8d6c-42aac54c2496','019d4ad3-fd3b-700c-a1ef-12b816d525cc','019d3a91-c7ab-776c-91c2-883d71d73b02',1,10000.00,4500.00),('019d4adb-f6ef-7687-a308-f4b162096acc','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c8c2-7404-b028-92692d6192c1',3,8000.00,5000.00),('019d4adb-f6f2-70cb-9083-b13d6f6d2226','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c8f2-7467-a3a4-63180b798fd5',1,6000.00,3500.00),('019d4adb-f6f7-744e-88f3-1a7213033fa1','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',1,40000.00,30000.00),('019d4adb-f6f9-7298-b283-6fc0a775d0be','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c72a-7729-b89d-1ec673333032',1,38000.00,35000.00),('019d4adb-f6fb-76ec-8f28-cb5c4a392cb9','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c76b-742c-abca-2650e705af30',1,200000.00,150000.00),('019d4adb-f707-7268-9cd9-9229c1fd0e8d','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c771-7548-9997-f0ec78224506',1,35000.00,20000.00),('019d4adb-f70b-7458-b51e-f38c207b6412','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c777-73ad-a297-eedcb4fdbcfb',1,18000.00,13000.00),('019d4adb-f71a-77d9-910f-f6644f05cda1','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c799-716b-b470-3994917c8bc5',1,25000.00,18000.00),('019d4adb-f723-748b-a7d8-8dcec4319256','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c789-719f-b789-065a0576fa9f',1,15000.00,6000.00),('019d4add-b926-77ce-aee2-13bf729d47dc','019d4add-b905-7368-a9da-72aab631e263','019d3a91-c8c2-7404-b028-92692d6192c1',4,8000.00,5000.00),('019d4b22-b45f-76f5-b7df-b3fe81c93148','019d4b22-b335-7697-b9c9-d5e798dee8c9','019d3a91-c7c0-757e-97f8-4e2fe314e867',1,5000.00,3000.00),('019d4b63-5ce9-711d-8429-3e160d3b63d5','019d4b63-5c81-7619-b380-1e7b7e29cebb','019d3a39-f81a-709e-a3f7-1fcb918cbf6c',1,35000.00,30000.00),('019d4b6e-3d0a-74c9-bd6d-b306dff596ab','019d4b6e-3c81-731d-bac3-26a5562946c0','019d3a91-c96d-75a9-a970-b261467e63b4',1,6000.00,2000.00),('019d4b72-a35e-7363-8929-81df07c9bbad','019d4b72-a2d5-719b-8cd8-7ccfbdb1dacf','019d3a91-c772-7655-8b1d-1caa882d2c09',1,15000.00,12000.00);
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_returns`
--

DROP TABLE IF EXISTS `sale_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_returns` (
  `id` varchar(36) NOT NULL,
  `sale_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `authorized_by` varchar(36) DEFAULT NULL,
  `shift_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sale` (`sale_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `sale_returns_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_returns`
--

LOCK TABLES `sale_returns` WRITE;
/*!40000 ALTER TABLE `sale_returns` DISABLE KEYS */;
INSERT INTO `sale_returns` VALUES ('019d453c-e728-72ba-9926-94bb2a9efff2','019d4525-5a5f-7415-a66f-bd660f2eab85','019d3a91-c7b0-76c9-982e-f664d6f51d21',1,50000.00,'Wrong Item','019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,'2026-03-31 21:51:52'),('019d4555-0dbb-7230-929a-9d0fe1667791','019d4525-5a5f-7415-a66f-bd660f2eab85','019d3a91-c7b0-76c9-982e-f664d6f51d21',1,50000.00,'Wrong Item','019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,'2026-03-31 22:18:15'),('019d4573-d255-7019-a021-82016c89f96e','019d4525-5a5f-7415-a66f-bd660f2eab85','019d3a91-c7b0-76c9-982e-f664d6f51d21',4,200000.00,'Wrong Item','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-03-31 22:51:51'),('019d45da-5e54-73cd-b2ef-a9bce0de7a66','019d45d7-46b4-761a-a79e-bbf805b2aa94','019d3a91-c79b-735b-878c-112e5e434dac',2,700000.00,'Wrong Item','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-04-01 00:43:52'),('019d45e0-1470-71ae-9a77-e1f535a20cab','019d45d8-fb48-7114-b351-0952684675a1','019d3a91-c79b-735b-878c-112e5e434dac',1,350000.00,'Wrong Item','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-04-01 00:50:06'),('019d45e8-6992-77b6-b300-8cfa5b92b583','019d45e7-5f78-70be-9e77-9785cd7c44fc','019d3a91-c79b-735b-878c-112e5e434dac',1,350000.00,'Wrong Item','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-04-01 00:59:12'),('019d49a4-36fe-72d6-a35f-2828256d8a28','019d4911-7c03-76b0-92da-a31ba91b3045','019d3a91-c79b-735b-878c-112e5e434dac',1,332500.00,'Wrong Item','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-04-01 00:00:00'),('019d49ac-2ab0-717d-93b6-a6843d036721','019d48dc-9b3a-75b5-b97d-9a6912e67a0f','019d3a91-c79b-735b-878c-112e5e434dac',1,332500.00,'Wrong Item','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,'2026-04-01 18:31:52'),('019d4adf-e0b3-74be-981b-81ff94346d03','019d4adb-f629-7189-b3dc-d23d05db1fc8','019d3a91-c7ad-74d9-9621-1b2d7a4608fc',1,40000.00,'Wrong Item','019d39ee-6a62-77c2-a3f6-afa4f507ee09','019d4add-9548-71eb-87ae-0c0e575a7ba3','2026-04-02 00:07:59');
/*!40000 ALTER TABLE `sale_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` varchar(36) NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `tax` decimal(15,2) DEFAULT 0.00,
  `discount` decimal(15,2) DEFAULT 0.00,
  `payment_method` varchar(50) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `cashier_id` varchar(36) DEFAULT NULL,
  `shift_id` varchar(36) DEFAULT NULL,
  `promo_id` varchar(36) DEFAULT NULL,
  `promo_name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES ('019d3b04-b223-77aa-8961-45286a8fcf73',9000.00,9000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-29 22:14:16'),('019d3b06-e591-70cd-800a-beb9c473e9c3',13000.00,13000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-29 22:16:40'),('019d3b0d-aff4-75aa-ba09-19748b3c257b',18000.00,18000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-29 22:24:06'),('019d3b1d-6479-76ca-affb-be95127ee8cc',18000.00,18000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-29 22:41:15'),('019d3b22-506e-73de-8a5b-c6fb5907208e',100000.00,100000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-29 22:46:37'),('019d3b25-0c0a-75b8-87c7-66a6fdbd6bc0',53000.00,53000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-29 22:49:36'),('019d3b2b-1bc3-757c-8c57-035a70301c1d',238000.00,238000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-29 22:56:14'),('019d3b2e-2249-74cb-8a9e-a84feee06778',30000.00,30000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-29 22:59:32'),('019d3bc9-ad16-7572-ac55-65f9ddddaa2c',66000.00,66000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 01:49:26'),('019d3bd4-5f61-77bd-af2f-c44f4d4f422a',140000.00,140000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 02:01:07'),('019d3bd7-0fbc-745f-b07f-088bb2df81ba',19000.00,19000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 02:04:03'),('019d3bd7-0fd6-71e9-bd29-d05120d397a7',19000.00,19000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 02:04:03'),('019d3bdc-dbd7-7538-8e2a-cbdbb4e92e0a',111000.00,111000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 02:10:23'),('019d3bdf-8ced-77a9-8f81-011ee1580149',15000.00,15000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 02:13:19'),('019d3bdf-8d6c-7792-9d09-7eccc06da7b8',15000.00,15000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 02:13:19'),('019d3bdf-8ea0-77cd-afe0-a957c2850182',15000.00,15000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 02:13:20'),('019d3be3-a728-7197-a707-efcb5ba9306f',59000.00,59000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 02:17:48'),('019d3e03-3d44-7730-8c49-c2d6047ae655',70000.00,70000.00,0.00,0.00,'credit','c2','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 12:11:32'),('019d3e5e-ec6c-75da-ad47-8a3f10bdacf4',17000.00,17000.00,0.00,0.00,'credit','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 13:51:41'),('019d3e69-6d8e-74b5-a195-e5eb8dbf068e',40000.00,40000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 14:03:09'),('019d3e6a-de84-76ec-86a9-5d2ce4b16e76',700000.00,700000.00,0.00,0.00,'credit','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 14:04:44'),('019d3e84-1175-7069-a49d-5e1e268cd773',401000.00,401000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 14:32:15'),('019d3e84-6f40-730b-9383-10621c406d31',350000.00,350000.00,0.00,0.00,'credit','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 14:32:39'),('019d3e9a-686e-71f6-965e-39a128f82f64',16000.00,16000.00,0.00,0.00,'bank',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-30 14:56:39'),('019d3eaa-65db-724b-abf4-c8ab65332cdb',46000.00,46000.00,0.00,0.00,'mobile_money',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-30 15:14:07'),('019d3eb8-baf1-7588-890a-d87e401fe475',13000.00,13000.00,0.00,0.00,'credit','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-30 15:29:47'),('019d3eca-0022-706c-a8f3-03e5c7214190',12000.00,12000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-30 15:48:38'),('019d3ed1-47e2-740f-8344-3d2b43b5f770',100000.00,100000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-30 15:56:36'),('019d3f63-c308-745c-a41b-4ac621240cb9',1518000.00,1518000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 18:36:35'),('019d3f67-1bcb-73fb-b9d2-5aa733d49468',5985000.00,5985000.00,0.00,0.00,'bank','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 18:40:15'),('019d3f70-5420-738a-9e02-79a4432fa279',210000.00,210000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 18:50:19'),('019d3fd9-c810-76c7-8e16-0370fffdc556',12000.00,12000.00,0.00,0.00,'credit','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-30 20:45:30'),('019d43ad-8d65-773c-8c75-8e77ae624fa8',2050000.00,2050000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-31 14:35:40'),('019d44c2-afed-76b8-b8c7-32cf2449d3fa',235000.00,235000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-31 19:38:22'),('019d44d8-6f45-747f-904d-36a4e6775d3e',1180000.00,1180000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-31 20:02:08'),('019d44e7-3854-73b4-8471-ce69c4e0aa5e',1828500.00,1828500.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-03-31 20:18:17'),('019d4515-24ba-7783-b7ac-8b9b7e94b683',875000.00,875000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-31 21:08:26'),('019d4525-5a5f-7415-a66f-bd660f2eab85',1200000.00,1200000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-03-31 21:26:09'),('019d45d7-46b4-761a-a79e-bbf805b2aa94',700000.00,700000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-04-01 00:40:29'),('019d45d8-fb48-7114-b351-0952684675a1',1050000.00,1050000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-04-01 00:42:21'),('019d45e7-5f78-70be-9e77-9785cd7c44fc',1400000.00,1400000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09',NULL,NULL,NULL,'2026-04-01 00:58:04'),('019d4846-ba38-7490-9788-ed4938d2f413',640000.00,640000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-04-01 12:01:28'),('019d487f-f0b8-70d8-b57a-1b0edb044f44',235000.00,235000.00,0.00,0.00,'bank',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-04-01 13:03:57'),('019d48b6-107d-7319-b3f6-a04556008352',270000.00,280000.00,0.00,10000.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,NULL,NULL,'2026-04-01 14:03:04'),('019d48dc-9b3a-75b5-b97d-9a6912e67a0f',332500.00,350000.00,0.00,17500.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,'0GI81APOS','WATER TANKS FLASH SALE','2026-04-01 14:45:10'),('019d4911-7c03-76b0-92da-a31ba91b3045',332500.00,350000.00,0.00,17500.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92',NULL,'019d490e-e1b8-718a-892f-a1bed56dd10b','WATER TANKS 1000L FLASH SALE','2026-04-01 15:42:55'),('019d4ad3-fd3b-700c-a1ef-12b816d525cc',600500.00,604000.00,0.00,3500.00,'bank','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d3a03-ce40-740a-b689-c5a62d7a4a92','019d4ad0-4b14-7423-b9d1-77ebbb6b9bb6','019d490f-b757-77f8-bcfb-b55c5f8e4456','Concrete slabs FLASH SALE','2026-04-01 23:55:00'),('019d4adb-f629-7189-b3dc-d23d05db1fc8',401000.00,401000.00,0.00,0.00,'cash',NULL,'019d3a03-ce40-740a-b689-c5a62d7a4a92','019d4adb-7aae-72b6-90a8-3a2b68fa1a7d','019d490f-b757-77f8-bcfb-b55c5f8e4456','Concrete slabs FLASH SALE','2026-04-02 00:03:42'),('019d4add-b905-7368-a9da-72aab631e263',32000.00,32000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09','019d4add-9548-71eb-87ae-0c0e575a7ba3','019d490f-b757-77f8-bcfb-b55c5f8e4456','Concrete slabs FLASH SALE','2026-04-02 00:05:38'),('019d4b22-b335-7697-b9c9-d5e798dee8c9',5000.00,5000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09','019d4b22-9902-7563-8e25-dedcfbbaa399','019d490f-b757-77f8-bcfb-b55c5f8e4456','Concrete slabs FLASH SALE','2026-04-02 01:20:58'),('019d4b63-5c81-7619-b380-1e7b7e29cebb',35000.00,35000.00,0.00,0.00,'credit','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d39ee-6a62-77c2-a3f6-afa4f507ee09','019d4b62-5b68-73ad-8f92-4837f1e7e174','019d490f-b757-77f8-bcfb-b55c5f8e4456','Concrete slabs FLASH SALE','2026-04-02 02:31:36'),('019d4b6e-3c81-731d-bac3-26a5562946c0',6000.00,6000.00,0.00,0.00,'credit','019d3e5b-31df-733f-ae8d-1ba49a11009f','019d39ee-6a62-77c2-a3f6-afa4f507ee09','019d4b62-5b68-73ad-8f92-4837f1e7e174','019d490f-b757-77f8-bcfb-b55c5f8e4456','Concrete slabs FLASH SALE','2026-04-02 02:43:29'),('019d4b72-a2d5-719b-8cd8-7ccfbdb1dacf',15000.00,15000.00,0.00,0.00,'cash',NULL,'019d39ee-6a62-77c2-a3f6-afa4f507ee09','019d4b72-6f7b-715e-8160-722e15f2f8c3','019d490f-b757-77f8-bcfb-b55c5f8e4456','Concrete slabs FLASH SALE','2026-04-02 02:48:17');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES ('019d3a16-dff2-7359-989e-933535656b13','HIMA CEMENT','+256703345099','+256703345678','info@himacement.com',450000.00,'2026-03-29 17:54:30','2026-04-02 02:50:58'),('019d3ab3-9ff9-74b6-806c-b7fea703690a','Uganda Baati','Katimbo Jordan','256753086848','sales@ugandabaati.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a000-709f-b5ba-774f6b1b5cc0','Roofings Ltd','Jane Musiitwa','256753086848','orders@roofings.co.ug',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a001-703c-96a1-a8ded4086d23','ADRATH Supplies Hardware','Mugwanya Loyd','256753086848','sales@adrath.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a002-74e6-9dee-11591d652a05','Hardware World Ltd','Lubwama Fred','256753086848','sales@hardware.com',700000.00,'2026-03-29 20:45:43','2026-03-31 14:24:18'),('019d3ab3-a002-74e6-9dee-17f80aa10c50','Max Hardware Group','Okot Fred','256753086848','sales@max.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a003-74c8-b36a-00ba380747ba','Builder\'s Yard Ltd ','Apio Gerald','256753086848','sales@builders.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a004-712c-a181-148323e9e8b0','Timber King Suppliers ','Jack Moorhouse','256753086848','sales@timber.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a005-759c-81d0-d25fa67731f1','Riky Building Materials Ltd','Kyagaba Jonathan','256753086848','sales@rikybuildiing.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a005-759c-81d0-d71eaac5a8e5','Miko Uganda ','Akampa Denise','256753086848','sales@miko.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a006-7269-b382-3496bc48ad2d','Cheap General Hardware ','Opolot Jenny','256753086848','sales@cheapgeneral.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a007-702e-907e-6758a2867280','Depo Uganda','Apio Derriop','256753086848','sales@depo.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a008-72ea-ae14-e850e119290c','Sondestone Hardware','Acio Mary','256753086848','sales@sonde.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a008-72ea-ae14-eda8b3e8c08b','Veqtaq Uganda Limited','Lubwama Fredson','256753086848','sales@veqtaq.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a009-7048-81fc-9b4246457afa','KumuKutu Hardware Mall','Lubega Jude','256753086848','sales@kumukutu.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a00a-747f-8cbe-e42ef98831e3','Masenyu Works Construction','Maseeka Brude','256753086848','masenyu@sales.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43'),('019d3ab3-a00b-774c-8050-b2eb1b522697','IBM Building Materials','Lugadi John','256753086848','ibm@sales.com',0.00,'2026-03-29 20:45:43','2026-03-29 20:45:43');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('COMPANY_NAME','MUKONO GENERAL HARDWARE','2026-03-29 14:21:27'),('TIN','TIN-7832-34356','2026-03-29 14:21:27'),('LOCATION','MUKONO DISTRICT OPP. COLLINE HOTEL','2026-03-29 14:21:27'),('CONTACT_EMAIL','sales@mknghardware.com','2026-03-29 14:21:27'),('SUPPORT_PHONE','+256703840326','2026-03-29 14:19:23'),('SESSION_TIMEOUT','15','2026-03-31 11:34:22');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','manager','cashier','staff') DEFAULT 'staff',
  `employee_id` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`) USING HASH,
  KEY `idx_username` (`username`(250)),
  KEY `idx_employee` (`employee_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('019d39ee-6a62-77c2-a3f6-afa4f507ee09','musiitwajoel@gmail.com','$2b$10$.Vh0.2O3EXK3xKlMmMTJ.ONxgg6auWaSt4mTyZ3LuWymyvAosCUNq','admin','019d39ee-6a62-77c2-a3f6-abf9f310489b',1,'2026-03-29 14:10:19','2026-03-29 19:15:33'),('019d3a03-ce40-740a-b689-c5a62d7a4a92','tredumollc@gmail.com','$2b$10$Fwg91FhD7FMLY88QB4CnpOL1ZCxZ75.Dw63E.1YnyMBW8M53c4lyq','staff','019d3a03-cc56-7155-b6d4-8d0e3ba70cda',1,'2026-03-29 14:33:41','2026-03-29 19:15:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-02 14:56:42
