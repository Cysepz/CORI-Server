const sql = require('../mysql.js');

// 定義使用者模型
class PermissionModel {
    async readAdmin(userId) { // 顯示管理員
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM administrator WHERE user_id = ?';
            const params = [userId];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('readAdmin query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('readAdmin query 成功');
                    console.log(result);
                    if (result.length != 0) { // 有這個管理員
                        resolve(true);
                    } else {// 沒有這個管理員
                        resolve(false);
                    }
                }
            });
        })
    }
    async getAllBlacklist(userId) { // 顯示所有黑名單內被停權用戶內容(for admin)
        //抓管理員user_id
        // const user_id = '0';
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM blacklist WHERE status = 1';
            const params = [userId];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('getAllReports query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('getAllReports query 成功', result);
                    resolve(result);
                }
            });

        })
    }

    // async getRecoverUser() { // 顯示所有應該要復權的使用者(for admin)
    //     return new Promise((resolve, reject) => {
    //         // 獲取這筆資料被檢舉人(對應blacklist裡面的user_id)

    //         // 獲取現在的時間戳
    //         //const currentTimeStamp = Date.now();
    //         const query = 'SELECT * FROM blacklist where rec_time<=CURRENT_TIMESTAMP'; //1211改
    //         //const params = [rideshareid, respondent];
    //         sql.pool.query(query, (error, result) => {
    //             if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
    //                 console.log('getRecoverUser query 失敗');
    //                 reject(error);
    //             } else {  // 成功時將查詢結果傳遞給回呼函數
    //                 console.log('getRecoverUser query 成功');
    //                 //console.log(result);
    //                 const blacklistData = result;
    //                 //if (blacklistData.restore_time <= currentTimeStamp) { //如果復權時間小於現在時間
    //                 if (blacklistData.length > 0) { //如果有資料是復權時間小於現在時間
    //                     resolve(1);
    //                 }
    //                 else {
    //                     resolve(2);
    //                 }

    //             }
    //         });
    //     })
    // }

    async updateRecoverUser() { // 復權使用者 更新黑名單status狀態為0 (for admin)
        return new Promise((resolve, reject) => {
            const query = 'UPDATE blacklist SET status = 0, count = 0,sus_time=NULL,rec_time=NULL WHERE status = 1 AND rec_time<=CURRENT_TIMESTAMP';
            //const params = [rideshareid, respondent];
            sql.pool.query(query, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('updateRecoverUser query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('updateRecoverUser query 成功');
                    resolve(result);

                }
            });
        })
    }



    update(memberData) {

    }

    delete(memberData) {

    }
}

module.exports = new PermissionModel();