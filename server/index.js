const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let salt_key = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
let merchant_id = 'PGTESTPAYUAT';

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.post('/order', async (req, res) => {
    try {
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: req.body.transactionId,
            name: req.body.name,
            amount: req.body.amount*1000,
            redirectUrl: `http://localhost:3000/status?id=${req.body.transactionId}`,
            redirectMode: 'POST',
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        }

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const hash = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = hash + '###' + keyIndex;

        //const prod_url = 'https://api.phonepe.com/apis/hermes/pg/v1/pay';
        const prod_url = 'https://api-preprod.phonepe.com/apis/pg-sandbocx/pg/v1/pay';

        const options = {
            method: 'POST',
            url: prod_url,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        }
        await axios(options).then(function (response) {
            console.log(response.data);
            return res.json(response.data);
        }).catch(function (error) {
            console.log(error);
        });

    }catch (error) {
        console.log(error);
    }
})

app.post('/status', async (req, res) => {

    const merchantTransactionId = req.query.id;
    const merchantId = merchant_id;

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}${salt_key}`;
    const hash = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = hash + '###' + keyIndex;

    const options = {
        method: 'GET',
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }

    }

    axios.request(options).then(function (response) {
       if (response.data.success === true){
           const url = `http://localhost:3000/success?id=${merchantTransactionId}`;
           return res.redirect(url);
       } else {
              const url = `http://localhost:3000/failure?id=${merchantTransactionId}`;
              return res.redirect(url);
       }
    }).catch(function (error) {
        console.error(error);
    });
})

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});