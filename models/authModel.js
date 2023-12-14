const sql = require('../mysql.js'); 

class authModel {
    updateToken(userId, token){ // 將 token 更新、存進 DB
        return new Promise((resolve, reject) => {
            const query = 'UPDATE user SET token = ? WHERE user_id = ?';
            const params = [token, userId];
        
            sql.pool.query(query, params, (error, result) => {
            if (error) {
                console.log('updateToken query 失敗');
                reject(error);
            } else {
                console.log('updateToken query 成功', result);
                resolve(result);
            }
            });
        });
    }

    readToken(req){ // token 驗證
        const authorizationHeader = req.headers.authorization;  // 截出 req header authorization
        let token = "";
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) { // 提取出 Token 部分
          token = authorizationHeader.substring(7);
        } else{
            return "";
        }
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM user WHERE token = ?';
            const params = [token];

            sql.pool.query(query, params, (error, result) => {
            if (error) {
                console.log('readToken query 失敗');
                reject(error);
            } else {
                console.log('readToken query 成功');
                if(result.length != 0){ // 有查到 userId
                    resolve(result[0].user_id);
                } else {    // 沒查到 userId
                    resolve("");
                } 
            }
            });
        });
    }
    
}

module.exports = new authModel();
