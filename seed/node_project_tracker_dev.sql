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
-- Base de données :  `node_project_tracker_dev`
--

-- --------------------------------------------------------

--
-- Structure de la table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime COLLATE utf8_unicode_ci DEFAULT NULL,
  `updated_at` datetime COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Index pour les tables exportées
--

--
-- Index pour la table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;


CREATE TABLE `timers` (
  `id` int(11) NOT NULL,
  `type` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `project_id` int(11),
  `duration` int(11),
  `status` ENUM('new','done','interrupted') DEFAULT 'new',
  `created_at` datetime COLLATE utf8_unicode_ci DEFAULT NULL,
  `updated_at` datetime COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Index pour les tables exportées
--

--
-- Index pour la table `timers`
--
ALTER TABLE `timers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `timers`
--
ALTER TABLE `timers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


-- Migration: Tue Feb 14th, 2017
ALTER TABLE `timers`
  ADD COLUMN `project_id` integer,
  ADD CONSTRAINT `fk_project_id` FOREIGN KEY(`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE;

-- In order to add Markdown field
ALTER TABLE `timers` CHANGE `description` `summary` TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;

ALTER TABLE `timers` ADD COLUMN `markdown` TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;

-- Bind color to project
ALTER TABLE `projects` ADD COLUMN `color` VARCHAR(7) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;

ALTER TABLE `timers` ADD COLUMN `stopped_at` datetime COLLATE utf8_unicode_ci DEFAULT NULL AFTER `updated_at`;


CREATE TABLE `options` (
  `id` int(11) NOT NULL,
  `key` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `value` text COLLATE utf8_unicode_ci DEFAULT NULL
);

--
-- Index pour la table `options`
--
ALTER TABLE `options`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `options`
--
ALTER TABLE `options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

INSERT INTO `options` (`key`, `value`) VALUES ('pomodoroDuration', '1500'), ('shortBreakDuration', '300'),('longBreakDuration', '900');

-- lowerCamel style
ALTER TABLE `projects` CHANGE `created_at` `createdAt` DATETIME NULL DEFAULT NULL;
ALTER TABLE `projects` CHANGE `updated_at` `updatedAt` DATETIME NULL DEFAULT NULL;
ALTER TABLE `timers` CHANGE `created_at` `createdAt` DATETIME NULL DEFAULT NULL;
ALTER TABLE `timers` CHANGE `updated_at` `updatedAt` DATETIME NULL DEFAULT NULL;
ALTER TABLE `timers` CHANGE `stopped_at` `stoppedAt` DATETIME NULL DEFAULT NULL;
ALTER TABLE `timers` CHANGE `project_id` `projectId` INT(11) NULL DEFAULT NULL;
ALTER TABLE `timers` ADD COLUMN `duration` int(11);
ALTER TABLE `timers` ADD COLUMN `ownerId` int(11) NOT NULL;
ALTER TABLE `timers`
  ADD CONSTRAINT `timers_ibfk_2` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `firstName` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastName` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `role_permission` (
  `roleId` int(11) UNSIGNED NOT NULL,
  `permissionId` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `dailyposts` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` int(11) NOT NULL,
  `markdown` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime COLLATE utf8_unicode_ci DEFAULT NULL,
  `updatedAt` datetime COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `dailyposts`
  ADD CONSTRAINT `dailyposts_ibfk_1` FOREIGN KEY(`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;


-- 05.29.2017


CREATE TABLE `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `username` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `tokenId` int(11) DEFAULT NULL,
  `type` enum('file','github','bitbucket','gitlab') COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `api_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `accountId` int(11) NOT NULL,
  `access_token` varchar(160) COLLATE utf8_unicode_ci DEFAULT NULL,
  `refresh_token` varchar(160) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `api_tokens`
  ADD CONSTRAINT `api_tokens_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 05.30.2017

CREATE TABLE `remoteprojects` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` int(11) NOT NULL,
  `accountId` int(11) NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `remoteUuid` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `fullName` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `htmlUrl` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


ALTER TABLE `remoteprojects`
  ADD CONSTRAINT `remoteprojects_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `remoteprojects_ibfk_2` FOREIGN KEY (`accountId`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `projects` ADD COLUMN `ownerId` int(11) NOT NULL;

ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 05.31.2017
ALTER TABLE `projects` ADD COLUMN `remoteProjectId` int(11) NOT NULL;
ALTER TABLE `remoteprojects` ADD COLUMN `localProjectId` int(11) NOT NULL;

ALTER TABLE `api_tokens` CHANGE `access_token` `accessToken` VARCHAR(160) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;
ALTER TABLE `api_tokens` CHANGE `refresh_token` `refreshToken` VARCHAR(160) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;
ALTER TABLE `api_tokens` ADD COLUMN `username` VARCHAR(64) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;
ALTER TABLE `api_tokens` ADD COLUMN `scopes` TEXT;
ALTER TABLE `api_tokens` CHANGE `expiresAt` `expiresAt` BIGINT(11) NULL DEFAULT NULL;
ALTER TABLE `remote_projects` CHANGE `localProjectId` `localProjectId` INT(11) NULL;


CREATE TABLE `issues` (
  `id` int(11) NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `status` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `label` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `remoteId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `issues_ibfk_1` (`remoteId`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `issues`
--
ALTER TABLE `issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;COMMIT;

ALTER TABLE `issues` ADD COLUMN `iid` int(11) NOT NULL;
ALTER TABLE `issues` ADD COLUMN `url` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;
ALTER TABLE `issues` CHANGE `status` `state` VARCHAR(32) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;
ALTER TABLE `issues` CHANGE `label` `title` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;
ALTER TABLE `issues` CHANGE `content` `description` TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;
ALTER TABLE `issues` ADD COLUMN `projectId` int(11) NOT NULL;
ALTER TABLE `issues`
  ADD KEY `issues_ibfk_2` (`projectId`);


--
ALTER TABLE `projects` ADD COLUMN `active` boolean;