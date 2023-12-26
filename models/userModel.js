const sql = require('../mysql.js');
const bcrypt = require('bcrypt');

// 定義使用者模型
class UserModel {
  async readUserId(userId) { // 檢查重複使用者
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM user WHERE user_id = ?';
      const params = [userId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
          reject(error);
        } else {
          if (result.length != 0) { // 帳號已存在
            resolve(true);
          } else { resolve(false); } // 帳號不存在
        }
      });
    })
  }

  async createUser(userId, username, gender, email, phone, password) { // 註冊
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10).then(function (hash) { // 加密密碼
        const query = 'INSERT INTO `user` (`user_id`, `username`, `gender`, `email`, `phone`, `password`, `token`) VALUES (?,?,?,?,?,?,NULL)';
        const params = [userId, username, gender, email, phone, hash];

        sql.pool.query(query, params, (error, result) => {
          if (error) {
            console.log('createUser query 失敗');
            reject(error);
          } else {
            console.log('createUser query 成功', result);
            resolve(result);
          }
        });
      });
    })
  }

  async readBlacklist(userId) { // 登入
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM blacklist WHERE user_id = ? AND status = 1';
      const params = [userId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
          console.log('readBlacklist query 失敗');
          reject(error);
        } else {  // 成功時將查詢結果傳遞給回呼函數
          console.log('readBlacklist query 成功');
          if (result.length != 0) { // 表使用者被停權
            resolve(true);
          } resolve(false);
        }
      });
    })
  }

  async readPwd(userId, password) { // 登入
    return new Promise((resolve, reject) => {
      const query = 'SELECT password FROM user WHERE user_id = ?';
      const params = [userId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.length != 0) {
            bcrypt.compare(password, result[0].password).then(function (res) { // 比對密碼
              if (res) {
                resolve(0); // login success
              } resolve(1); // wrong password 
            });
          } else {
            resolve(2); // account not found
          }
        }
      });
    })
  }

  async readAdmin(userId) { // 檢查重複使用者
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM administrator WHERE user_id = ?';
      const params = [userId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
          reject(error);
        } else {
          if (result.length != 0) { // 帳號已存在
            resolve(true);
          } else { resolve(false); } // 帳號不存在
        }
      });
    })
  }

  async createDriver(userId, carId, seat, charge, category) { // 註冊
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO `driver` (`user_id`, `car_id`, `seats`, `charges`, `category`) VALUES (?,?,?,?,?)';
      const params = [userId, carId, seat, charge, category];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          console.log('createDriver query 失敗');
          reject(error);
        } else {
          console.log('createDriver query 成功');
          resolve(result);
        }
      });
    })
  }

  async readCarInfo(userId) { // 查詢該司機的車子資訊
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM driver WHERE user_id = ?';
      const params = [userId];
      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.length != 0) {
            resolve(result[0])
          }
          resolve(0);
        }
      });
    })
  }

  async readUserInfo(userId) { // 檢查重複使用者
    return new Promise((resolve, reject) => {
      const query = 'SELECT username, gender, email, phone FROM user WHERE user_id = ?';
      const params = [userId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
          reject(error);
        } else {
          resolve(result[0]);
        }
      });
    })
  }

  async updateUser(userId, userName, email, gender, phone, password) { // 更新用戶資料

    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10).then(function (hash) { // 加密密碼
        let query = "UPDATE user SET ";
        const params = [userName, email, gender, phone, hash, userId];
        if (userName !== '') {
          query += "username ='" + params[0] + "',";
        }
        if (email !== '') {
          query += "email ='" + params[1] + "',";
        }
        if (gender !== '') {
          query += "gender = '" + params[2] + "',";
        }
        if (phone !== '') {
          query += "phone ='" + params[3] + "',";
        }
        if (password !== '') {
          query += "password = '" + params[4] + "',";
        }
        query += "WHERE user_id= '" + params[5] + "'";
        query = query.replace(',WHERE', 'WHERE');

        sql.pool.query(query, (error, result) => {
          if (error) {
            console.error('updateUser 失敗', error);
            reject(error);
          } else {
            console.log('updateUser 成功');
            resolve(result);
          }
        });
      });
    })
  }

  async getPassengerHistory(userId) { // 顯示用戶歷史內容
    return new Promise((resolve, reject) => {
      const newUserId = "%" + userId + "%";
      const query = "SELECT * FROM rideshare WHERE passenger like ?";
      const params = [newUserId];
      sql.pool.query(query, params, (error, result) => {
        if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
          console.log('getPassengerHistory query 失敗');
          reject(error);
        } else {  // 成功時將查詢結果傳遞給回呼函數
          console.log('getPassengerHistory query 成功', result);
          resolve(result);
        }
      });

    })
  }

  async getDriverHistory(userId) { // 顯示用戶歷史內容
    return new Promise((resolve, reject) => {
      const newUserId = "%" + userId + "%";
      const query = "SELECT * FROM rideshare WHERE driver like ?";
      const params = [newUserId];
      sql.pool.query(query, params, (error, result) => {
        if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
          console.log('getDriverHistory query 失敗');
          reject(error);
        } else {  // 成功時將查詢結果傳遞給回呼函數
          console.log('getDriverHistory query 成功', result);
          resolve(result);
        }
      });

    })
  }

  async updateDriver(userId, carId, seat, charge, category) {  //更新黑名單
    return new Promise((resolve, reject) => {
      let query = "UPDATE driver SET ";
      const params = [userId, carId, seat, charge, category];
      if (carId !== '') {
        query += "car_id ='" + params[1] + "',";
      }
      if (seat !== '') {
        query += "seats ='" + params[2] + "',";
      }
      if (charge !== '') {
        query += "charges = '" + params[3] + "',";
      }
      if (category !== '') {
        query += "category ='" + params[4] + "',";
      }
      query += "WHERE user_id= '" + params[0] + "'";
      query = query.replace(',WHERE', 'WHERE');

      sql.pool.query(query, (error, result) => {
        if (error) {
          console.error('updateDriver 失敗', error);
          reject(error);
        } else {
          console.log('updateDriver 成功');
          if (result) resolve(true);
          else resolve(false);
        }
      });
    })
  }

}

module.exports = new UserModel();