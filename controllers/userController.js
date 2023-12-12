const express = require('express');
const bodyParser = require('body-parser');
const userModel = require('../models/userModel');

const router = express.Router();
router.use(bodyParser.json());

class UserController{
  signup = async (req, res) => {
    const { userId, username, gender, email, phone, password, scanRes} = req.body;  // 取得用戶輸入資料
    try {
      const duplicateUser = await userModel.readUserId(userId); // 帳號重複檢查
      if (duplicateUser) {
        res.json({
          success: false,
          error: {
            message: "Signup fail: duplicate user",
          }
        });
      } else if (userId === scanRes){ // 檢查學生證掃描結果
          const result = await userModel.createUser(userId, username, gender, email, phone, password);  // 創建使用者
          if (result) {
            res.json({
              success: true,
              // data: result
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
      else {
        res.json({
          success: false,
          error: {
            message: "Signup fail: ID mismatch",
          }
        });
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
      } else if(result === 0){
        res.json({
          success: true,
          data: {
            token: userId,
          }
        });
      } else if(result === 1){
        res.json({
          success: false,
          error: {
            message: "Login fail: Wrong password",
          }
        });
      } else if(result === 2){
        res.json({
          success: false,
          error: {
            message: "Login fail: account not found",
          }
        });
      } else{
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
}

exports.getAll = (req, res) => {
  const users = todoModel.getAll()
  res.send({
      status: 'Success',
      users,
  });
};


module.exports = new UserController();
