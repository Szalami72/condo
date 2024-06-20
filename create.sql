CREATE DATABASE condoDb CHARACTER SET utf8 COLLATE utf8_general_ci;

USE condoDb;

CREATE TABLE users (
    id int(11) NOT NULL AUTO_INCREMENT,
    username varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(255) NOT NULL,
    adminLevel int(11) NOT NULL,
    password varchar(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE residences (
    id int(11) NOT NULL AUTO_INCREMENT,
    userId int(11) NOT NULL,
    buildingId int(11) NOT NULL,
    floorId int(11) NOT NULL,
    doorId int(11) NOT NULL,
    squareMeterId int(11) NOT NULL,
    balance int(11) NOT NULL,
    isMeters bool NOT NULL,
    commonCost int(11) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE buildings (
    id int(11) NOT NULL AUTO_INCREMENT,
    typeOfBuilding varchar(32) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE floors (
    id int(11) NOT NULL AUTO_INCREMENT,
    typeOfFloor varchar(32) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE doors (
    id int(11) NOT NULL AUTO_INCREMENT,
    typeOfDoor varchar(32) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE squareMeters (
    id int(11) NOT NULL AUTO_INCREMENT,
    numberOfSquareMeter int(4) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE loginHistory (
    id int(11) NOT NULL AUTO_INCREMENT,
    userId int(11) NOT NULL,
    loginTime datetime NOT NULL,
    PRIMARY KEY (id)
);

 CREATE TABLE metersSerialNumber(
    id int(11) NOT NULL AUTO_INCREMENT,
    meterId int(11) NOT NULL,
    serialNum varchar(32),
    PRIMARY KEY(id)
    );

    CREATE TABLE meterValues(
    id int(11) NOT NULL AUTO_INCREMENT,
    userId int(11) NOT NULL,
    montAndYear VARCHAR(16) NOT NULL,
    typeOfMeter VARCHAR(16) NOT NULL,
    value int(11) NOT NULL,
    PRIMARY KEY(id)
    );

    CREATE TABLE bulletinBoard (
        id int(11) NOT NULL AUTO_INCREMENT,
        createdTime datetime NOT NULL,
        content mediumtext NOT NULL,
        PRIMARY KEY (id)
    );

    CREATE TABLE condoDatas (
        id int(11) NOT NULL AUTO_INCREMENT,
        title varchar(255) NOT NULL,
        data varchar(255) NOT NULL,
        isEditable boolean NOT NULL,
        PRIMARY KEY (id)
    );

    CREATE TABLE settings (
        dictateDateStart int(11) NOT NULL,
        dictateDateEnd int(11) NOT NULL,
        commoncostPerSquareMeter int(11) NOT NULL,
        heatingBaseCost int(11) NOT NULL,
        heatingMultipleCost int(11) NOT NULL,
        heatingWaterPerCubicMeter int(11) NOT NULL,
        subDepositIfNoMeters int(11) NOT NULL,
        numberOfMeters int(11) NOT NULL,
        PRIMARY KEY (id)
    );

    CREATE TABLE files (
        id int(11) NOT NULL AUTO_INCREMENT,
        description varchar(255) NOT NULL,
        downloadUrl varchar(255) NOT NULL,
        filePath varchar(255) NOT NULL,
        PRIMARY KEY (id)
    );

CREATE TABLE tokens (
	id int(11) NOT NULL AUTO_INCREMENT,
        userId int(11) NOT NUll,
        token VARCHAR(255) NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY key(id)
        );