const express = require('express');
const bodyParser = require('body-parser');
const activityModel = require('../models/activityModel');
const authModel = require('../models/authModel');
const reportModel = require('../models/reportModel');

const router = express.Router();
router.use(bodyParser.json());

class activityController{
  showActList = async (req, res) => {
    try {
      const result = await activityModel.readAllAct();  // 列出所有共乘行程
      if (result) {
      res.json({
          success: true,
          data: result
      });
      } else {
      res.json({
          success: false,
          error: {
          message: "Show act list fail : DB error",
          }
      });
      }  
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "Show act list fail",
        }
      });
      console.log(error);
    }
  }

  searchAct = async (req, res) => {
    const { dept, dest, time } = req.body;  // 取得用戶輸入資料
    try {
      const userId = await authModel.readToken(req);
      if(userId === ""){  // 驗證登入失敗
        res.json({
          success: false,
          error: {
            message: "Token error",
          }
        });
      } else {  // 驗證登入成功
        console.log(userId);
        const result = await activityModel.readAct(dept, dest, time); // 檢查司機是否存在
        if (result) {
          res.json({
            success: true,
            data: result
          });
        } else {
          res.json({
            success: false,
            error: {
              message: "Search act fail : DB error",
            }
          });
        }
      }
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "Search act fail",
        }
      });
      console.log(error);
    }
  }

  postAct_D = async (req, res) => {
    const { userId, dept, dest, time, seats, carId, carType, payment, memo} = req.body;  // 取得用戶輸入資料
    // const token = req.cookies.token; //FIXME：此行需要配合前端進行測試（不確定是否可行）
    try {
      // const verifyId = await authModel.readToken(token);
      const driverExist = await activityModel.readDriverId(userId); // 檢查司機是否存在
      const carExist = await activityModel.readIfCarIdExist(userId, carId); // 檢查車輛是否存在
      console.log(carExist);
      if (!driverExist) {
        res.json({
          success: false,
          error: {
            message: "Post act by driver fail: permission deny (you don't have driverID)",
          }
        });
      } else if(!carExist) {
        res.json({
          success: false,
          error: {
            message: "Post act by driver fail: carId doesn't exist",
          }
        });          
      } else {
        const currentTime = new Date();
        const givenTime = new Date(time);
        if(givenTime < currentTime){
          res.json({
            success: false,
            error: {
              message: "Post act by driver fail: 不能新增過去時間的行程",
            }
          });
        } else{
          const result = await activityModel.createAct_D(userId, dept, dest, time, seats, carId, carType, payment, memo);  // 創建活動
          if (result) {
            res.json({
              success: true,
            });
          } else {
            res.json({
              success: false,
              error: {
                message: "Post act by driver fail : DB error",
              }
            });
          }  
        }
      }
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "Post act by driver fail",
        }
      });
      console.log(error);
    }
  }

  postAct_P = async (req, res) => {
    const { userId, dept, dest, time, seats, carType, payment, memo} = req.body;  // 取得用戶輸入資料
    try {
      const currentTime = new Date();
      const givenTime = new Date(time);
      if(givenTime < currentTime){
        res.json({
          success: false,
          error: {
            message: "Post act by passenger fail: 不能新增過去時間的行程",
          }
        });
      } else{
        const result = await activityModel.createAct_P(userId, dept, dest, time, seats, carType, payment, memo);  // 列出所有由乘客發起的共乘行程
        if(result) {
          res.json({
            success: true,
          });
        } else {
          res.json({
            success: false,
            error: {
              message: "Post act by passenger fail: DB error",
            }
          });
        }
      }
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "Post act by passenger act fail",
        }
      });
      console.log(error);
    }
  }


  joinAct_D = async (req, res) => {
    const { userId, rideshareId } = req.body;  // 取得用戶輸入資料
    try {
      const driverExist = await activityModel.readDriverId(userId); // 檢查是否具有司機身分
      if (!driverExist) {
        res.json({
          success: false,
          error: {
            message: "Join act by driver fail: permission deny (you don't have driverID)",
          }
        });
      } else {
        const full = await activityModel.readDriverFromAct(rideshareId);  // 檢查此行程是否已有司機
        if(full){
          res.json({
            success: false,
            error: {
              message: "Join act by driver fail: 行程已經有司機了",
            }
          });
        } else{
          const userExistInAct = await reportModel.readRideshareCheck(rideshareId, userId);
          if(userExistInAct == 4) {
            res.json({
              success: false,
              error: {
                message: "Join act by driver fail: 您已經在此行程中了",
              }
            });
          } else {
            const carId = await activityModel.readCarId(userId);
            const result = await activityModel.updateAct_D(userId, rideshareId, carId);  // 將司機加入共乘行程
            if(result) {
              res.json({
                success: true,
              });
            } else {
              res.json({
                success: false,
                error: {
                  message: "Join act by driver fail: DB error",
                }
              });
            }
          }
        }
      }
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "Join act by driver fail",
        }
      });
      console.log(error);
    }
  }

  
  joinAct_P = async (req, res) => {
    const { rideshareId, userId } = req.body;  // 取得用戶輸入資料
    try {
      const userExistInAct = await reportModel.readRideshareCheck(rideshareId, userId);
      if(userExistInAct == 4){
        res.json({
          success: false,
          error: {
            message: "Join act by passenger fail: 您已經在此行程中了",
          }
        });
      } else{
        const seat = await activityModel.readSeatsFromAct(rideshareId);
        if(seat <= 0){ // 座位數不足
          res.json({
            success: false,
            error: {
              message: "Join act by passenger fail: 行程已滿",
            }
          });
        } else { // 座位數還夠
          const passList = await activityModel.readPassFromAct(rideshareId); // 獲取 DB 當中 passenger 欄位資料
          let parsedPassList = passList.passenger ? JSON.parse(passList.passenger) : {};  // 初始化 or 序列化 passenger 內容
          const passLen = Object.keys(parsedPassList).length; // 計算 passenger 長度

          if (this.findValue(parsedPassList, userId)) {
            res.json({
              success: false,
              error: {
                message: "Join act by passenger fail: 您已在乘客名單中",
              }
            });
          } else {
            parsedPassList[passLen+1] = userId; // 新增乘客
            passList.passenger = JSON.stringify(parsedPassList);  // 更新 passList 的 JSON 字符串
            const result = await activityModel.updateAct_P(rideshareId, parsedPassList, seat-1); // 更新共乘行程的乘客名單，並將座位數 -1
            if(result) {
              res.json({
                success: true,
                data: {
                  passengerList: parsedPassList,
                }
              });
            } else {
              res.json({
                success: false,
                error: {
                  message: "Join act by passenger fail: DB error",
                }
              });
            }
          }
        }
      }
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "Join act by passenger fail",
        }
      });
      console.log(error);
    }
  }

  findValue(jsonData, targetValue) {
    // 遍歷 jsonData 
    for (const [key, value] of Object.entries(jsonData)) {
      if (value === targetValue) {
        return true;
      }
    }
    return false;
  }

}

module.exports = new activityController();
