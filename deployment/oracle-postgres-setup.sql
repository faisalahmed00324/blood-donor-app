CREATE USER bloodconnect WITH PASSWORD 'F@isal000';
CREATE DATABASE blooddonor OWNER bloodconnect;
GRANT ALL PRIVILEGES ON DATABASE blooddonor TO bloodconnect;
