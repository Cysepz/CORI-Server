const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const userModel = require('../models/userModel');
const authModel = require('../models/authModel'); //winnie
const activityModel = require('../models/activityModel');

const router = express.Router();
router.use(bodyParser.json());

class UserController {
  signup = async (req, res) => {
    const { userId, username, gender, email, phone, password } = req.body;  // 取得用戶輸入資料
    try {
      const duplicateUser = await userModel.readUserId(userId); // 帳號重複檢查
      if (duplicateUser) {
        res.json({
          success: false,
          error: {
            message: "Signup fail: duplicate user",
          }
        });
      } else {
        const result = await userModel.createUser(userId, username, gender, email, phone, password);  // 創建使用者
        if (result) {
          res.json({
            success: true,
          });
        } else {
          res.json({
            success: false,
            error: {
              message: "Signup fail : DB error",
            }
          });
        }
      }
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "Signup fail",
        }
      });
      console.log(error);
    }
  }

  login = async (req, res) => {
    const { userId, password } = req.body;        // 取得用戶輸入資料
    try {
      const suspension = await userModel.readBlacklist(userId); // 檢查使用者是否於黑名單當中
      const result = await userModel.readPwd(userId, password); // 登入
      if (suspension) {
        res.json({
          success: false,
          error: {
            message: "Login fail: 使用者停權中",
          }
        });
      } else if (result === 0) {
        const token = jwt.sign({ userId: userId }, "coriSecret1227"); // 產生 JWT token
        const tokenStoration = await authModel.updateToken(userId, token); // 將 token 存進 DB
        const expirationTime = new Date(Date.now() + 60 * 60 * 72 * 1000); // 三天後過期
        res.cookie("token", token, {
          expires: expirationTime,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        }).json({
          success: true,
          data: {
            token: token,
          }
        });
      } else if (result === 1) {
        res.json({
          success: false,
          error: {
            message: "Login fail: Wrong password",
          }
        });
      } else if (result === 2) {
        res.json({
          success: false,
          error: {
            message: "Login fail: account not found",
          }
        });
      } else {
        res.json({
          success: false,
          error: {
            message: "Login fail: DB error",
          }
        });
      }
    } catch (error) {
      res.status(405).json({ "result": "login fail" });
    }
  }

  adminLogin = async (req, res) => {  // 管理員登入
    const { userId, password } = req.body;  // 取得用戶輸入資料
    try {
      const admin = await userModel.readAdmin(userId); // 檢查此使用者 id 是否存在於管理員 table 中
      const result = await userModel.readPwd(userId, password); // 登入
      if (!admin) {
        res.json({
          success: false,
          error: {
            message: "Admin Login fail: 你不是管理員，請嘗試用一般使用者登入",
          }
        });
      } else if (result === 0) {
        const token = jwt.sign({ userId: userId }, "coriSecret1227"); // 產生 JWT token
        const tokenStoration = await authModel.updateToken(userId, token); // 將 token 存進 DB
        const expirationTime = new Date(Date.now() + 60 * 60 * 72 * 1000); // 三天後過期
        res.cookie("token", token, {
          expires: expirationTime,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        }).json({
          success: true,
          data: {
            token: token,
          }
        });
      } else if (result === 1) {
        res.json({
          success: false,
          error: {
            message: "Admin login fail: Wrong password",
          }
        });
      } else if (result === 2) {
        res.json({
          success: false,
          error: {
            message: "Admin login fail: account not found",
          }
        });
      } else {
        res.json({
          success: false,
          error: {
            message: "Login fail: DB error",
          }
        });
      }
    } catch (error) {
      res.status(405).json({ "result": "login fail" });
    }
  }

  updateUserInfo = async (req, res) => {
    // const { userId, userName, email, gender, phone, password } = req.body;        // 取得用戶輸入資料 winnie
    const { userName, email, gender, phone, password } = req.body;        // 取得用戶輸入資料 winnie
    if (userName === '' & email === '' & gender === '' & phone === '' & password === '') {
      res.json({
        success: false,
        error: {
          message: "updateUserInfo fail: params null",
        }
      });
    }
    else {
      try {
        /*winnie start*/
        const userId = await authModel.readToken(req);
        if (userId === "") {  // 驗證登入失敗
          res.json({
            success: false,
            error: {
              message: "Token error",
            }
          });
        } else {  // 驗證登入成功
          /*winnie end*/
          const result = await userModel.updateUser(userId, userName, email, gender, phone, password); // 
          if (result) {
            res.json({
              success: true,
              data: result
            });
          } else {
            res.json({
              success: false,
              error: {
                message: "updateUserInfo fail: updateUser fail",
              }
            });
          }
          //}  
        }//winnie
      } catch (error) {
        res.status(405).json({
          success: false,
          error: {
            message: "updateUserInfo fail: 斷開API連接",
          }
        });
      }
    }
  }

  applyForDriver = async (req, res) => {
    // const { userId, carId, seat, charge, category } = req.body;        // 取得用戶輸入資料 winnie
    const { carId, seat, charge, category } = req.body;        // 取得用戶輸入資料 winnie
    try {
      /*winnie start*/
      const userId = await authModel.readToken(req);
      if (userId === "") {  // 驗證登入失敗
        res.json({
          success: false,
          error: {
            message: "Token error",
          }
        });
      } else {  // 驗證登入成功
        /*winnie end*/
        const driverExist = await activityModel.readDriverId(userId); // 檢查司機是否存在
        if (driverExist) {
          res.json({
            success: false,
            error: {
              message: "Apply For Driver fail: 你已經有司機身分了",
            }
          });
        } else {
          const result = await userModel.createDriver(userId, carId, seat, charge, category); // 創建司機身分
          if (result) {
            res.json({
              success: true,
            });
          } else {
            res.json({
              success: false,
              error: {
                message: "Apply For Driver fail : DB error",
              }
            });
          }
        }
      }//winnie
    } catch (error) {
      res.status(405).json({ "result": "Apply For Driver fail" });
    }
  }

  showMyAct_P = async (req, res) => { //顯示我的活動
    // const { userId } = req.body; //winnie
    try {
      /*winnie start*/
      const userId = await authModel.readToken(req);
      if (userId === "") {  // 驗證登入失敗
        res.json({
          success: false,
          error: {
            message: "Token error",
          }
        });
      } else {  // 驗證登入成功
        /*winnie end*/
        // 獲取由用戶創建的報告
        const result = await userModel.getPassengerHistory(userId);
        if (result) {
          // 回應檢索到的報告
          res.json({ success: true, result });
          //res.json(result);
        }

        else {
          res.json({
            success: false,
            error: {
              message: "showMyAct_P fail:getPassengerHistory fail",
            }
          });
        }
      }//winnie
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "showMyAct_P fail: 斷開API連接",
        }
      });
      console.log(error);
    }
  }


  showMyAct_D = async (req, res) => {
    // const { userId } = req.body; //winnie
    try {
      /*winnie start*/
      const userId = await authModel.readToken(req);
      if (userId === "") {  // 驗證登入失敗
        res.json({
          success: false,
          error: {
            message: "Token error",
          }
        });
      } else {  // 驗證登入成功
        /*winnie end*/
        // 獲取由用戶創建的報告
        const result = await userModel.getDriverHistory(userId);
        if (result) {
          // 回應檢索到的報告
          res.json({ success: true, result });
          //res.json(result);
        }

        else {
          res.json({
            success: false,
            error: {
              message: "showMyAct_D fail:getDriverHistory fail",
            }
          });
        }
      }//winnie
    } catch (error) {
      res.status(405).json({
        success: false,
        error: {
          message: "showMyAct_D fail: 斷開API連接",
        }
      });
      console.log(error);
    }
  }

  showMyCar = async (req, res) => {
    //const { userId } = req.body;        // 取得用戶輸入資料 winnie 
    try {
      /*winnid start*/
      const userId = await authModel.readToken(req);
      if (userId === "") {  // 驗證登入失敗
        res.json({
          success: false,
          error: {
            message: "Token error",
          }
        });
      } else {  // 驗證登入成功
        /*winnid end*/
        const result = await userModel.readCarInfo(userId); // 檢查使用者是否於黑名單當中
        if (result) {
          res.json({
            success: true,
            data: result
          });
        } else {
          res.json({
            success: false,
            error: {
              message: "Show My Car fail: DB error",
            }
          });
        }
      }//winnie
    } catch (error) {
      res.status(405).json({ "result": "login fail" });
    }
  }
}

module.exports = new UserController();
