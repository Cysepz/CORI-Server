const sql = require('../mysql.js'); 

// 定義使用者模型
class UserModel {
  async readUserId(userId){ // 檢查重複使用者
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM user WHERE user_id = ?';
      const params = [userId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
          reject(error);
        } else { 
          if(result.length != 0){ // 帳號已存在
            resolve(true);
          } else { resolve(false);} // 帳號不存在
        }
      });
    })
  }

  async createUser(userId, username, gender, email, phone, password){ // 註冊
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10).then(function (hash) { // 加密密碼
        const query = 'INSERT INTO `user` (`user_id`, `username`, `gender`, `email`, `phone`, `password`) VALUES (?,?,?,?,?,?)';
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

  async readUserIdPwd(userId, password){ // 登入
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM user WHERE user_id = ? AND password = ?';
      const params = [userId, password];
    
      sql.pool.query(query, params, (error, result) => {
        if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
          console.log('readPassword query 失敗');
          reject(error);
        } else {  // 成功時將查詢結果傳遞給回呼函數
          console.log('readPassword query 成功');  
          resolve(result);
        }
      });
    })
  }

  update(memberData){

  }

  delete(memberData) {

  }
}

module.exports = new UserModel();