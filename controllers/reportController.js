const express = require('express');
const bodyParser = require('body-parser');
//const userModel = require('../models/userModel');  winnie
const reportModel = require('../models/reportModel'); //winnie
const authModel = require('../models/authModel'); //winnie

const router = express.Router();
router.use(bodyParser.json());

class ReportController {  //winnie
    addReport = async (req, res) => { //新增檢舉
        // const { rideshareid, respondent, content, userId } = req.body;    // 取得用戶輸入檢舉資料 winnie
        const { rideshareid, respondent, content } = req.body;    // 取得用戶輸入檢舉資料 winnie
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
                if (respondent === userId) {
                    res.json({
                        success: false,
                        error: {
                            message: "addReport fail:respondent and informant can not be the same person",
                        }
                    });
                }
                else {
                    const blacklistStatus = await reportModel.readBlacklistStatus(respondent); //被檢舉人是否停權
                    console.log(blacklistStatus);
                    if (blacklistStatus) { //如果黑名單的人已經被停權
                        res.json({ "result": "respondent has been suspended" });
                    }
                    else {
                        const rideshareExist = await reportModel.readRideshareid(rideshareid, respondent, userId); //行程編號是否存在
                        console.log(rideshareExist);
                        if (rideshareExist == 1) {//行程編號不存在
                            res.json({ "result": "Rideshareid didn't exist" });
                        }
                        else {
                            console.log(respondent);
                            const respondentExist = await reportModel.readRideshareCheck(rideshareid, respondent); //被檢舉人是否有這個行程
                            if (respondentExist == 3) {
                                res.json({ "result": "respondent is not related to this rideshareid" });//被檢舉人不存在在行程裡
                            }
                            else {

                                const informantExist = await reportModel.readRideshareCheck(rideshareid, userId); //檢舉人是否在這個行程
                                if (informantExist == 3) {
                                    res.json({ "result": "you are not in this rideshareid" });//檢舉人不存在在行程裡
                                }
                                else {

                                    const checkExistReport = await reportModel.checkDupliExistReport(rideshareid, respondent, userId);//檢舉人是否重複檢舉別人
                                    if (checkExistReport == 6) {
                                        res.json({
                                            success: false,
                                            error: {
                                                message: "addReport fail:you have already reported this person",
                                            }
                                        });
                                    }
                                    else {
                                        const result = await reportModel.createReport(rideshareid, respondent, userId);//新增至檢舉資料表
                                        if (result) {
                                            res.json({
                                                success: true,
                                                data: result
                                            });
                                        } else {
                                            res.json({
                                                success: false,
                                                error: {
                                                    message: "addReport fail:Insert DB fail",
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }//winnie
        } catch (error) {
            res.status(405).json({
                success: false,
                error: {
                    message: "addReport fail:disconnect api",
                }
            });

            console.log(error);
        }
    }

    showMyReport = async (req, res) => {  //顯示我檢舉歷史紀錄
        //const { userId } = req.body; // 假設您在請求主體中傳遞了行程編號、被檢舉者、內容

        try {
            const userId = await authModel.readToken(req);
            if (userId === "") {  // 驗證登入失敗
                res.json({
                    success: false,
                    error: {
                        message: "Token error",
                    }
                });
            } else {  // 驗證登入成功
                const result = await reportModel.getMyReports(userId);  // 獲取使用者歷史檢舉資料
                if (result) {
                    res.json({
                        success: true,
                        data: result
                    });
                }
                else {
                    res.json({
                        success: false,
                        error: {
                            message: "showMyReport fail:getMyReport fail",
                        }
                    });
                }
            }

        } catch (error) {
            res.status(405).json({
                success: false,
                error: {
                    message: "showMyReport fail: 斷開API連接",
                }
            });
            console.log(error);
        }
    }

    showAllReport = async (req, res) => {  //顯示所有未審核檢舉資料(管理員)
        //const { userId } = req.body; // 假設您在請求主體中傳遞了行程編號、被檢舉者、內容 winnie
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
                const checkadmin = await reportModel.readAdmin(userId);
                if (checkadmin) {

                    const result = await reportModel.getAllReports();// 獲取還沒審核過的檢舉資料給管理員
                    if (result) {
                        //res.json({ success: true, result });
                        res.json({
                            success: true,
                            data: result
                        });

                    }
                    else {
                        res.json({
                            success: false,
                            error: {
                                message: "showAllReport fail:getAllReport fail",
                            }
                        });
                    }
                }
                else {
                    res.json({
                        success: false,
                        error: {
                            message: "showAllReport fail:you are not admin",
                        }
                    });
                }
            }//winnie
        } catch (error) {
            res.status(405).json({
                success: false,
                error: {
                    message: "showAllReport fail: 斷開API連接",
                }
            });
            console.log(error);
        }
    }

    reportPass = async (req, res) => { // 管理員審核檢舉通過
        //const { reportId } = req.params; // 假設 reportId 是檢舉報告的唯一識別符
        const { reportId, respondent } = req.body;
        try {
            const result = await reportModel.readBlacklist(respondent); //檢查被檢舉者是否已在黑名單
            if (result == 1) { //被檢舉者已在黑名單
                const respondentexist = await reportModel.updateBlacklist(respondent); //更新黑名單count+1
                if (respondentexist) { //更新成功
                    //res.json({ success: true, respondentexist });
                    const countnum = await reportModel.readCount(respondent); //檢查次數是否大於3
                    if (countnum == 1) { //大於三
                        const modifyBlacklist = await reportModel.updateSusRes(respondent); //更新黑名單count、status、sus_time、res_time
                        if (modifyBlacklist) { //更新黑名單table成功
                            const modifyReport = await reportModel.updateReportStatus(reportId, respondent); //更新檢舉資料表status
                            if (modifyReport) {
                                res.json({
                                    success: true //, result
                                });
                            }
                            else {
                                res.json({
                                    success: false,
                                    error: {
                                        message: "reportPass fail:updateReportStatus fail",
                                    }
                                });
                            }
                        }
                        else {
                            res.json({
                                success: false,
                                error: {
                                    message: "reportPass fail:updateSusRes fail",
                                }
                            });
                        }
                    }
                    else {
                        const modifyReport = await reportModel.updateReportStatus(reportId, respondent); //更新檢舉資料表status
                        if (modifyReport) {
                            res.json({
                                success: true //, result
                            });
                        }
                        else {
                            res.json({
                                success: false,
                                error: {
                                    message: "reportPass fail:updateReportStatus fail",
                                }
                            });
                        }
                        // res.json({
                        //     success: true
                        //     // error: {
                        //     //     message: "count<3",
                        //     // }
                        // });
                    }
                }
                else {
                    res.json({
                        success: false,
                        error: {
                            message: "reportPass fail:updateBlacklist fail",
                        }
                    });
                }
                //res.json({ "result": " report update status:unpass" });
            }
            else if (result == 2) {//被檢舉者不在黑名單
                const respondentcreate = await reportModel.createBlacklist(respondent); //新增黑名單
                if (respondentcreate) {
                    const modifyReport = await reportModel.updateReportStatus(reportId, respondent); //更新檢舉資料表status
                    if (modifyReport) {
                        res.json({
                            success: true //, result
                        });
                    }
                    else {
                        res.json({
                            success: false,
                            error: {
                                message: "reportPass fail:updateReportStatus fail",
                            }
                        });
                    }
                }
                else {
                    res.json({
                        success: false,
                        error: {
                            message: "reportPass fail:createBlacklist fail",
                        }
                    });
                }
            }
            else {
                res.json({
                    success: false,
                    error: {
                        message: "reportPass fail:readBlacklist fail",
                    }
                });
            }

        } catch (error) {
            res.status(405).json({
                success: false,
                error: {
                    message: "reportPass fail: 斷開API連接",
                }
            });
            console.log(error);
        }
    }



    reportUnpass = async (req, res) => { // 管理員審核檢舉不通過
        //const { reportId } = req.params; // 假設 reportId 是檢舉報告的唯一識別符
        const { reportId, respondent } = req.body;
        try {
            // 更新資料庫中檢舉報告的審核狀態為通過
            const result = await reportModel.updateReportUnpass(reportId, respondent);
            if (result) {
                // 回應成功消息
                res.json({
                    success: true
                });
            }
            else {
                res.json({
                    success: false,
                    error: {
                        message: "reportUnpass fail:updateReportUnpass fail",
                    }
                });
            }

        } catch (error) {
            res.status(405).json({
                success: false,
                error: {
                    message: "reportUnpass fail: 斷開API連接",
                }
            });
            console.log(error);
        }
    }

}



module.exports = new ReportController();
