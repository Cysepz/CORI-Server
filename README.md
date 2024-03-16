# CORI
## Introduction
* CORI 為中央學生專用共乘平台，採用 Node.js 作為後端開發環境，此連結用於儲存 CORI 後端程式碼
* 前端程式碼連結https://github.com/SYUAN-NI/Carpool-in-NCU.git

### 發展
由於中央大學（中壢）地處偏僻，公車司機又愛好自由，導致中央的學生經常無法順利搭乘大眾運輸工具踏上回家的路。
目前校內缺乏一個系統性的共乘平台，僅有「中央共乘」的 Line 群組供同學留言預約共乘行程，故中央資管系的同學決定動手打造專屬校內學生的共乘平台，如此，想要回家的學生只需要在平台上動動手指，就可以預約並找到共乘夥伴一起平安回家了。

### 功能
- 註冊登入、修改會員資訊
- 註冊成為司機
- 新增共乘活動
- 查詢共乘活動
- 檢舉

## Installation
### 下載檔案（前後端）
- 前端：`git clone https://github.com/SYUAN-NI/Carpool-in-NCU.git`
- 後端：`git clone https://github.com/Cysepz/CORI-Server.git`

### 環境安裝
Node.js 安裝
- [Node.js 安裝包](https://nodejs.org/en/)

Express
- `npm install express-generator -g`
- 選擇架構 `express --view=ejs`
- 安裝套件 `npm install`
  > 注意：要在正確的專案路徑底下輸入此指令
- 設定環境變數
  - 安裝 dotenv
    - `npm install dotenv`
  - 建立 `.env` 文件：在專案根目錄下創建一個名為 `[fileName].env` 的文件，並在其中設定環境變數，例如
    ```
    PORT=3000
    DB_USER=mydatabaseuser
    DB_PASSWORD=mypassword
    ```
    > 注意：.env 文件中的變數不區分大小寫

## Usage
- 進入專案資料夾
- `npm run start`

## Contributing
- 設計文件：王宣筑、楊晴閔
- 前端：塗家瑋、傅宣妮
- 後端：朱珮瑜、吳文心
