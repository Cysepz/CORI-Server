const express = require('express');
const bodyParser = require('body-parser');
const userModel = require('../models/userModel');

const router = express.Router();
router.use(bodyParser.json());

class UserController{
  signup = async (req, res) => {
    const { userId, username, gender, email, phone, password } = req.body;        // 取得用戶輸入資料
    const duplicateUser = await userModel.readUserId(userId); // 帳號重複檢查
    try {
      if (duplicateUser) {
        res.json({ "result": "Duplicate User" });
      } else {
        const result = await userModel.createUser(userId, username, gender, email, phone, password);
        if (result) {
          res.json(result);
        } else {
          res.status(405).json({ "result": "signup fail" });
        }
      }
    } catch (error) {
      res.status(405).json({ "result": "signup fail" });
      console.log(error);
    }      
  }

  login = async (req, res) => {
    const { userId, password } = req.body;        // 取得用戶輸入資料
    try {
      const result = await userModel.readUserIdPwd(userId, password);
      // req.session.userId=result[0].userId;
      if(result) {
        res.json(result[0]);
      } else {
        res.status(405).json({ "result": "login fail" });
      }
    } catch (error) {
      res.status(405).json({ "result": "login fail" });
      console.log(error);
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
