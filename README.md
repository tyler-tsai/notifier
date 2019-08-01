# lnb_notify

## 簡介

投資信用貸款平台[LNB](https://lnb.com.tw "LNB")時，常常沒空瀏覽網頁而錯過優質案件，使用這個 notifier 在新案件上架時能夠在 line 收到通知，即時挑選有興趣的案件。

## 使用教學

- 建立[IFTTT](https://ifttt.com/ "IFTTT")帳號
- 將 IFTTT 與 Line 進行連結
- 在 IFTTT 使用者導覽列的地方，點擊 create
- 出現 if this then that，this 選擇 webhooks，that 選擇 line
- 獲取 webhooks 的 url
- 完成 codebase
- 上傳 codebase 到 heroku，使用他們的 worker 服務
  * 首先註冊heroku帳號
  * 建立一個空專案
  * 自行建立一個nodejs projec在本地端後，上傳到heroku

    ```
     $ cd ~/my-project
     
     //在my-project裡建立一個node.js專案
     $ npm install
     
     //安裝package "request"
     $ npm install request
     
     //創建一個case.json檔案，格式必須是 {"caseString":[]}
     $ echo '{"caseString":[]}' > test.json
     
     //創建Procfile，告訴heroku使用worker
     $ echo 'worker: node index.js' > Procfile
     
     //創建 index.js，將主程式貼
     
     //上傳至heroku
     $ git add .
     $ git commit 'first commit'
     $ git push heroku master //部署完成
     
    ```
    
- 將 heroku 專案綁定 github 的 repository，完成 CD

### IFTTT webhooks 設定說明

- 打開自己的 webhooks 服務
- 點擊右上角的設定
- send Message 的 Recipient 選擇要送通知的人或群組
- send Message 的 Message 為通知格式，[與此處對應](#參數格式)

```html
{{Value1}}<br />
{{Value2}}<br />
{{Value3}}
```

### codebase 說明

- [主程式連結](./index.js)
- 獲取 lnb 申貸列表
  - `apr_min為最低利率`
  - `per_page為每頁獲取案件數`
  - `page為獲取頁數`
  - `order_by及order_dir為排序方式`

```json
https://www.lnb.com.tw/api/market-place?apr_min=8&source=complex&page=1&per_page=50&order_by=back_before&order_dir=desc&sendback=4
```

- 將需要推播的資料打進從 IFTTT 拿到的 webhooks URL

- ### 參數格式

#### 需與 webhooks 服務設定的格式對應

```js
request.post("https://maker.ifttt.com/trigger/song/with/key/{key}", {
  form: {
    value1: `<br>🔔利率 : ${apr}(${lender_irr}） <br>🔔期數 : ${period} <br><br>${purpose}/${
      loan_detail.age !== null ? loan_detail.age : "不能說的秘密"
    }(${loan_detail.gender === "male" ? "男" : "女"})/${
      loan_detail.company_title
    }(${loan_detail.company_seniority})<br>`,
    value2: description,
    value3: "<br>🔔前往投資：https://www.lnb.com.tw/market-place/loan/" + serial
  }
});
```

> 參考資源 https://www.oxxostudio.tw/articles/201803/ifttt-line.html
