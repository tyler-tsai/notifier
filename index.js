var request = require("request");
var fs = require("fs");
let serialString = "";
const callApi = () => {
  let cases = JSON.parse(fs.readFileSync("./case.json"));
  let casesList = cases.caseString;

  //獲取 lnb 申貸列表
  request.get(
    "https://www.lnb.com.tw/api/market-place?apr_min=8&source=complex&page=1&per_page=50&order_by=back_before&order_dir=desc&sendback=4",
    { json: true },
    function(err, res, body) {
      const index = body.data.findIndex(item => item.lender_fee_off === 0);
      let j = 0;
      for (var i = index; i <= index + 4; i++) {
        const {
          apr,
          lender_irr,
          period,
          purpose,
          loan_detail,
          serial,
          description,
          back_before
        } = body.data[i];
        const timePast =
          60 - (new Date(back_before).getTime() - Date.now()) / 86400 / 1000;
        if (
          timePast < 1 &&
          serialString.indexOf(serial) === -1 &&
          cases.caseString.indexOf(serial) === -1
        ) {
          j++;
          setTimeout(() => {
            casesList.push(serial);
            fs.writeFileSync(
              "case.json",
              JSON.stringify(
                { caseString: casesList },
                (function(err) {
                  if (err) throw err;
                  console.log("done");
                })()
              )
            );
            //將需要推播的資料打進從 IFTTT 拿到的 webhooks URL
            //將webhooks的key值放到URL尾端
            request.post(
              "https://maker.ifttt.com/trigger/{name}/with/key/{key}",
              {
                form: {
                  value1: `<br>🔔利率 : ${apr}(${lender_irr}） <br>🔔期數 : ${period} <br><br>${purpose}/${
                    loan_detail.age !== null ? loan_detail.age : "不能說的秘密"
                  }(${loan_detail.gender === "male" ? "男" : "女"})/${
                    loan_detail.company_title
                  }(${loan_detail.company_seniority})<br>`,
                  value2: description,
                  value3:
                    "<br>🔔前往投資：https://www.lnb.com.tw/market-place/loan/" +
                    serial
                }
              }
            );
            serialString += serial;
          }, j * 1000);
        }
      }
    }
  );
};

callApi();
setInterval(callApi, 40000);
