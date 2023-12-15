const express = require('express');
const bodyParser = require('body-parser');
const permissionModel = require('../models/permissionModel');

const router = express.Router();
router.use(bodyParser.json());

class PermissionController {
    showAllBlacklist = async (req, res) => {  //顯示所有黑名單(管理員)
        //抓管理員user_id
        const { userId } = req.body;
        try {
            const checkadmin = await permissionModel.readAdmin(userId);
            if (checkadmin) {
                // 獲取由用戶創建的報告
                const result = await permissionModel.getAllBlacklist(userId);
                if (result) {
                    // 回應檢索到的報告
                    res.json({ success: true, result });
                    //res.json(result);
                }

                else {
                    res.json({
                        success: false,
                        error: {
                            message: "showAllBlacklist fail:getAllBlacklist fail",
                        }
                    });
                }
            }
            else {
                res.json({
                    success: false,
                    error: {
                        message: "showAllBlacklist fail:you are not admin",
                    }
                });
            }

        } catch (error) {
            res.status(405).json({
                success: false,
                error: {
                    message: "showAllBlacklist fail: 斷開API連接",
                }
            });
            console.log(error);
        }
    }

    recoverUser = async (req, res) => { // 管理員復權使用者
        const { userId } = req.body;
        try {
            const checkadmin = await permissionModel.readAdmin(userId);
            if (checkadmin) {
                // const result = await permissionModel.getRecoverUser();
                // if (result == 1) { //復權時間小於現在時間資料
                // 回應成功消息 
                const recoverdata = await permissionModel.updateRecoverUser();
                if (recoverdata) {
                    //res.json({ "result": " recover user success" });
                    res.json({
                        success: true
                    });
                }
                else {
                    res.json({
                        success: false,
                        error: {
                            message: "recoverUser fail:recover user fail",
                        }
                    });
                }

                //}
                // else {
                //     res.json({
                //         success: false,
                //         error: {
                //             message: "recoverUser fail:getRecoverUser fail",
                //         }
                //     });
                // }
            }
            else {
                res.json({
                    success: false,
                    error: {
                        message: "recoverUser fail:you are not admin",
                    }
                });
            }

        } catch (error) {
            res.status(405).json({
                success: false,
                error: {
                    message: "recoverUser fail",
                }
            });
            console.log(error);
        }
    }


}


module.exports = new PermissionController();
