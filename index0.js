MINIMUM_SALE = 0;
MINIMUM_OFFER = 0;


const rwClient = require("./twitterClient.js")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const { convertFile}  = require('convert-svg-to-png');

var tweetlist = new Array();

async function main(){

    await readlist();
    while(true){
      for (let i = 0; i < 10; i++) {
        await checkSales(i);
        await sleep(100)
    }
    for (let i = 0; i < 10; i++) {
      await checkOffers(i);
      await sleep(100)
  }

        await sleep(15000)
    }
    
}

async function tweet(text,name,bid){
    try{
        await readWriteAsync(name,bid);
        await sleep (3000)
        media = await rwClient.v1.uploadMedia("image.png") 
        await rwClient.v1.tweet( (text + "\n"+ "\n"+ "\n" + "https://www.ens.vision/name/"+name),
        {
            card_uri: 'tombstone://card',
            media_ids: media
        })

    }catch(e){
        console.log(e)
    }
}

async function readWriteAsync(name,bid) {
  var file;
  if(bid){
    file = 'bid.svg'
  }
  else{
    file = 'sale.svg'
  }

  fs.readFile(file, 'utf-8', function(err, data){
    if (err) throw err;

    var newValue = data.replace("_placeholder" ,name);
   
    fs.writeFile('image.svg', newValue, 'utf-8', function (err) {
      if (err) throw err;
      console.log('filelistAsync complete');
    });
  });

  await sleep(100)

  const inputFilePath = 'image.svg'
  const outputFilePath = await convertFile(inputFilePath);
}

async function checkOffers(i){
  try{
      var responseEvents;
      await fetch("https://dnlout9nnyfi.usemoralis.com:2053/server/functions/load_name_offers", {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US,en-GB;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "text/plain",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "Referer": "https://www.ens.vision/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"pageIndex\":0,\"sortDir\":\"desc\",\"sortBy\":\"validFrom\",\"_ApplicationId\":\"MkQTnBTXRkHAoMZSYQyy1mzle70Bjih1LWEXXcue\",\"_ClientVersion\":\"js1.9.1\",\"_InstallationId\":\"fdbdc29f-cc19-4d39-9361-f3addc3e90ec\"}",
        "method": "POST"
      }).then((response) => response.json())
      .then((response) => { responseEvents = response;
      })
  

      for (let i = 0; i < responseEvents.result.data.length; i++) {
          if(responseEvents.result.data[i].ens.name.includes("0x") && responseEvents.result.data[i].price >= MINIMUM_OFFER){
            var name =responseEvents.result.data[i].ens.name
            var offer =responseEvents.result.data[i].price
            var source = responseEvents.result.data[i].source
            var orderId = responseEvents.result.data[i].orderId
            var text = name + ".eth has a new offer of "+offer+" WETH on "+source+" #ENS #ensdomains #EnsNames"

            if(!text.includes(null) && !tweetlist.includes(orderId)){   
                await tweet(text,name,true)
                tweetlist.push(orderId)   
                writeFile(orderId)
                await sleep (1000)
            }
          }


         
     }
  }
  catch(e){
      console.log(e)
  }
 
}

async function checkSales(i){
    try{
        var responseEvents;
        await fetch("https://dnlout9nnyfi.usemoralis.com:2053/server/functions/load_name_events", {
          "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en-GB;q=0.9,en;q=0.8",
            "cache-control": "no-cache",
            "content-type": "text/plain",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://www.ens.vision/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          "body": "{\"sortBy\":\"createdDate\",\"sortDir\":\"desc\",\"limit\":50,\"pageIndex\":"+i+",\"_ApplicationId\":\"MkQTnBTXRkHAoMZSYQyy1mzle70Bjih1LWEXXcue\",\"_ClientVersion\":\"js1.9.1\",\"_InstallationId\":\"fdbdc29f-cc19-4d39-9361-f3addc3e90ec\"}",
          "method": "POST"
        }).then((response) => response.json())
        .then((response) => { responseEvents = response;
        })
    
        for (let i = 0; i < responseEvents.result.data.length; i++) {
            var name =responseEvents.result.data[i].ens.name
            var sale =responseEvents.result.data[i].totalPrice/1e+18
            var source = responseEvents.result.data[i].orderSource
            var token = responseEvents.result.data[i].paymentToken
            var text = name+" bought for "+sale+" "+token+" on "+source+" #ENS #ensdomains #EnsNames"

         
            if(!text.includes(null) && name.includes("0x") && !tweetlist.includes(text)){
                tweetlist.push(text)   
                writeFile(text)
                await tweet(text,name,false)
                await sleep (1000)
            }   
       }
    }
    catch(e){
        console.log(e)
    }
   
  }

  async function writeFile(txt){
    console.log(txt)
    fs.readFile('tweetlist.txt', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data+txt+"\n";
      
        fs.writeFileSync('tweetlist.txt', result, 'utf8', function (err) {
           if (err) return console.log(err);
        });
      });
  }

  async function readlist() {

    console.log(`readlist `);
    try {
      const {readFileSync, promises: fsPromises} = require('fs');
  
      const contents = await fsPromises.readFile("tweetlist.txt", 'utf-8');
  
      tweetlist = contents.split(/\r?\n/);
  
      console.log(tweetlist); 
  
    } catch (err) {
      console.log(err);
    }
  
  
  }

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }


main();