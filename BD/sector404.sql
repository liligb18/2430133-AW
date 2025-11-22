-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-11-2025 a las 06:08:55
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sector404`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacoraacceso`
--

CREATE TABLE `bitacoraacceso` (
  `IdBitacora` int(11) NOT NULL,
  `IdUsuario` int(11) NOT NULL,
  `FechaAcceso` datetime DEFAULT current_timestamp(),
  `AccionRealizada` varchar(250) NOT NULL,
  `Modulo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bitacoraacceso`
--

INSERT INTO `bitacoraacceso` (`IdBitacora`, `IdUsuario`, `FechaAcceso`, `AccionRealizada`, `Modulo`) VALUES
(1, 3, '2025-11-17 21:48:42', 'Inicio de sesión', 'Login'),
(2, 3, '2025-11-17 22:22:52', 'Inicio de sesión', 'Login'),
(3, 3, '2025-11-17 22:24:02', 'Inicio de sesión', 'Login');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `controlagenda`
--

CREATE TABLE `controlagenda` (
  `IdCita` int(11) NOT NULL,
  `IdPaciente` int(11) NOT NULL,
  `IdMedico` int(11) NOT NULL,
  `FechaCita` datetime NOT NULL,
  `MotivoConsulta` varchar(250) DEFAULT NULL,
  `EstadoCita` varchar(20) DEFAULT 'Programada',
  `Observaciones` varchar(250) DEFAULT NULL,
  `FechaRegistro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `controlmedico`
--

CREATE TABLE `controlmedico` (
  `IdMedico` int(11) NOT NULL,
  `NombreCompleto` varchar(150) NOT NULL,
  `CedulaProfesional` varchar(50) NOT NULL,
  `EspecialidadId` int(11) NOT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `CorreoElectronico` varchar(100) DEFAULT NULL,
  `HorarioAtencion` varchar(100) DEFAULT NULL,
  `FechaIngreso` datetime DEFAULT current_timestamp(),
  `Estatus` bit(1) DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `controlpacientes`
--

CREATE TABLE `controlpacientes` (
  `IdPaciente` int(11) NOT NULL,
  `NombreCompleto` varchar(150) NOT NULL,
  `CURP` varchar(18) DEFAULT NULL,
  `FechaNacimiento` date DEFAULT NULL,
  `Sexo` char(1) DEFAULT NULL CHECK (`Sexo` in ('M','F')),
  `Telefono` varchar(20) DEFAULT NULL,
  `CorreoElectronico` varchar(100) DEFAULT NULL,
  `Direccion` varchar(250) DEFAULT NULL,
  `ContactoEmergencia` varchar(150) DEFAULT NULL,
  `TelefonoEmergencia` varchar(20) DEFAULT NULL,
  `Alergias` varchar(250) DEFAULT NULL,
  `AntecedentesMedicos` varchar(500) DEFAULT NULL,
  `FechaRegistro` datetime DEFAULT current_timestamp(),
  `Estatus` bit(1) DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidades`
--

CREATE TABLE `especialidades` (
  `IdEspecialidad` int(11) NOT NULL,
  `NombreEspecialidad` varchar(100) NOT NULL,
  `Descripcion` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `especialidades`
--

INSERT INTO `especialidades` (`IdEspecialidad`, `NombreEspecialidad`, `Descripcion`) VALUES
(1, 'Medicina General', 'Atención médica general y consultas básicas'),
(2, 'Cardiología', 'Especialista en enfermedades del corazón'),
(3, 'Pediatría', 'Atención médica infantil'),
(4, 'Dermatología', 'Tratamiento de enfermedades de la piel'),
(5, 'Traumatología', 'Tratamiento de lesiones musculares y óseas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `expedienteclinico`
--

CREATE TABLE `expedienteclinico` (
  `IdExpediente` int(11) NOT NULL,
  `IdPaciente` int(11) NOT NULL,
  `IdMedico` int(11) NOT NULL,
  `FechaConsulta` datetime DEFAULT current_timestamp(),
  `Sintomas` text DEFAULT NULL,
  `Diagnostico` text DEFAULT NULL,
  `Tratamiento` text DEFAULT NULL,
  `RecetaMedica` text DEFAULT NULL,
  `NotasAdicionales` text DEFAULT NULL,
  `ProximaCita` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gestorpagos`
--

CREATE TABLE `gestorpagos` (
  `IdPago` int(11) NOT NULL,
  `IdCita` int(11) NOT NULL,
  `IdPaciente` int(11) NOT NULL,
  `Monto` decimal(10,2) NOT NULL,
  `MetodoPago` varchar(50) DEFAULT NULL,
  `FechaPago` datetime DEFAULT current_timestamp(),
  `Referencia` varchar(100) DEFAULT NULL,
  `EstatusPago` varchar(20) DEFAULT 'Pagado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gestortarifas`
--

CREATE TABLE `gestortarifas` (
  `IdTarifa` int(11) NOT NULL,
  `DescripcionServicio` varchar(150) NOT NULL,
  `CostoBase` decimal(10,2) NOT NULL,
  `EspecialidadId` int(11) DEFAULT NULL,
  `Estatus` bit(1) DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `IdReporte` int(11) NOT NULL,
  `TipoReporte` varchar(50) DEFAULT NULL,
  `IdPaciente` int(11) DEFAULT NULL,
  `IdMedico` int(11) DEFAULT NULL,
  `FechaGeneracion` datetime DEFAULT current_timestamp(),
  `RutaArchivo` varchar(250) DEFAULT NULL,
  `Descripcion` varchar(250) DEFAULT NULL,
  `GeneradoPor` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `IdUsuario` int(11) NOT NULL,
  `Correo` varchar(100) NOT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `Nombre` varchar(150) DEFAULT '',
  `Rol` varchar(50) DEFAULT 'Recepcionista',
  `IdMedico` int(11) DEFAULT NULL,
  `Activo` bit(1) DEFAULT b'1',
  `FechaCreacion` datetime DEFAULT current_timestamp(),
  `UltimoAcceso` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`IdUsuario`, `Correo`, `Contrasena`, `Nombre`, `Rol`, `IdMedico`, `Activo`, `FechaCreacion`, `UltimoAcceso`) VALUES
(1, 'admin@gmail.com', '$2y$10$nJ7vYZ8r5Xw3Kq9Lm4Np2.eY7tZ8uW6vX5sT4rQ3pO2nM1lK0jH9i', 'Administrador', 'Admin', NULL, b'1', '2025-11-17 21:20:37', NULL),
(2, 'secretaria@gmail.com', '$2y$10$nJ7vYZ8r5Xw3Kq9Lm4Np2.eY7tZ8uW6vX5sT4rQ3pO2nM1lK0jH9i', 'Secretaria', 'Recepcionista', NULL, b'1', '2025-11-17 21:20:37', NULL),
(3, 'Eem@gmail.com', '$2y$10$48o4.j.vzkEUoX64gNF2aebU74GktLBEk3GV8oyeWS0M98g5w4uHC', 'Emm Aguirre', 'Recepcionista', NULL, b'1', '2025-11-17 21:48:31', '2025-11-17 22:24:02');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bitacoraacceso`
--
ALTER TABLE `bitacoraacceso`
  ADD PRIMARY KEY (`IdBitacora`),
  ADD KEY `IdUsuario` (`IdUsuario`);

--
-- Indices de la tabla `controlagenda`
--
ALTER TABLE `controlagenda`
  ADD PRIMARY KEY (`IdCita`),
  ADD KEY `IdPaciente` (`IdPaciente`),
  ADD KEY `IdMedico` (`IdMedico`);

--
-- Indices de la tabla `controlmedico`
--
ALTER TABLE `controlmedico`
  ADD PRIMARY KEY (`IdMedico`),
  ADD UNIQUE KEY `CedulaProfesional` (`CedulaProfesional`),
  ADD KEY `EspecialidadId` (`EspecialidadId`);

--
-- Indices de la tabla `controlpacientes`
--
ALTER TABLE `controlpacientes`
  ADD PRIMARY KEY (`IdPaciente`),
  ADD UNIQUE KEY `CURP` (`CURP`);

--
-- Indices de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD PRIMARY KEY (`IdEspecialidad`);

--
-- Indices de la tabla `expedienteclinico`
--
ALTER TABLE `expedienteclinico`
  ADD PRIMARY KEY (`IdExpediente`),
  ADD KEY `IdPaciente` (`IdPaciente`),
  ADD KEY `IdMedico` (`IdMedico`);

--
-- Indices de la tabla `gestorpagos`
--
ALTER TABLE `gestorpagos`
  ADD PRIMARY KEY (`IdPago`),
  ADD KEY `IdCita` (`IdCita`),
  ADD KEY `IdPaciente` (`IdPaciente`);

--
-- Indices de la tabla `gestortarifas`
--
ALTER TABLE `gestortarifas`
  ADD PRIMARY KEY (`IdTarifa`),
  ADD KEY `EspecialidadId` (`EspecialidadId`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`IdReporte`),
  ADD KEY `IdPaciente` (`IdPaciente`),
  ADD KEY `IdMedico` (`IdMedico`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`IdUsuario`),
  ADD UNIQUE KEY `Correo` (`Correo`),
  ADD KEY `IdMedico` (`IdMedico`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bitacoraacceso`
--
ALTER TABLE `bitacoraacceso`
  MODIFY `IdBitacora` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `controlagenda`
--
ALTER TABLE `controlagenda`
  MODIFY `IdCita` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `controlmedico`
--
ALTER TABLE `controlmedico`
  MODIFY `IdMedico` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `controlpacientes`
--
ALTER TABLE `controlpacientes`
  MODIFY `IdPaciente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `IdEspecialidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `expedienteclinico`
--
ALTER TABLE `expedienteclinico`
  MODIFY `IdExpediente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `gestorpagos`
--
ALTER TABLE `gestorpagos`
  MODIFY `IdPago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `gestortarifas`
--
ALTER TABLE `gestortarifas`
  MODIFY `IdTarifa` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `IdReporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `IdUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bitacoraacceso`
--
ALTER TABLE `bitacoraacceso`
  ADD CONSTRAINT `bitacoraacceso_ibfk_1` FOREIGN KEY (`IdUsuario`) REFERENCES `usuarios` (`IdUsuario`);

--
-- Filtros para la tabla `controlagenda`
--
ALTER TABLE `controlagenda`
  ADD CONSTRAINT `controlagenda_ibfk_1` FOREIGN KEY (`IdPaciente`) REFERENCES `controlpacientes` (`IdPaciente`),
  ADD CONSTRAINT `controlagenda_ibfk_2` FOREIGN KEY (`IdMedico`) REFERENCES `controlmedico` (`IdMedico`);

--
-- Filtros para la tabla `controlmedico`
--
ALTER TABLE `controlmedico`
  ADD CONSTRAINT `controlmedico_ibfk_1` FOREIGN KEY (`EspecialidadId`) REFERENCES `especialidades` (`IdEspecialidad`);

--
-- Filtros para la tabla `expedienteclinico`
--
ALTER TABLE `expedienteclinico`
  ADD CONSTRAINT `expedienteclinico_ibfk_1` FOREIGN KEY (`IdPaciente`) REFERENCES `controlpacientes` (`IdPaciente`),
  ADD CONSTRAINT `expedienteclinico_ibfk_2` FOREIGN KEY (`IdMedico`) REFERENCES `controlmedico` (`IdMedico`);

--
-- Filtros para la tabla `gestorpagos`
--
ALTER TABLE `gestorpagos`
  ADD CONSTRAINT `gestorpagos_ibfk_1` FOREIGN KEY (`IdCita`) REFERENCES `controlagenda` (`IdCita`),
  ADD CONSTRAINT `gestorpagos_ibfk_2` FOREIGN KEY (`IdPaciente`) REFERENCES `controlpacientes` (`IdPaciente`);

--
-- Filtros para la tabla `gestortarifas`
--
ALTER TABLE `gestortarifas`
  ADD CONSTRAINT `gestortarifas_ibfk_1` FOREIGN KEY (`EspecialidadId`) REFERENCES `especialidades` (`IdEspecialidad`);

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`IdPaciente`) REFERENCES `controlpacientes` (`IdPaciente`),
  ADD CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`IdMedico`) REFERENCES `controlmedico` (`IdMedico`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`IdMedico`) REFERENCES `controlmedico` (`IdMedico`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
