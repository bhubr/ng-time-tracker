-- phpMyAdmin SQL Dump
-- version 4.6.6
-- https://www.phpmyadmin.net/
--
-- Client :  localhost
-- Généré le :  Mar 31 Janvier 2017 à 13:53
-- Version du serveur :  10.1.21-MariaDB
-- Version de PHP :  7.0.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `celeb_dev`
--

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_name` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `image_url` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `image_url`) VALUES
(1, 'Scarlett', 'Johansson', 'https://mag.lesgrandsducs.com/wp-content/uploads/2015/12/Scarlett-Johansson-17.jpg'),
(2, 'Leighton', 'Meester', 'http://s.plurielles.fr/mmdia/i/23/1/leighton-meester-2714231lxxeu.jpg?v=7'),
(3, 'Sophie', 'Turner', 'http://stealherstyle.net/wp-content/uploads/2015/03/sophie-turner-makeup-1-500x500.jpg'),
(4, 'Nicole', 'Kidman', 'http://a4.files.biography.com/image/upload/c_fill,cs_srgb,dpr_1.0,g_face,h_300,q_80,w_300/MTIwNjA4NjMzODY5NTM0NzMy.jpg'),
(5, 'Julia', 'Roberts', 'https://pbs.twimg.com/profile_images/1215041594/Screen_shot_2011-01-13_at_4.55.22_PM_400x400.png'),
(6, 'Kate', 'Winslet', 'http://s.plurielles.fr/mmdia/i/00/3/kate-winslet-2733003tsdmg.jpg?v=6'),
(7, 'Marion', 'Cotillard', 'http://s.plurielles.fr/mmdia/i/85/4/inception-marion-cotillard-6745854owymf_2041.jpg'),
(8, 'Natalie', 'Portman', 'http://www.eatthatvegan.com/wp-content/uploads/2015/10/natalie-portman2.jpg'),
(9, 'Emma', 'Watson', 'http://thumbs.modthesims2.com/img/7/3/5/8/7/5/2/MTS_Yuffie21-1602952-296266-emma-watson-2.jpg');

--
-- Index pour les tables exportées
--

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
