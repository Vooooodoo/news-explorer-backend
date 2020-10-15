//* модули для сбора логов
const winston = require('winston');
const expressWinston = require('express-winston');
const path = require('path');

const dirPath = path.join(__dirname, '../logs');

//* логгер запросов к серверу
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: path.join(dirPath, 'request.log') }), //* писать логи в файл request.log
  ],
  format: winston.format.json(), //* писать логи в формате json
});

//* логгер ошибок сервера
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: path.join(dirPath, 'error.log') }),
  ],
  format: winston.format.json(),
});

module.exports = {
  requestLogger,
  errorLogger,
};
