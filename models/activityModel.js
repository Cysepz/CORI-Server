const sql = require('../mysql.js');

// 定義使用者模型
class activityModel {
  // showActList model
  async readAllAct() { // 列出所有非過去式的行程
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM rideshare WHERE time > NOW()';

      sql.pool.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    })
  }

  // searchAct model
  async readAct(dept, dest, time) { // 查詢符合特定條件的共乘行程
    return new Promise((resolve, reject) => {
      // 填充 param
      dept = dept || "%";
      dest = dest || "%";

      // time interval (查詢時間的前兩小時到後兩小時)
      let startOfTime;
      let endOfTime;
      if (time === "") { // time 為空值
        startOfTime = new Date();
        endOfTime = "2523-12-18 16:59:59.999";
      } else {
        const reqDateTime = new Date(time);
        startOfTime = new Date(reqDateTime);
        startOfTime.setMinutes(-120, 0, -1); // 設為整點的開始
        endOfTime = new Date(startOfTime);
        endOfTime.setHours(endOfTime.getHours() + 4);
      }

      const query = 'SELECT * FROM rideshare WHERE departure LIKE ? AND destination LIKE ? AND time BETWEEN ? AND ?';
      const params = [dept, dest, startOfTime, endOfTime];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    })
  }

  // postAct_D model
  async readDriverId(userId) { // 檢查司機是否存在
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM driver WHERE user_id = ?';
      const params = [userId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.length != 0) { // 查詢有果
            resolve(true);
          } else { resolve(false); } // 查詢未果
        }
      });
    })
  }
  async readIfCarIdExist(userId, carId) { // 檢查車輛是否存在
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM driver WHERE user_id = ? AND car_id = ?';
      const params = [userId, carId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          console.log(result)
          if (result.length != 0) { // 查詢有果
            resolve(true);
          } else { resolve(false); } // 查詢未果
        }
      });
    })
  }
  async createAct_D(userId, dept, dest, time, seats, carId, carType, payment, memo) { // 司機發起共乘
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO `rideshare` (`sponsor`, `passenger`, `departure`, `destination`, `time`, `driver`, `category`, `seats`, `car_id`, `payment`, `memo`) VALUES (true,NULL,?,?,?,?,?,?,?,?,?)';
      const params = [dept, dest, time, userId, carType, seats, carId, payment, memo];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          console.log('createAct_D query 失敗');
          reject(error);
        } else {
          console.log('createAct_D query 成功', result);
          resolve(result);
        }
      });
    })
  }


  // async readAct_D(){ // 查詢 sponsor 為 0 的共乘行程
  //   return new Promise((resolve, reject) => {
  //     const query = 'SELECT * FROM rideshare WHERE sponsor = 0 AND seats > 0 AND time > NOW() ';

  //     sql.pool.query(query, (error, result) => {
  //       if (error) {
  //         reject(error);
  //       } else { 
  //         resolve(result);
  //       }
  //     });
  //   })
  // }

  // postAct_P model
  async createAct_P(userId, dept, dest, time, seats, carType, payment, memo) { // 乘客發起共乘
    const passengerData = {
      "1": userId
    };
    const jsonString = JSON.stringify(passengerData, null, 2);
    console.log(jsonString);
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO `rideshare` (`sponsor`, `passenger`, `departure`, `destination`, `time`, `category`, `seats`, `payment`, `memo`) VALUES (false,?,?,?,?,?,?,?,?)';
      const params = [jsonString, dept, dest, time, carType, seats, payment, memo];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          console.log('createAct_P query 失敗');
          reject(error);
        } else {
          console.log('createAct_P query 成功', result);
          resolve(result);
        }
      });
    })
  }

  // joinAct_D model
  async readCarId(userId) { // 查詢該司機的車牌
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM driver WHERE user_id = ?';
      const params = [userId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result[0].car_id);
        }
      });
    })
  }
  async readDriverFromAct(rideshareId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM rideshare WHERE rideshare_id = ?';
      const params = [rideshareId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result[0].driver === null) { // 查詢無果
            resolve(false);
          } else { resolve(true); } // 查詢有果
        }
      });
    })
  }
  async updateAct_D(userId, rideshareId, carId) { // 將司機加入共乘行程
    return new Promise((resolve, reject) => {
      const query = 'UPDATE rideshare SET driver = ? , car_id = ? WHERE rideshare_id = ? AND sponsor = 0';
      const params = [userId, carId, rideshareId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          console.log('updateAct_D query 失敗');
          reject(error);
        } else {
          console.log('updateAct_D query 成功');
          resolve(result);
        }
      });
    })
  }

  // joinAct_P model
  async readSeatsFromAct(rideshareId) { // 查詢某共乘行程的當前剩餘座位數
    return new Promise((resolve, reject) => {
      const query = 'SELECT seats FROM rideshare WHERE rideshare_id = ?';
      const params = [rideshareId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result[0].seats);
        }
      });
    })
  }
  async readPassFromAct(rideshareId) { // 查詢某共乘行程的當前乘客列表
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM rideshare WHERE rideshare_id = ?';
      const params = [rideshareId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result[0].passenger);
        }
      });
    })
  }
  async updateAct_P(rideshareId, newPassengerList, newSeat) { // 將乘客加入共乘行程
    return new Promise((resolve, reject) => {
      const query = 'UPDATE rideshare SET passenger = ? , seats = ? WHERE rideshare_id = ?';
      const params = [JSON.stringify(newPassengerList), newSeat, rideshareId];

      sql.pool.query(query, params, (error, result) => {
        if (error) {
          console.log('updateAct_P query 失敗');
          reject(error);
        } else {  // 成功時將查詢結果傳遞給回呼函數
          console.log('updateAct_P query 成功');
          resolve(result);
        }
      });
    })
  }
}

module.exports = new activityModel();