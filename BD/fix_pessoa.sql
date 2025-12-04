-- Corrigir a tabela pessoa (tinha erro de sintaxe)
DROP TABLE IF EXISTS `pessoa`;
CREATE TABLE `pessoa` (
  `pessoa_id` int NOT NULL AUTO_INCREMENT,
  `pessoa_nome` varchar(100) DEFAULT NULL,
  `pessoa_sexo` varchar(50) DEFAULT NULL,
  `pessoa_data_nascimento` date DEFAULT NULL,
  PRIMARY KEY (`pessoa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `pessoa` VALUES (1,'João Silva','Masculino','2002-05-10'),(2,'Maria Costa','Feminino','2001-09-21'),(3,'Pedro Rocha','Masculino','2003-01-15'),(4,'Ana Martins','Feminino','1980-11-03'),(5,'Carlos Monteiro','Masculino','1975-07-19'),(6,'Rita Gomes','Feminino','1988-03-28'),(7,'Luís Faria','Masculino','1990-12-10');
