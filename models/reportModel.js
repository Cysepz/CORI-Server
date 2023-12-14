const sql = require('../mysql.js');

// 定義使用者模型
class ReportModel {
    ///////////////////////////////////////////////////////////////////////////////////// (addReport
    async readBlacklistStatus(respondent) { // 被檢舉者在黑名單停權狀態
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM blacklist WHERE user_id = ? AND status = 1';
            const params = [respondent];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('readBlacklistStatus query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('readBlacklistStatus query 成功');
                    console.log(result);
                    if (result.length === 0) { // 被檢舉者還沒被停權
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            });
        })
    }

    async readRideshareid(rideshareid, respondent, userId) { // 檢查是否存在行程編號
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM rideshare WHERE rideshare_id = ?';
            const params = [rideshareid, respondent, userId];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('readRideshareid query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('readRideshareid query 成功');
                    if (result.length === 0) { //如果沒有這個行程編號
                        resolve(1);
                    } else {
                        resolve(2);

                    }

                }
            });
        })
    }

    async readRideshareCheck(rideshareid, checkUser) { // 檢查行程編號是否有對應到檢舉者
        return new Promise((resolve, reject) => {
            checkUser = "%" + checkUser + "%";
            const query = 'SELECT * FROM rideshare WHERE rideshare_id=? and (passenger like ? or driver like ?) ';
            const params = [rideshareid, checkUser, checkUser];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('readRideshareCheck query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('readRideshareCheck query 成功');
                    if (result.length === 0) { //如果沒有這個行程編號
                        resolve(3);
                    } else {
                        resolve(4);

                    }

                }
            });
        })
    }




    async createReport(rideshareid, respondent, content) { // 新增檢舉
        //抓informant (檢舉者的user_id)
        const informant = '1';
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO `report` (`rideshare_id`, `content`,`informant`, `respondent`,`status`) VALUES (?,?,?,?,0)';
            const params = [rideshareid, content, informant, respondent];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('createReport query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('createReport query 成功', result);
                    resolve(result);
                }
            });
        })
    }

    ///////////////////////////////////////////////////////////////////////////////////// addReport)


    ///////////////////////////////////////////////////////////////////////////////////// (showMyReport
    async getMyReports(userId) { // 顯示我歷史檢舉資料內容(for user)
        //抓informant
        //const informant = '1';
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM report WHERE informant = ?';
            const params = [userId];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('getMyReports query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('getMyReports query 成功', result);
                    resolve(result);
                }
            });

        })
    }

    ///////////////////////////////////////////////////////////////////////////////////// showMyReport)

    ///////////////////////////////////////////////////////////////////////////////////// (showAllReport
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

    async getAllReports() { // 顯示所有未檢舉檢舉資料內容(for admin)
        //抓審核狀態status
        const status = '0';
        const params = [status];
        //抓管理員user_id
        // const user_id = '0';
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM report WHERE status = ?';
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
    ///////////////////////////////////////////////////////////////////////////////////// showAllReport)


    async readBlacklist(respondent) { // 檢查被檢舉者是否已在黑名單
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM blacklist WHERE user_id = ?';
            const params = [respondent];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('readBlacklist query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('readBlacklist query 成功');
                    if (result.length != 0) { //如果已存在在黑名單內
                        resolve(1);
                    } else {
                        resolve(2);
                    }
                }
            });
        })
    }
    async updateBlacklist(respondent) {  //更新黑名單
        return new Promise((resolve, reject) => {
            const params = [respondent];
            const query = 'UPDATE blacklist SET count = count + 1 WHERE user_id = ?';
            sql.pool.query(query, params, (error, result) => {
                if (error) {
                    console.error('updateBlacklist 失敗', error);
                    reject(error);
                } else {
                    console.log('updateBlacklist 成功');
                    resolve(result);
                    //resolve(true);
                }
            });
        });
    }

    async createBlacklist(respondent) {  //新增黑名單
        return new Promise((resolve, reject) => {
            const params = [respondent];
            const query = 'INSERT INTO `blacklist` (`user_id`, `count`, `status`) VALUES (?, 1, 0)';
            sql.pool.query(query, params, (error, result) => {
                if (error) {
                    console.error('createBlacklist 失敗', error);
                    reject(error);
                } else {
                    console.log('createBlacklist 成功');
                    resolve(result);
                }
            });
        });
    }

    async readCount(respondent) { // 檢查黑名單裡被檢舉者count次數
        return new Promise((resolve, reject) => {
            const query = 'SELECT count FROM blacklist WHERE user_id = ?';
            const params = [respondent];
            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('readCount query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('readCount query 成功');
                    const BlacklistData = result[0];
                    if (BlacklistData.count >= 3) { //如果count次數大於等於三
                        resolve(1);
                    } else {
                        resolve(2);
                    }
                }
            });
        })
    }

    async updateSusRes(respondent) {  //更新黑名單count、status、sus_time、rec_time
        return new Promise((resolve, reject) => {
            //抓informant
            //const informant = '1';
            const params = [respondent];
            const query = 'UPDATE blacklist SET status = 1,count = 0,sus_time=CURDATE(),rec_time=DATE_ADD(CURDATE(), INTERVAL 1 MONTH) WHERE user_id = ?';
            sql.pool.query(query, params, (error, result) => {
                if (error) {
                    console.error('updateSusRes 失敗', error);
                    reject(error);
                } else {
                    console.log('updateSusRes 成功');
                    resolve(result);
                }
            });
        });
    }

    async updateReportStatus(reportId, respondent) {  //更新檢舉表status
        //值是不是只要取reportId就好
        return new Promise((resolve, reject) => {
            //抓informant
            //const informant = '1';
            const params = [reportId, respondent];
            const query = 'UPDATE report SET status = 1 WHERE report_id = ? AND respondent= ?';
            sql.pool.query(query, params, (error, result) => {
                if (error) {
                    console.error('updateReportStatus 失敗', error);
                    reject(error);
                } else {
                    console.log('updateReportStatus 成功');
                    console.log(result);
                    resolve(true);
                }
            });


        });
    }

    async updateReportUnpass(reportId, respondent) {  //管理員審核檢舉不通過，status會是2
        return new Promise((resolve, reject) => {
            //抓informant
            //const informant = '1';
            const params = [reportId, respondent];
            const query = 'UPDATE report SET status = 2 WHERE report_id = ? AND respondent = ?';
            sql.pool.query(query, params, (error, result) => {
                if (error) {
                    console.error('updateReportUnpass 失敗', error);
                    reject(error);
                } else {
                    console.log('updateReportUnpass 成功');
                    resolve(result);
                }
            });
        });
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

    // async updateRecoverUser() { // 復權使用者 更新黑名單status狀態為0 (for admin)
    //     return new Promise((resolve, reject) => {
    //         const query = 'UPDATE blacklist SET status = 0, count = 0,sus_time=NULL,rec_time=NULL WHERE status = 1 AND rec_time<=CURRENT_TIMESTAMP';
    //         //const params = [rideshareid, respondent];
    //         sql.pool.query(query, (error, result) => {
    //             if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
    //                 console.log('updateRecoverUser query 失敗');
    //                 reject(error);
    //             } else {  // 成功時將查詢結果傳遞給回呼函數
    //                 console.log('updateRecoverUser query 成功');
    //                 resolve(result);

    //             }
    //         });
    //     })
    // }



    /*async readUserId(userId) { // 檢查重複使用者
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM user WHERE user_id = ?';
            const params = [userId];

            sql.pool.query(query, params, (error, result) => {
                if (error) {  // 如果發生錯誤，將錯誤信息傳遞給回呼函數
                    console.log('readUser query 失敗');
                    reject(error);
                } else {  // 成功時將查詢結果傳遞給回呼函數
                    console.log('readUser query 成功');
                    if (result.length != 0) {
                        resolve(true);
                    } else { resolve(false); }
                }
            });
        })
    }*/

    update(memberData) {

    }

    delete(memberData) {

    }
}

module.exports = new ReportModel();