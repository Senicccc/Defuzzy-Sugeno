-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2025 at 08:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `defuzzy`
--

-- --------------------------------------------------------

--
-- Table structure for table `calculations`
--

CREATE TABLE `calculations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `var_perm_min` decimal(10,2) DEFAULT NULL,
  `var_perm_max` decimal(10,2) DEFAULT NULL,
  `var_pers_min` decimal(10,2) DEFAULT NULL,
  `var_pers_max` decimal(10,2) DEFAULT NULL,
  `var_prod_min` decimal(10,2) DEFAULT NULL,
  `var_prod_max` decimal(10,2) DEFAULT NULL,
  `permintaan_x` decimal(10,2) DEFAULT NULL,
  `persediaan_x` decimal(10,2) DEFAULT NULL,
  `nilai_sugeno` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `calculations`
--

INSERT INTO `calculations` (`id`, `user_id`, `name`, `var_perm_min`, `var_perm_max`, `var_pers_min`, `var_pers_max`, `var_prod_min`, `var_prod_max`, `permintaan_x`, `persediaan_x`, `nilai_sugeno`, `created_at`) VALUES
(1, 1, 'Permintaan, persediaan, dan produksi batubara PT. Tri Bakti Sarimas periode Januari - Desember 2015 n', 486.00, 9868.00, 743.00, 3761.00, 1254.00, 8580.00, 5823.00, 2903.00, 6138.76, '2025-05-25 01:05:11'),
(2, 4, 'Produksi PT. Sejahtera', 500.00, 8000.00, 1000.00, 10000.00, 1000.00, 10000.00, 5865.00, 3950.00, 7322.57, '2025-05-25 02:48:04'),
(3, 1, 'Produksi 01', 0.00, 1.00, 0.00, 1.00, 0.00, 1.00, 0.00, 1.00, 0.50, '2025-06-09 04:59:23'),
(5, 5, 'Produksi Siomay 2024', 1000.00, 10000.00, 2000.00, 20000.00, 3000.00, 18000.00, 4000.00, 14000.00, 10500.00, '2025-06-10 06:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `created_at`) VALUES
(1, 'test', '$2y$10$y1Kdy.q/0VWkMKYHVzeVgOQI2A3XRMeWXc7sMbynYT7q6KwYREx92', 'test@gmail.com', '2025-05-25 01:00:36'),
(4, 'test2', '$2y$10$G9oLc/4J3iYI/jUhBE2wGexSYl3fVbUCbka5Wst7kX0.VVZT5/iEy', 'test2@gmail.com', '2025-05-25 02:44:48'),
(5, 'nichol', '$2y$10$SIz5kpYM.qXFsKUruIQIMuR9FZXDJ979R6vrJiZMJLszahhSahJaG', 'nichol@nichol.com', '2025-06-10 06:03:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `calculations`
--
ALTER TABLE `calculations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `calculations`
--
ALTER TABLE `calculations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calculations`
--
ALTER TABLE `calculations`
  ADD CONSTRAINT `calculations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
