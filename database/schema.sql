-- MySQL dump 10.13  Distrib 9.4.0, for macos26.0 (arm64)
--
-- Host: localhost    Database: marketdata_peru
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bitacora_integracion`
--

DROP TABLE IF EXISTS `bitacora_integracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_integracion` (
  `id_bitacora` bigint NOT NULL AUTO_INCREMENT,
  `id_consulta` bigint DEFAULT NULL,
  `servicio` varchar(50) NOT NULL,
  `operacion` varchar(100) NOT NULL,
  `tipo_acceso` enum('ARCHIVO','REST','SOAP','MYSQL') NOT NULL,
  `estado` enum('EXITO','ERROR','PARCIAL') NOT NULL,
  `codigo_http` smallint unsigned DEFAULT NULL,
  `tiempo_respuesta_ms` int unsigned DEFAULT NULL,
  `mensaje` varchar(500) DEFAULT NULL,
  `fecha_evento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_bitacora`),
  KEY `idx_servicio` (`servicio`),
  KEY `idx_fecha_evento` (`fecha_evento`),
  KEY `fk_bitacora_consulta` (`id_consulta`),
  CONSTRAINT `fk_bitacora_consulta` FOREIGN KEY (`id_consulta`) REFERENCES `consultas` (`id_consulta`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas` (
  `id_consulta` bigint NOT NULL AUTO_INCREMENT,
  `tipo_consulta` enum('TERRITORIAL','EMPRESARIAL','ANALISIS_ZONA') NOT NULL,
  `ubigeo` char(6) DEFAULT NULL,
  `ruc` char(11) DEFAULT NULL,
  `estado` enum('COMPLETA','PARCIAL','ERROR') NOT NULL,
  `resultado` json DEFAULT NULL,
  `fecha_consulta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vigente_hasta` datetime DEFAULT NULL,
  PRIMARY KEY (`id_consulta`),
  KEY `idx_consulta_ubigeo` (`ubigeo`),
  KEY `idx_consulta_ruc` (`ruc`),
  KEY `idx_fecha_consulta` (`fecha_consulta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contribuyentes`
--

DROP TABLE IF EXISTS `contribuyentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contribuyentes` (
  `ruc` char(11) NOT NULL,
  `razon_social` varchar(300) NOT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `condicion` varchar(50) DEFAULT NULL,
  `ubigeo` char(6) DEFAULT NULL,
  `fecha_importacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ruc`),
  KEY `idx_ubigeo` (`ubigeo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-10 16:55:05
