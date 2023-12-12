const express = require('express');
const bodyParser = require('body-parser');
const activityModel = require('../models/activityModel');

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

  // showActList_D = async (req, res) => {
  //   const { userId } = req.body;  // 取得用戶輸入資料
  //   try {
  //     const driverExist = await activityModel.readDriverId(userId); // 檢查司機是否存在
  //     if (!driverExist) {
  //       res.json({
  //         success: false,
  //         error: {
  //           message: "Show act list fail: permission deny (you don't have driverID)",
  //         }
  //       });
  //     } else { // 檢查學生證掃描結果
  //         const result = await activityModel.readAct_D();  // 列出所有由乘客發起的共乘行程
  //         if (result) {
  //           res.json({
  //             success: true,
  //             data: result
  //           });
  //         } else {
  //           res.json({
  //             success: false,
  //             error: {
  //               message: "Show act list fail : DB error",
  //             }
  //           });
  //         }  
  //     }
  //   } catch (error) {
  //     res.status(405).json({
  //       success: false,
  //       error: {
  //         message: "Show act list fail",
  //       }
  //     });
  //     console.log(error);
  //   }
  // }

  searchAct = async (req, res) => {
    const { dept, dest, time } = req.body;  // 取得用戶輸入資料
    // 填充所有查詢欄位
    if(dept == null) dept = "%";
    if(dest == null) dest = "%";
    if(time == null) time = "%";
    try {
      // 驗證登入狀態
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
    try {
      const driverExist = await activityModel.readDriverId(userId); // 檢查司機是否存在
      const carExist = await activityModel.readCarId(userId, carId); // 檢查車輛是否存在
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
    const { userId, rideshareId, carId} = req.body;  // 取得用戶輸入資料
    // 前端已經做完人數限制
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

  
  // joinAct_P = async (req, res) => {
  //   const { userId, rideshareId} = req.body;  // 取得用戶輸入資料
  //   try {
  //     const seat = await activityModel.readSeatsFromAct(rideshareId);
  //     if(seat <= 0){ // 座位數不足
  //       res.json({
  //         success: false,
  //         error: {
  //           message: "Join act by passenger fail: seat number unenough",
  //         }
  //       });
  //     } else { // 座位數還夠
  //       const newPassengerList = await activityModel.readPassFromAct(rideshareId);
  //       console.log(newPassengerList);
  //       const curLen = Object.keys(newPassengerList).length;
  //       console.log(curLen);
        
  //       if(newPassengerList){
  //         console.log("目前無乘客");
  //         // 取出 json 資料，加入一筆再放回去
  //       } else {
  //         // 創建一個 json 資料，加入
  //         console.log("有伙伴囉");          
  //       }  
  //       const result = await activityModel.updateAct_P(rideshareId, userId);  // 更新共乘行程的乘客名單，並將座位數 -1
  //       if(result) {
  //         res.json({
  //           success: true,
  //         });
  //       } else {
  //         res.json({
  //           success: false,
  //           error: {
  //             message: "Join act by passenger fail: DB error",
  //           }
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     res.status(405).json({
  //       success: false,
  //       error: {
  //         message: "Join act by passenger fail",
  //       }
  //     });
  //     console.log(error);
  //   }
  // }

}

module.exports = new activityController();
